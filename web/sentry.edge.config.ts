// Edge-runtime Sentry init. Runs in middleware / proxy.ts and any
// route handlers that opt into the edge runtime (we don't currently
// use any). Kept minimal because the edge runtime ships less of
// Sentry's feature set anyway.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? "development",
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: 0,
    sendDefaultPii: false,
    enableLogs: true,
  });
}
