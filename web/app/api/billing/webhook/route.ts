import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "../../../lib/supabase/admin";
import { recordConcernSignal } from "../../../lib/admin-audit";
import { getStripe, getStripeWebhookSecret } from "../../../lib/stripe";

/**
 * POST /api/billing/webhook
 *
 * Stripe → MenMade webhook receiver. Trusted via signature (NOT via
 * user session — this endpoint is hit by Stripe's servers).
 *
 *  1. Read RAW request body (text). Do NOT parse as JSON before
 *     verifying — `stripe.webhooks.constructEvent` needs the exact
 *     bytes Stripe signed.
 *  2. Verify signature with the mode-resolved webhook secret
 *     (STRIPE_WEBHOOK_SECRET_TEST or _LIVE). Reject on mismatch.
 *  3. Idempotency: INSERT into stripe_events (id PK). On conflict,
 *     this is a duplicate delivery — return 200 immediately.
 *  4. Dispatch by event type. Use the service-role Supabase client
 *     (bypasses RLS).
 *
 * Per Stripe best practice, return 200 quickly. Anything that fails
 * non-fatally is logged and we still 200 — otherwise Stripe will
 * retry forever and we'll handle the same event 10x.
 *
 * Origin check in proxy.ts is bypassed: Stripe webhooks have no
 * Origin header so the proxy's `if (origin && ...)` branch skips them.
 */

// Force this route into the Node runtime — Stripe's signature
// verification uses crypto APIs that don't exist on the Edge runtime.
export const runtime = "nodejs";

// Mark dynamic so Next doesn't try to prerender or cache this route.
export const dynamic = "force-dynamic";

type Plan = "operator-monthly" | "operator-annual" | "founder";

function planFromMetadata(value: unknown): Plan | null {
  if (value === "operator-monthly") return "operator-monthly";
  if (value === "operator-annual") return "operator-annual";
  if (value === "founder") return "founder";
  if (value === "founders-pass") return "founder";
  return null;
}

function isoFromUnix(seconds: number | null | undefined): string | null {
  if (typeof seconds !== "number" || Number.isNaN(seconds)) return null;
  return new Date(seconds * 1000).toISOString();
}

