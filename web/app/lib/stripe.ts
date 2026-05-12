import Stripe from "stripe";

/**
 * Server-only Stripe client. NEVER import this from a Client Component
 * — it pulls the secret key into whatever bundle ends up loading it.
 *
 * apiVersion is pinned so a Stripe-side breaking change won't silently
 * shift the shape of our webhook payloads. Bump intentionally after
 * reviewing the changelog.
 *
 * In dev, missing STRIPE_SECRET_KEY logs a warning and the eventual
 * call to a Stripe method throws — same pattern as supabase/admin.ts.
 * In production, missing key throws at import time so the route
 * fails fast at boot rather than mysteriously 500ing on first hit.
 */

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "STRIPE_SECRET_KEY is required in production. Set it in your env.",
    );
  } else {
    console.warn(
      "[stripe] STRIPE_SECRET_KEY not set — Stripe client will throw on use.",
    );
  }
}

// Singleton across the lambda lifetime. Stripe SDK is happy to be
// reused across requests.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error(
      "Stripe client called without STRIPE_SECRET_KEY set.",
    );
  }
  if (!_stripe) {
    _stripe = new Stripe(STRIPE_SECRET_KEY, {
      // Pinned. Bump intentionally after reading the changelog.
      // Cast satisfies the SDK's literal-union type for apiVersion;
      // bump together with the stripe dep version.
      apiVersion: "2024-10-28.acacia" as Stripe.LatestApiVersion,
      typescript: true,
      appInfo: {
        name: "MenMade",
        url: process.env.NEXT_PUBLIC_APP_URL ?? "https://menmade.app",
      },
    });
  }
  return _stripe;
}

/** Maps our internal plan keys → env-driven Stripe price IDs. */
export function getPriceId(
  plan: "operator-monthly" | "operator-annual" | "founders-pass",
): string {
  const id =
    plan === "operator-monthly"
      ? process.env.STRIPE_PRICE_OPERATOR_MONTHLY
      : plan === "operator-annual"
        ? process.env.STRIPE_PRICE_OPERATOR_ANNUAL
        : process.env.STRIPE_PRICE_FOUNDERS_PASS;

  if (!id) {
    throw new Error(
      `Missing Stripe price ID for plan "${plan}". Set STRIPE_PRICE_* in env.`,
    );
  }
  return id;
}
