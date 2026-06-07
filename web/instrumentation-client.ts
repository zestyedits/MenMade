// Browser-side Sentry init. Renamed from sentry.client.config.ts per the
// @sentry/nextjs ≥8.28 pattern (Next 15+ App Router).
//
// Privacy note: sendDefaultPii is intentionally false. MenMade has a public
// commitment not to ship user IP, request headers, or auth tokens to third
// parties. Replays mask all text + inputs + media so they can't leak PII
// either. If we need richer triage we attach minimal user.id at capture.
//
// Uses NEXT_PUBLIC_SENTRY_DSN because the DSN must be embedded in the
// client bundle. The DSN is not a secret — it's an ingest endpoint that
// only accepts events; Sentry rate-limits per-DSN.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Railway exposes RAILWAY_* (not NEXT_PUBLIC_-prefixed), so the browser
    // can't see them. To tag client release/env on Railway, set
    // NEXT_PUBLIC_RAILWAY_* build vars (e.g. = ${{RAILWAY_GIT_COMMIT_SHA}}).
    // Optional — untagged just means no release grouping in Sentry.
    environment:
      process.env.NEXT_PUBLIC_VERCEL_ENV ??
      process.env.NEXT_PUBLIC_RAILWAY_ENVIRONMENT_NAME ??
      process.env.NODE_ENV ??
      "development",
    release:
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
      process.env.NEXT_PUBLIC_RAILWAY_GIT_COMMIT_SHA,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
    sendDefaultPii: false,
    enableLogs: true,
    integrations: [
      // Session replay captures DOM snapshots on errors. Mask everything by
      // default so PII never lands in a replay frame.
      Sentry.replayIntegration({
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
      }),
    ],
    ignoreErrors: [
      "AbortError",
      // ResizeObserver loop spam from various UI libraries; not actionable.
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
    ],
  });
}

// App Router navigation tracing — Next.js 15+ surfaces transitions via this
// export. Sentry uses it to start a span on every soft nav so client-side
// route changes show up alongside server spans.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
