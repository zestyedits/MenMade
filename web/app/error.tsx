"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowClockwise, House } from "@phosphor-icons/react/dist/ssr";
import * as Sentry from "@sentry/nextjs";
import { MonoLabel } from "./components/ui/MonoLabel";

/**
 * Segment error boundary. Catches uncaught render errors in any client
 * component below the root layout. Renders an in-brand "something broke"
 * state — never includes the raw error message in the UI (could leak
 * stack traces or PII).
 *
 * Sentry captures the error with the digest tag so support can correlate
 * to a user-visible incident ID.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", error);
    Sentry.captureException(error, {
      tags: { boundary: "segment", digest: error.digest ?? "unknown" },
    });
  }, [error]);

  return (
    <main className="relative grid min-h-[100dvh] place-items-center bg-ink-950 px-5 py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgb(239 123 53 / 0.06) 0%, transparent 60%)",
        }}
      />
      <div className="relative max-w-[600px] text-balance">
        <MonoLabel rule>Error / 500</MonoLabel>
        <h1 className="mt-5 font-sans text-[clamp(2rem,5vw,3.6rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-bone">
          Something broke.
        </h1>
        <p className="mt-5 max-w-[55ch] text-[15px] leading-relaxed text-ink-200/80">
          Something on our end failed. We&rsquo;ve been notified — no
          details needed from you. Try again, or come back in a few.
        </p>

        {error.digest ? (
          <p className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/55">
            Incident ID: <span className="text-ink-200">{error.digest}</span>
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="tactile inline-flex items-center gap-2 bg-bone px-5 py-3 font-sans text-[13px] font-bold uppercase tracking-[0.12em] text-ink-950 transition hover:bg-white"
          >
            <ArrowClockwise size={14} weight="bold" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-white/15 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-bone transition hover:border-white/30"
          >
            <House size={13} weight="bold" />
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
