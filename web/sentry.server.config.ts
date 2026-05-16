// Server-side Sentry init. Runs in Node.js runtime (API routes, server
// components, route handlers). Loaded by instrumentation.ts.
//
// We deliberately stay narrow:
//   - tracesSampleRate 0.05 in prod (avoid blowing through Sentry's free
//     plan quota; bump if we ever need detailed perf data)
//   - ignoreErrors filters known noise (Supabase aborts, expected 404s)
//   - sendDefaultPii=false: never ship user emails / auth tokens to Sentry.
//     We instead attach minimal user.id when handling errors that name a user.
//
// DSN comes from SENTRY_DSN (server-only). NEXT_PUBLIC_SENTRY_DSN is the
// browser variant in sentry.client.config.ts.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 0,
    sendDefaultPii: false,
    // Note: includeLocalVariables is OFF. The Sentry SDK implements it by
    // spinning up the Node inspector and intercepting frames, which
    // collides with Next.js 16's dev-server adapter and crashes the
    // server with `adapterFn is not a function`. Without local variables
    // we still get stack traces; just no scope values.
    includeLocalVariables: false,
    // Structured logs via Sentry.logger.* land in the Logs product.
    enableLogs: true,
    ignoreErrors: [
      // Supabase auth token refresh aborts when a request is cancelled
      // mid-flight (e.g. user navigates away). Not actionable.
      "AbortError",
      // Expected 404 on routes — these aren't bugs.
      "NEXT_NOT_FOUND",
      "NEXT_REDIRECT",
    ],
  });
}
