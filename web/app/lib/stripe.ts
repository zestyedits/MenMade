import Stripe from "stripe";

/**
 * Server-only Stripe client. NEVER import this from a Client Component
 * — it pulls the secret key into whatever bundle ends up loading it.
 *
 * Mode switch: `NEXT_PUBLIC_STRIPE_MODE` ("test" or "live") selects which
 * suffixed env block to read from. This lets us keep test + live keys
 * side-by-side in .env.local and flip with one line. The webhook secret,
 * publishable key, and price IDs all key off the same mode.
 *
 * apiVersion is pinned so a Stripe-side breaking change won't silently
 * shift the shape of our webhook payloads. Bump intentionally after
 * reviewing the changelog.
 */

export type StripeMode = "test" | "live";

export function getStripeMode(): StripeMode {
  const m = (process.env.NEXT_PUBLIC_STRIPE_MODE ?? "test").toLowerCase();
  return m === "live" ? "live" : "test";
}

function envFor(varBase: string): string | undefined {
  const suffix = getStripeMode() === "live" ? "LIVE" : "TEST";
  return process.env[`${varBase}_${suffix}`];
}

/** Server-side: secret key for the active mode. */
export function getStripeSecretKey(): string | undefined {
  return envFor("STRIPE_SECRET_KEY");
}

/** Server-side: webhook signing secret for the active mode. */
export function getStripeWebhookSecret(): string | undefined {
  return envFor("STRIPE_WEBHOOK_SECRET");
}

const STRIPE_SECRET_KEY = getStripeSecretKey();

if (!STRIPE_SECRET_KEY) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `STRIPE_SECRET_KEY_${getStripeMode().toUpperCase()} is required in production. Set it in your env.`,
    );
  } else {
    console.warn(
      `[stripe] STRIPE_SECRET_KEY_${getStripeMode().toUpperCase()} not set — Stripe client will throw on use.`,
    );
  }
}

// Singleton across the lambda lifetime. Stripe SDK is happy to be
// reused across requests.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error(
      `Stripe client called without STRIPE_SECRET_KEY_${getStripeMode().toUpperCase()} set.`,
    );
  }
  if (!_stripe) {
    _stripe = new Stripe(key, {
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

/** Maps our internal plan keys → env-driven Stripe price IDs (mode-aware). */
export function getPriceId(
  plan: "operator-monthly" | "operator-annual" | "founders-pass",
): string {
  const base =
    plan === "operator-monthly"
      ? "STRIPE_PRICE_OPERATOR_MONTHLY"
      : plan === "operator-annual"
        ? "STRIPE_PRICE_OPERATOR_ANNUAL"
        : "STRIPE_PRICE_FOUNDERS_PASS";
  const id = envFor(base);
  if (!id) {
    throw new Error(
      `Missing Stripe price ID for plan "${plan}" in ${getStripeMode()} mode. Set ${base}_${getStripeMode().toUpperCase()} in env.`,
    );
  }
  return id;
}
