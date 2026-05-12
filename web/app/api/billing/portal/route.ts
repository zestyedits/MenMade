import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { getStripe } from "../../../lib/stripe";
import { getClientIp, rateLimit } from "../../../lib/rate-limit";

/**
 * POST /api/billing/portal
 *
 * Creates a Stripe Customer Portal session for the current user and
 * returns the URL. The portal is where users update card details,
 * change plans, and cancel — Stripe handles all of that UI.
 *
 * Requires a stripe_customer_id on the user's subscriptions row.
 * Free users get a 400 — there's nothing to manage.
 */

export async function POST(request: NextRequest) {
  // ---------- Rate limit ----------
  const ip = getClientIp(request);
  const verdict = rateLimit({
    bucketKey: "billing-portal",
    ip,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (!verdict.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Slow down." },
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

  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { ok: false, error: "No billing record on file." },
      { status: 400 },
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    request.nextUrl.origin ??
    "http://localhost:3000";

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${appUrl}/settings/billing`,
    });
    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("[billing/portal] create failed:", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't open billing portal. Try again shortly." },
      { status: 502 },
    );
  }
}
