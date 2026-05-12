import type { NextConfig } from "next";

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
const cspParts: string[] = [
  "default-src 'self'",
  // Stripe.js (js.stripe.com) is loaded by the Checkout/Portal
  // redirect flow's tiny bootstrap; not strictly needed for our
  // server-issued session URLs but listed defensively.
  `script-src 'self' 'unsafe-inline' https://js.stripe.com${SUPABASE_HOST ? ` https://${SUPABASE_HOST}` : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  // Stripe endpoints: api.stripe.com (server-side calls are also
  // covered by the server runtime — listed for completeness) and
  // checkout.stripe.com (used by Stripe.js in-page handoff).
  `connect-src 'self' https://api.resend.com https://api.stripe.com https://checkout.stripe.com${SUPABASE_HOST ? ` https://${SUPABASE_HOST} wss://${SUPABASE_HOST}` : ""}`,
  // Stripe Checkout opens a redirected page, not a frame, but the
  // billing portal and Stripe Elements use frames for embedded UI.
  "frame-src https://js.stripe.com https://checkout.stripe.com https://billing.stripe.com",
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

export default nextConfig;
