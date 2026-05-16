// Sentry server-side instrumentation is intentionally OFF in dev.
//
// Why: @sentry/nextjs's autoinstrumentation collides with Next 16
// Turbopack — manifests as Turbopack hanging on the instrumentation
// compile, or `adapterFn is not a function` at first request. Sentry
// is wired ONLY in production (Vercel deploy uses Webpack where it
// works). Set FORCE_SENTRY=1 to opt in locally if needed.
//
// Client-side Sentry (instrumentation-client.ts) stays on — browser
// SDK has no autoinstrumentation issue.

const ENABLE_SERVER_SENTRY =
  process.env.NODE_ENV === "production" || process.env.FORCE_SENTRY === "1";

export async function register() {
  if (!ENABLE_SERVER_SENTRY) return;
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export async function onRequestError(
  err: unknown,
  request: unknown,
  errorContext: unknown,
) {
  if (!ENABLE_SERVER_SENTRY) return;
  const Sentry = await import("@sentry/nextjs");
  return Sentry.captureRequestError(
    err as Error,
    request as Parameters<typeof Sentry.captureRequestError>[1],
    errorContext as Parameters<typeof Sentry.captureRequestError>[2],
  );
}
