"use client";

/**
 * Small countdown that auto-routes the user back to /settings/billing
 * after a successful payment. The webhook usually finalizes the
 * subscription row within ~2 seconds; we wait a bit longer so the
 * "You're in." moment lands and the user reads it.
 *
 * Cancel button lets the user opt out — they may want to stay and
 * forward the receipt or screenshot before navigating.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_SECONDS = 12;

export function AutoRedirect({
  to = "/settings/billing",
  seconds = DEFAULT_SECONDS,
}: {
  to?: string;
  seconds?: number;
}) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(seconds);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (cancelled) return;
    if (remaining <= 0) {
      router.replace(to);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, cancelled, router, to]);

  if (cancelled) return null;

  const pct = ((seconds - remaining) / seconds) * 100;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col gap-2 border border-white/10 bg-ink-900/40 px-4 py-3"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/70">
          Heading to billing in{" "}
          <span className="tabular-nums text-bone">{remaining}s</span>
        </span>
        <button
          type="button"
          onClick={() => setCancelled(true)}
          className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/70 underline-offset-4 transition hover:text-bone hover:underline"
        >
          Stay here
        </button>
      </div>
      <div
        className="h-[2px] overflow-hidden bg-white/10"
        aria-hidden="true"
      >
        <span
          className="block h-full bg-ember-400 transition-[width]"
          style={{ width: `${pct}%`, transitionDuration: "900ms" }}
        />
      </div>
    </div>
  );
}
