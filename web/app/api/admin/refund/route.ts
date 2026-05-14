import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import { getAdminUser } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import { getStripe } from "../../../lib/stripe";

/**
 * POST /api/admin/refund
 *
 * Body: { userId: string }
 *
 * Enforces the LOCKED refund policy from project_pricing memory:
 *   - operator-monthly  → never refunds the current period. 400.
 *   - operator-annual   → full refund within 14 days of started_at.
 *                          After: 400. Cancels the Stripe subscription,
 *                          then refunds the latest invoice's charge.
 *   - founder           → full refund within 14 days of started_at.
 *                          After: 400. Refunds the original payment_intent
 *                          on the checkout session.
 *                          The founder seat STAYS CLAIMED (counter is
 *                          honest; we absorb the refund hit).
 *
 * Idempotency: we set subscriptions.status = 'refunded' after the Stripe
 * call succeeds. The charge.refunded webhook event will also try to set
 * it; the second write is a no-op.
 *
 * Auth: admin allowlist via getAdminUser(). 403 on miss. Origin
 * allow-list runs in proxy.ts before we get here.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

type SubRow = {
  user_id: string;
  plan: string;
  status: string;
  started_at: string | null;
  stripe_subscription_id: string | null;
  stripe_session_id: string | null;
  stripe_customer_id: string | null;
  founder_seat_number: number | null;
};

export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return json({ ok: false, error: "Not authorized." }, 403);
  }

  // ---------- input ----------
  let body: { userId?: unknown };
  try {
    body = (await request.json()) as { userId?: unknown };
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }
  const userId = typeof body.userId === "string" ? body.userId : "";
  if (!/^[0-9a-f-]{36}$/i.test(userId)) {
    return json({ ok: false, error: "Missing or malformed userId." }, 400);
  }

  const db = createAdminClient();

  const { data: subData, error: subErr } = await db
    .from("subscriptions")
    .select(
      "user_id,plan,status,started_at,stripe_subscription_id,stripe_session_id,stripe_customer_id,founder_seat_number",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (subErr) {
    console.error("[admin/refund] subscription lookup failed:", subErr);
    return json({ ok: false, error: "Couldn't read the subscription." }, 500);
  }
  const sub = subData as SubRow | null;
  if (!sub) {
    return json({ ok: false, error: "No subscription on file." }, 404);
  }

  // ---------- policy gate ----------
  if (sub.status !== "active" && sub.status !== "trialing") {
    return json(
      {
        ok: false,
        error: "Subscription isn't active. Nothing to refund.",
      },
      400,
    );
  }

  if (sub.plan === "operator-monthly") {
    return json(
      {
        ok: false,
        error:
          "Monthly subscriptions don't refund the current period. Cancel via the portal instead.",
      },
      400,
    );
  }

  if (sub.plan !== "operator-annual" && sub.plan !== "founder") {
    return json({ ok: false, error: "Unsupported plan." }, 400);
  }

  const startMs = sub.started_at ? Date.parse(sub.started_at) : NaN;
  if (!Number.isFinite(startMs)) {
    return json(
      { ok: false, error: "No start date recorded — can't gauge the window." },
      400,
    );
  }
  if (Date.now() - startMs > FOURTEEN_DAYS_MS) {
    return json(
      {
        ok: false,
        error: "Past the 14-day refund window. No refund per policy.",
      },
      400,
    );
  }

  const stripe = getStripe();

  // ---------- execute ----------
  try {
    let refund: Stripe.Refund;

    if (sub.plan === "founder") {
      // One-time payment. Pull the original session → payment_intent.
      if (!sub.stripe_session_id) {
        return json(
          {
            ok: false,
            error: "Founder row has no stripe_session_id. Refund via dashboard.",
          },
          400,
        );
      }
      const session = await stripe.checkout.sessions.retrieve(
        sub.stripe_session_id,
      );
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);
      if (!paymentIntentId) {
        return json(
          {
            ok: false,
            error: "No payment_intent on that session. Refund via dashboard.",
          },
          400,
        );
      }
      refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: "requested_by_customer",
        metadata: {
          user_id: sub.user_id,
          plan: sub.plan,
          issued_by: admin.email,
        },
      });
    } else {
      // operator-annual: cancel the subscription first, then refund the
      // latest invoice's charge. Cancelling first prevents another
      // renewal from firing mid-refund.
      if (!sub.stripe_subscription_id) {
        return json(
          {
            ok: false,
            error:
              "Annual row has no stripe_subscription_id. Refund via dashboard.",
          },
          400,
        );
      }
      const stripeSub = await stripe.subscriptions.cancel(
        sub.stripe_subscription_id,
      );
      const latestInvoiceId =
        typeof stripeSub.latest_invoice === "string"
          ? stripeSub.latest_invoice
          : (stripeSub.latest_invoice?.id ?? null);
      if (!latestInvoiceId) {
        return json(
          {
            ok: false,
            error: "No invoice on the subscription. Refund via dashboard.",
          },
          400,
        );
      }
      const invoice = await stripe.invoices.retrieve(latestInvoiceId);
      const chargeId =
        typeof (invoice as unknown as { charge?: unknown }).charge === "string"
          ? ((invoice as unknown as { charge: string }).charge)
          : null;
      if (!chargeId) {
        return json(
          {
            ok: false,
            error: "No charge on the latest invoice. Refund via dashboard.",
          },
          400,
        );
      }
      refund = await stripe.refunds.create({
        charge: chargeId,
        reason: "requested_by_customer",
        metadata: {
          user_id: sub.user_id,
          plan: sub.plan,
          issued_by: admin.email,
        },
      });
    }

    // ---------- flip our row ----------
    // Per locked pricing memory, the founder seat is NOT released here.
    // We only update the subscriptions row.
    const { error: updErr } = await db
      .from("subscriptions")
      .update({
        status: "refunded",
        cancel_at_period_end: false,
      })
      .eq("user_id", sub.user_id);

    if (updErr) {
      console.error(
        "[admin/refund] DB update failed after Stripe refund:",
        updErr,
      );
      // Don't bail — the refund went through. Surface a partial-success
      // message and let the webhook reconcile.
      return json(
        {
          ok: true,
          refundId: refund.id,
          amount: refund.amount,
          warning:
            "Refund succeeded at Stripe but local row update failed. Webhook will reconcile.",
        },
        200,
      );
    }

    return json({
      ok: true,
      refundId: refund.id,
      amount: refund.amount,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Stripe refund call failed.";
    console.error("[admin/refund] Stripe call threw:", err);
    return json({ ok: false, error: message }, 500);
  }
}
