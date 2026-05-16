"use client";

import { LiveDot } from "../../components/ui/LiveDot";
import { useNow, formatElapsed } from "../../lib/useNow";

type Props = {
  cycleCode: string;
  cycleName: string;
  day: number;
  totalDays: number;
  startedAt: string;
  operativeHandle: string;
};

export function CycleStrip({
  cycleCode,
  cycleName,
  day,
  totalDays,
  startedAt,
  operativeHandle,
}: Props) {
  const now = useNow(30_000);
  const remaining = Math.max(0, totalDays - day);
  const pct = Math.min(100, Math.round((day / totalDays) * 100));

  return (
    <section
      aria-label="Current cycle status"
      className="border-b border-white/[0.06] bg-ink-900/40"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-3.5 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-2">
            <LiveDot />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ember-400/80">
              In cycle
            </span>
          </div>
          <span aria-hidden className="hidden h-3 w-px bg-white/15 md:block" />
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/70">
              {cycleCode}
            </span>
            <span className="text-[14px] font-medium text-bone">
              {cycleName}
            </span>
          </div>
          <span aria-hidden className="hidden h-3 w-px bg-white/15 md:block" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/60">
            @{operativeHandle}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="font-mono text-[12px] tabular-nums text-bone"
            suppressHydrationWarning
            aria-label={`${formatElapsed(startedAt, now)} elapsed`}
          >
            <span className="text-ink-300/70">Elapsed </span>
            <span className="font-bold">{formatElapsed(startedAt, now)}</span>
          </div>
          <div
            className="relative h-1 w-32 overflow-hidden bg-white/10 md:w-40"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Cycle progress: ${pct}%`}
          >
            <span
              className="absolute inset-y-0 left-0 bg-ember-400 transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="font-mono text-[12px] tabular-nums">
            <span className="font-bold text-bone">
              {String(day).padStart(2, "0")}
            </span>
            <span className="text-ink-300/70">
              {" / "}
              {String(totalDays).padStart(2, "0")}
            </span>
            <span className="ml-2 text-[10.5px] uppercase tracking-[0.18em] text-ink-300/70">
              {remaining} left
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
