import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { getStripe } from "../../../lib/stripe";
import { getClientIp, rateLimit } from "../../../lib/rate-limit";

/**
 * POST /api/billing/resume
 *
 * Undoes a scheduled cancellation by flipping cancel_at_period_end=false
 * on the Stripe subscription. Only valid before current_period_end has
 * elapsed — after that the subscription is fully canceled and the user
 * needs a new Checkout.
 */

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const verdict = rateLimit({
    bucketKey: "billing-resume",
    ip,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!verdict.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again shortly." },
      { status: 429 },
    );
  }

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
    .select("stripe_subscription_id, cancel_at_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sub || !sub.stripe_subscription_id) {
    return NextResponse.json(
      { ok: false, error: "No subscription to resume." },
      { status: 400 },
    );
  }
  if (!sub.cancel_at_period_end) {
    return NextResponse.json(
      { ok: false, error: "Subscription isn't scheduled to cancel." },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  try {
    const updated = await stripe.subscriptions.update(
      sub.stripe_subscription_id,
      { cancel_at_period_end: false },
    );
    await admin
      .from("subscriptions")
      .update({
        cancel_at_period_end: false,
        status: updated.status,
      })
      .eq("user_id", user.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[billing/resume] Stripe update failed:", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't resume right now. Try again shortly." },
      { status: 502 },
    );
  }
}
