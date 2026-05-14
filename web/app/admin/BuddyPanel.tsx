"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ConcernSignalRow } from "./_data";

/**
 * Buddy — the operations sidekick. Renders the open concern_signals feed
 * at the top of /admin. Tactile: dismissing a signal slides it out and
 * the row collapses with a short animation before router.refresh() pulls
 * fresh data.
 *
 * Visual hierarchy (highest signal first):
 *   - severity dot (red high · amber medium · bone low)
 *   - kind chip (mono, uppercase, dimmed)
 *   - title (bone, bold)
 *   - body (ink-200, optional)
 *   - time-ago (mono, right-aligned)
 *   - dismiss button (tertiary)
 *
 * Empty state is the GOOD state — quiet, restrained. "All clear. Nothing's
 * broken." Matches the brand-voice register (dry confidence).
 */

const PREVIEW_LIMIT = 8;

function fmtRelative(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  const diff = Date.now() - t;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

const KIND_LABEL: Record<string, string> = {
  payment_failed: "Payment failed",
  refund_issued: "Refund",
  account_deleted: "Account deleted",
  rate_limit_hit: "Rate-limit hit",
  honeypot_tripped: "Honeypot",
  webhook_delivery_lag: "Webhook lag",
  user_reported: "User report",
  admin_review_requested: "Review requested",
  signup_burst: "Signup burst",
};

function SeverityDot({
  severity,
}: {
  severity: "low" | "medium" | "high";
}) {
  // Color carries the semantic; the severity is also in the aria-label.
  const cls =
    severity === "high"
      ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.55)]"
      : severity === "medium"
        ? "bg-amber-400"
        : "bg-bone/70";
  return (
    <span
      aria-label={`${severity} severity`}
      className={`inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full ${cls}`}
    />
  );
}

export function BuddyPanel({ signals }: { signals: ConcernSignalRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  // Local view state: which signals are currently animating out before the
  // server refresh removes them from the list. We don't optimistically drop
  // the row entirely — the slide-out gives the admin a beat of feedback.
  const [closing, setClosing] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  async function dismiss(id: string) {
    setClosing((prev) => new Set(prev).add(id));
    try {
      const res = await fetch("/api/admin/buddy/dismiss", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ signalId: id }),
      });
      if (!res.ok) {
        // Roll back local state so the row reappears.
        setClosing((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        return;
      }
      // Wait for the slide-out, then refresh server data.
      setTimeout(() => {
        startTransition(() => router.refresh());
      }, 220);
    } catch {
      setClosing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  const visible = showAll ? signals : signals.slice(0, PREVIEW_LIMIT);
  const hiddenCount = Math.max(0, signals.length - visible.length);

  return (
    <section className="relative pl-5 md:pl-6">
      <span
        aria-hidden
        className="absolute left-0 top-1 h-[calc(100%-4px)] w-[2px] bg-ember-400/70"
      />
      <header className="mb-5 flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-ember-400/85">
            Buddy / Field comms
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/60">
          {signals.length === 0
            ? "0 open"
            : `${signals.length} open`}
        </span>
      </header>

      {signals.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden border border-white/[0.06] bg-ink-900/40">
          <ul className="divide-y divide-white/[0.04]">
            {visible.map((s) => (
              <BuddyRow
                key={s.id}
                signal={s}
                closing={closing.has(s.id)}
                onDismiss={() => dismiss(s.id)}
              />
            ))}
          </ul>
          {hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="w-full border-t border-white/[0.04] bg-ink-900/60 px-4 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.22em] text-ember-400 hover:bg-ink-900/80"
            >
              {hiddenCount} more →
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}

function BuddyRow({
  signal,
  closing,
  onDismiss,
}: {
  signal: ConcernSignalRow;
  closing: boolean;
  onDismiss: () => void;
}) {
  return (
    <li
      className={`grid grid-cols-[auto_1fr_auto] items-start gap-3 px-4 py-3 transition-all duration-200 ${
        closing ? "max-h-0 -translate-x-4 opacity-0" : "max-h-[200px] opacity-100"
      }`}
    >
      <div className="pt-1.5">
        <SeverityDot severity={signal.severity} />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/70">
            {KIND_LABEL[signal.kind] ?? signal.kind}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/50">
            {fmtRelative(signal.createdAtIso)}
          </span>
        </div>
        <p className="mt-1 text-[13.5px] font-semibold leading-snug text-bone">
          {signal.title}
        </p>
        {signal.body ? (
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-200/80">
            {signal.body}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        disabled={closing}
        className="self-center font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/65 hover:text-bone disabled:opacity-50"
        aria-label={`Dismiss: ${signal.title}`}
      >
        Dismiss
      </button>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-white/[0.08] bg-ink-900/30 px-6 py-7">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/60">
        Status
      </p>
      <p className="mt-2 text-[15px] font-semibold text-bone">
        All clear. Nothing&rsquo;s broken.
      </p>
      <p className="mt-1 max-w-[50ch] text-[12.5px] leading-relaxed text-ink-200/70">
        No payment failures, no flagged accounts, no bots probing the
        contact form. Buddy will tap your shoulder if that changes.
      </p>
    </div>
  );
}
