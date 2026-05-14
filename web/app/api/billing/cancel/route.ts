import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { getStripe } from "../../../lib/stripe";
import { getClientIp, rateLimit } from "../../../lib/rate-limit";

/**
 * POST /api/billing/cancel
 *
 * Marks the user's Stripe subscription with cancel_at_period_end=true.
 * They keep their plan until current_period_end; Stripe stops charging
 * after that. The webhook handler picks up customer.subscription.updated
 * and customer.subscription.deleted to keep our `subscriptions` row in
 * sync; we ALSO write the cancel_at_period_end flag locally here so
 * the UI updates immediately without waiting for the webhook round-trip.
 *
 * Founder's Pass holders can't reach this route — the UI only renders
 * the cancel option for operator-monthly / operator-annual.
 *
 * Rate-limited to 5 attempts / 10 min per IP. A higher cadence would
 * imply someone trying to bypass our soft-cancel logic; let them through
 * the portal if they really want immediate cancellation.
 */

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const verdict = rateLimit({
    bucketKey: "billing-cancel",
    ip,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!verdict.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many cancel attempts. Try again shortly." },
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
    .select("plan, stripe_subscription_id, cancel_at_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sub || !sub.stripe_subscription_id) {
    return NextResponse.json(
      { ok: false, error: "No active subscription to cancel." },
      { status: 400 },
    );
  }
  if (sub.plan === "founder") {
    return NextResponse.json(
      { ok: false, error: "Founder's Pass is a one-time purchase." },
      { status: 400 },
    );
  }
  if (sub.cancel_at_period_end) {
    return NextResponse.json(
      { ok: false, error: "Already scheduled to cancel." },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  try {
    const updated = await stripe.subscriptions.update(
      sub.stripe_subscription_id,
      { cancel_at_period_end: true },
    );
    // Optimistically reflect in our DB so the UI doesn't lag the webhook.
    await admin
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        status: updated.status,
      })
      .eq("user_id", user.id);

    return NextResponse.json({
      ok: true,
      endsAt: updated.current_period_end
        ? new Date(updated.current_period_end * 1000).toISOString()
        : null,
    });
  } catch (err) {
    console.error("[billing/cancel] Stripe update failed:", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't cancel right now. Try again shortly." },
      { status: 502 },
    );
  }
}