export async function POST(request: NextRequest) {
  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    console.error(
      "[billing/webhook] webhook secret not set for active Stripe mode",
    );
    return new Response("Webhook secret not configured.", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header.", { status: 400 });
  }

  // Raw body — crucial. Reading as JSON would re-serialize and break
  // signature verification.
  const rawBody = await request.text();

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[billing/webhook] signature verification failed:", err);
    return new Response("Invalid signature.", { status: 400 });
  }

  const admin = createAdminClient();

  // ---------- Idempotency ----------
  // Insert first; on PK conflict (23505), this is a duplicate delivery.
  // Stripe retries aggressively and we don't want to double-finalize.
  const { error: idemErr } = await admin
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });
  if (idemErr) {
    // Duplicate row → already processed. Acknowledge so Stripe stops retrying.
    if (idemErr.code === "23505") {
      return new Response(JSON.stringify({ ok: true, deduped: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    console.error("[billing/webhook] idempotency insert failed:", idemErr);
    // Don't 500 — Stripe will retry and we'll keep failing. Better
    // to acknowledge and emit a Sentry alert (TODO Phase 4).
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  // ---------- Dispatch ----------
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          (session.metadata?.user_id as string | undefined) ??
          session.client_reference_id ??
          null;
        const plan = planFromMetadata(session.metadata?.plan);
        if (!userId || !plan) {
          console.warn(
            "[billing/webhook] checkout.session.completed missing metadata",
            { id: session.id },
          );
          break;
        }

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : (session.customer?.id ?? null);

        if (plan === "founder") {
          // Finalize seat: flip user_id + claimed_at on the row whose
          // stripe_session_id matches this session.
          const seatNumberStr = session.metadata?.founder_seat_number;
          const seatNumber = seatNumberStr ? Number(seatNumberStr) : null;

          if (seatNumber != null && Number.isFinite(seatNumber)) {
            await admin
              .from("founder_seats")
              .update({
                user_id: userId,
                claimed_at: new Date().toISOString(),
                stripe_session_id: session.id,
              })
              .eq("seat_number", seatNumber);
          }

          await admin.from("subscriptions").upsert(
            {
              user_id: userId,
              plan: "founder",
              status: "active",
              stripe_customer_id: customerId,
              stripe_subscription_id: null,
              founder_seat_number: seatNumber,
              started_at: new Date().toISOString(),
              current_period_end: null,
              cancel_at_period_end: false,
            },
            { onConflict: "user_id" },
          );
        } else {
          // Operator subscription — the customer.subscription.created
          // event will fire next with current_period_end. We still
          // upsert here to record the customer ID and plan immediately.
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : (session.subscription?.id ?? null);

          await admin.from("subscriptions").upsert(
            {
              user_id: userId,
              plan,
              status: "active",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              started_at: new Date().toISOString(),
              cancel_at_period_end: false,
            },
            { onConflict: "user_id" },
          );
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId =
          (sub.metadata?.user_id as string | undefined) ?? null;
        const plan = planFromMetadata(sub.metadata?.plan);
        if (!userId || !plan) {
          // Fall back to looking up by stripe_subscription_id — the
          // session.completed handler already linked it.
          const { data: existing } = await admin
            .from("subscriptions")
            .select("user_id,plan")
            .eq("stripe_subscription_id", sub.id)
            .maybeSingle();
          if (!existing) {
            console.warn(
              "[billing/webhook] subscription event without user mapping",
              { id: sub.id, type: event.type },
            );
            break;
          }
          await admin
            .from("subscriptions")
            .update({
              status: sub.status,
              current_period_end: isoFromUnix(
                (sub as unknown as { current_period_end?: number })
                  .current_period_end,
              ),
              cancel_at_period_end: sub.cancel_at_period_end ?? false,
            })
            .eq("user_id", existing.user_id);
          break;
        }

        await admin.from("subscriptions").upsert(
          {
            user_id: userId,
            plan,
            status: sub.status,
            stripe_customer_id:
              typeof sub.customer === "string"
                ? sub.customer
                : (sub.customer?.id ?? null),
            stripe_subscription_id: sub.id,
            current_period_end: isoFromUnix(
              (sub as unknown as { current_period_end?: number })
                .current_period_end,
            ),
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
          },
          { onConflict: "user_id" },
        );
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        // Period-end the row. Don't flip plan to 'free' until
        // current_period_end actually passes (handled at read time
        // by getPlan).
        await admin
          .from("subscriptions")
          .update({
            status: "canceled",
            current_period_end: isoFromUnix(
              (sub as unknown as { current_period_end?: number })
                .current_period_end,
            ),
            cancel_at_period_end: false,
          })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          (invoice as unknown as { subscription?: string | null })
            .subscription ?? null;
        if (!subscriptionId) break;
        await admin
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", subscriptionId);

        // Buddy signal — medium severity. A failed payment is a recoverable
        // event (Stripe retries) but worth surfacing so we don't lose
        // operators silently to dunning.
        const { data: sub } = await admin
          .from("subscriptions")
          .select("user_id,plan")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();
        if (sub?.user_id) {
          const { data: u } = await admin.auth.admin.getUserById(sub.user_id);
          await recordConcernSignal(admin, {
            kind: "payment_failed",
            severity: "medium",
            title: "Subscription payment failed",
            body:
              (u?.user?.email
                ? `${u.user.email} · ${sub.plan}. `
                : `${sub.plan}. `) +
              "Stripe will retry per dunning settings.",
            relatedUserId: sub.user_id,
            relatedEmail: u?.user?.email ?? null,
            metadata: {
              stripeSubscriptionId: subscriptionId,
              plan: sub.plan,
            },
          });
        }
        break;
      }

      case "charge.refunded": {
        // Fires when a charge is refunded — including refunds initiated
        // from /api/admin/refund and refunds issued directly in the
        // Stripe dashboard. Reconcile our row to status='refunded'.
        //
        // Per locked pricing policy: a refunded Founder's Pass DOES NOT
        // release its founder seat. We deliberately leave `founder_seats`
        // untouched here. The counter stays honest; we eat the refund.
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : (charge.payment_intent?.id ?? null);
        const customerId =
          typeof charge.customer === "string"
            ? charge.customer
            : (charge.customer?.id ?? null);

        // Find the subscription. Try by stripe_customer_id first (works
        // for both founder one-times and operator subs), then fall back
        // to the payment_intent on the original founder session.
        let matchedUserId: string | null = null;
        if (customerId) {
          const { data } = await admin
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();
          matchedUserId = data?.user_id ?? null;
        }
        if (!matchedUserId && paymentIntentId) {
          // For founder rows we stored the session id; retrieve the
          // session to confirm the PI matches.
          try {
            const sessions = await stripe.checkout.sessions.list({
              payment_intent: paymentIntentId,
              limit: 1,
            });
            const sessionId = sessions.data[0]?.id ?? null;
            if (sessionId) {
              const { data } = await admin
                .from("subscriptions")
                .select("user_id")
                .eq("stripe_session_id", sessionId)
                .maybeSingle();
              matchedUserId = data?.user_id ?? null;
            }
          } catch (err) {
            console.warn(
              "[billing/webhook] charge.refunded session lookup failed:",
              err,
            );
          }
        }

        if (!matchedUserId) {
          console.warn(
            "[billing/webhook] charge.refunded without a matchable subscription",
            { chargeId: charge.id },
          );
          break;
        }

        await admin
          .from("subscriptions")
          .update({
            status: "refunded",
            cancel_at_period_end: false,
          })
          .eq("user_id", matchedUserId);

        // Buddy signal — low severity. Refunds are routine, but seeing them
        // in the feed gives the founder a daily sense of churn shape.
        const { data: u } = await admin.auth.admin.getUserById(matchedUserId);
        const amountDollars =
          typeof charge.amount_refunded === "number"
            ? (charge.amount_refunded / 100).toFixed(2)
            : null;
        await recordConcernSignal(admin, {
          kind: "refund_issued",
          severity: "low",
          title: amountDollars
            ? `Refund issued · $${amountDollars}`
            : "Refund issued",
          body: u?.user?.email
            ? `${u.user.email} refunded.`
            : "Subscription refunded.",
          relatedUserId: matchedUserId,
          relatedEmail: u?.user?.email ?? null,
          metadata: {
            chargeId: charge.id,
            amountRefunded: charge.amount_refunded,
            paymentIntent: paymentIntentId,
          },
        });
        break;
      }

      default:
        // Unhandled event types are fine — Stripe sends many we
        // don't care about. Logged at debug level only.
        break;
    }
  } catch (err) {
    console.error(
      "[billing/webhook] handler threw for event",
      event.type,
      err,
    );
    // We've already inserted into stripe_events, so a retry from
    // Stripe will dedupe. That's intentional — better to lose the
    // event than to thrash. Manual reconciliation via dashboard.
    return new Response(
      JSON.stringify({ ok: false, error: "handler-failed" }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
