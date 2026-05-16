import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Allowed origins for connect-src in CSP. Add Stripe + other future
// vendors to this list when those integrations land.
const SUPABASE_HOST = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
})();

// Note on 'unsafe-inline' for script-src: Next.js currently injects a
// number of inline scripts (RSC payloads, hydration markers) that don't
// have nonces. Tightening to a nonce-only policy is a one-day project
// (see Section 6 of the security audit) — tracked as a follow-up.
//
// 'unsafe-eval' is appended in development mode only. React's dev build
// uses eval() to reconstruct callstacks for error reporting; production
// React never uses eval() so we drop it there. Without this dev allow,
// every client component fails to hydrate behind a CSP header.
const isDev = process.env.NODE_ENV !== "production";
const devEvalGrant = isDev ? " 'unsafe-eval'" : "";

const cspParts: string[] = [
  "default-src 'self'",
  // Stripe.js (js.stripe.com) is loaded by the Checkout/Portal
  // redirect flow's tiny bootstrap; not strictly needed for our
  // server-issued session URLs but listed defensively.
  `script-src 'self' 'unsafe-inline'${devEvalGrant} https://js.stripe.com${SUPABASE_HOST ? ` https://${SUPABASE_HOST}` : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  // Stripe endpoints: api.stripe.com (server-side calls are also
  // covered by the server runtime — listed for completeness) and
  // checkout.stripe.com (used by Stripe.js in-page handoff).
  // Sentry's ingest endpoint per-project lives at <key>.ingest.<region>.sentry.io.
  // We allow the whole *.ingest.sentry.io wildcard so the same DSN works
  // regardless of the project's region (us / eu / etc).
  `connect-src 'self' https://api.resend.com https://api.stripe.com https://checkout.stripe.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io${SUPABASE_HOST ? ` https://${SUPABASE_HOST} wss://${SUPABASE_HOST}` : ""}`,
  // Stripe Checkout opens a redirected page, not a frame, but the
  // billing portal and Stripe Elements use frames for embedded UI.
  // Stripe Embedded Checkout iframes load from js.stripe.com; 3-D Secure
  // challenges fall back to hooks.stripe.com. The billing portal is
  // separate (we redirect to billing.stripe.com — not framed).
  "frame-src https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com https://billing.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "object-src 'none'",
];

const securityHeaders = [
  // 2-year HSTS with preload — once we ship to production. Vercel terminates TLS.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // No MIME sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // No iframe embedding (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Don't leak the full URL to third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Block features we never use; explicitly opt out of FLoC.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(self)",
  },
  // Content Security Policy.
  { key: "Content-Security-Policy", value: cspParts.join("; ") },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

// Sentry build wrapping. We ONLY wrap in production because the
// withSentryConfig plugin monkey-patches Next.js's middleware adapter
// and is incompatible with the Turbopack dev server in Next 16 — boots
// up but crashes on first request with `adapterFn is not a function`.
// In dev we ship the unwrapped config; production Vercel builds use
// Webpack where the wrapper works correctly. Source maps + tunnel route
// + release tagging all happen at production build time, which is what
// matters.
const finalConfig =
  process.env.NODE_ENV === "production"
    ? withSentryConfig(nextConfig, {
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        silent: !process.env.CI,
        widenClientFileUpload: true,
        // Proxy Sentry events through our own /monitoring route. Bypasses
        // ad-blockers; keeps the browser talking only to our own origin.
        tunnelRoute: "/monitoring",
        sourcemaps: { disable: false, deleteSourcemapsAfterUpload: true },
        // Don't fail the build if Sentry isn't fully configured yet.
        errorHandler: (err) => {
          console.warn("[sentry build]", err.message);
        },
      })
    : nextConfig;

export default finalConfig;
