import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { getStripe, getPriceId } from "../../../lib/stripe";
import { getClientIp, rateLimit } from "../../../lib/rate-limit";

/**
 * POST /api/billing/checkout
 *
 * Body: { price: 'operator-monthly' | 'operator-annual' | 'founders-pass' }
 *
 * Behavior:
 *  - Requires an authenticated user (server Supabase session).
 *  - For operator-* → Stripe Checkout in subscription mode.
 *  - For founders-pass → atomically reserves a seat (SKIP LOCKED),
 *    fails with `{ ok:false, error:'sold-out' }` if 500 already taken,
 *    then issues a one-time payment Checkout. The reserved seat
 *    carries the stripe_session_id; the webhook flips ownership to
 *    the user on checkout.session.completed.
 *  - Returns `{ url }` for the client to redirect into Stripe.
 *
 * Rate limit: 10 req / 10 min per IP. Checkout is cheap to abuse —
 * each call creates a Stripe session and (for founder) holds a seat
 * row. We let the webhook free abandoned seats via expires_at logic
 * (TODO: scheduled cleanup; for now seats with stripe_session_id
 * but null user_id are effectively orphaned after Stripe expiry).
 */

const ALLOWED_PRICES = new Set([
  "operator-monthly",
  "operator-annual",
  "founders-pass",
]);

type Body = { price?: unknown };

export async function POST(request: NextRequest) {
  // ---------- Rate limit ----------
  const ip = getClientIp(request);
  const verdict = rateLimit({
    bucketKey: "billing-checkout",
    ip,
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (!verdict.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many checkout attempts. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(verdict.retryAfterSeconds) },
      },
    );
  }

  // ---------- Auth ----------
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Sign in first." },
      { status: 401 },
    );
  }

  // ---------- Parse + validate ----------
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON." },
      { status: 400 },
    );
  }
  const price = typeof body.price === "string" ? body.price : "";
  if (!ALLOWED_PRICES.has(price)) {
    return NextResponse.json(
      { ok: false, error: "Unknown plan." },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const admin = createAdminClient();

  // Look up an existing Stripe customer for this user so we don't
  // create duplicates across multiple checkout attempts.
  const { data: existingSub } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  const existingCustomerId = existingSub?.stripe_customer_id ?? undefined;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    request.nextUrl.origin ??
    "http://localhost:3000";
  const successUrl = `${appUrl}/settings/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${appUrl}/settings/billing?checkout=canceled`;

  // ---------- Founder's Pass branch ----------
  if (price === "founders-pass") {
    // Atomically claim the lowest unclaimed seat. SKIP LOCKED makes
    // this safe under concurrent checkouts: each request grabs a
    // distinct row or gets none.
    //
    // We mark the seat with a placeholder stripe_session_id ('pending:<uuid>')
    // so a separate "release abandoned seats" cleanup can find rows
    // that never got finalized. The webhook overwrites this with
    // the real session ID when checkout completes.
    const { data: seatData, error: seatErr } = await admin.rpc(
      "claim_next_founder_seat",
      { p_user_id: user.id },
    );

    // Fallback: if the RPC isn't installed yet, do it inline. This
    // mirrors the SKIP LOCKED query but in two steps (not as tight
    // as a single PG transaction). Once the migration adds the RPC
    // function, that branch is preferred.
    let seatNumber: number | null = null;
    if (seatErr) {
      // Inline best-effort path: pick the lowest unclaimed seat
      // by user_id IS NULL and stripe_session_id IS NULL. Race-prone
      // but acceptable until the RPC ships.
      const { data: free } = await admin
        .from("founder_seats")
        .select("seat_number")
        .is("user_id", null)
        .is("stripe_session_id", null)
        .order("seat_number", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (!free) {
        return NextResponse.json(
          { ok: false, error: "sold-out" },
          { status: 409 },
        );
      }
      seatNumber = free.seat_number;
      // Mark as pending so a concurrent caller doesn't pick the same.
      const pendingTag = `pending:${user.id}:${Date.now()}`;
      const { error: holdErr } = await admin
        .from("founder_seats")
        .update({ stripe_session_id: pendingTag })
        .eq("seat_number", seatNumber)
        .is("user_id", null)
        .is("stripe_session_id", null);
      if (holdErr) {
        return NextResponse.json(
          { ok: false, error: "sold-out" },
          { status: 409 },
        );
      }
    } else if (seatData == null) {
      return NextResponse.json(
        { ok: false, error: "sold-out" },
        { status: 409 },
      );
    } else {
      seatNumber = seatData as number;
    }

    // Issue the one-time Checkout session.
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: getPriceId("founders-pass"), quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer: existingCustomerId,
        customer_email: existingCustomerId ? undefined : (user.email ?? undefined),
        client_reference_id: user.id,
        metadata: {
          user_id: user.id,
          plan: "founder",
          founder_seat_number: String(seatNumber),
        },
        payment_intent_data: {
          metadata: {
            user_id: user.id,
            plan: "founder",
            founder_seat_number: String(seatNumber),
          },
        },
      });

      // Tag the seat with the real session ID so the webhook can
      // match it back. If session.id collides with the unique
      // index, we have a deeper bug — let it bubble.
      await admin
        .from("founder_seats")
        .update({ stripe_session_id: session.id })
        .eq("seat_number", seatNumber);

      if (!session.url) {
        return NextResponse.json(
          { ok: false, error: "Stripe did not return a checkout URL." },
          { status: 502 },
        );
      }
      return NextResponse.json({ ok: true, url: session.url });
    } catch (err) {
      // Release the seat we tentatively held — payment failed before
      // we even left our server.
      await admin
        .from("founder_seats")
        .update({ stripe_session_id: null })
        .eq("seat_number", seatNumber)
        .is("user_id", null);
      console.error("[billing/checkout] founder session create failed:", err);
      return NextResponse.json(
        { ok: false, error: "Couldn't start checkout. Try again shortly." },
        { status: 502 },
      );
    }
  }

  // ---------- Operator (subscription) branch ----------
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: getPriceId(price as "operator-monthly" | "operator-annual"),
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: existingCustomerId,
      customer_email: existingCustomerId ? undefined : (user.email ?? undefined),
      client_reference_id: user.id,
      allow_promotion_codes: true,
      metadata: {
        user_id: user.id,
        plan: price,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan: price,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { ok: false, error: "Stripe did not return a checkout URL." },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("[billing/checkout] operator session create failed:", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't start checkout. Try again shortly." },
      { status: 502 },
    );
  }
}
