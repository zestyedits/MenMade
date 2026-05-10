"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  ArrowRight,
  Play,
  Pause,
  Clock,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "../../components/ui/Button";
import { MonoLabel } from "../../components/ui/MonoLabel";

type Props = {
  day: number;
  directive: string;
  detail: string;
  estimatedMinutes: number;
  completed: boolean;
  onComplete: (loggedMinutes: number) => void;
};

function formatMmSs(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TodayDirective({
  day,
  directive,
  detail,
  estimatedMinutes,
  completed,
  onComplete,
}: Props) {
  const [elapsedSec, setElapsedSec] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const goalSec = estimatedMinutes * 60;
  const pct = Math.min(100, Math.round((elapsedSec / goalSec) * 100));
  const loggedMinutes = Math.max(1, Math.round(elapsedSec / 60));

  return (
    <section
      aria-labelledby="today-heading"
      className="relative flex flex-col gap-5 overflow-hidden border border-white/[0.06] bg-ink-900/60 p-6 md:p-7"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgb(239 123 53 / 0.5) 50%, transparent 100%)",
        }}
      />

      <header className="flex flex-wrap items-center justify-between gap-3">
        <MonoLabel rule>
          Today / Day {String(day).padStart(2, "0")} brief
        </MonoLabel>
        <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/70">
          <Clock size={13} weight="bold" />
          {estimatedMinutes} min target
        </div>
      </header>

      <h1
        id="today-heading"
        className="text-balance text-[24px] font-extrabold uppercase leading-[1.05] tracking-tight text-bone md:text-[30px]"
      >
        {directive}
      </h1>

      <p className="max-w-[60ch] text-[14px] leading-relaxed text-ink-200/80">
        {detail}
      </p>

      {/* Session timer */}
      <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/60">
              Today logged
            </span>
            <span className="font-mono text-[20px] font-bold tabular-nums text-bone">
              {formatMmSs(elapsedSec)}
            </span>
            <span className="font-mono text-[11px] tabular-nums text-ink-300/60">
              / {String(estimatedMinutes).padStart(2, "0")}:00
            </span>
          </div>
          {!completed ? (
            <button
              type="button"
              onClick={() => setRunning((v) => !v)}
              aria-pressed={running}
              className="tactile group inline-flex items-center gap-2 border border-white/15 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-bone/85 transition hover:border-white/25 hover:text-bone"
            >
              {running ? (
                <>
                  <Pause size={12} weight="fill" />
                  Pause
                </>
              ) : (
                <>
                  <Play size={12} weight="fill" />
                  {elapsedSec > 0 ? "Resume" : "Start session"}
                </>
              )}
            </button>
          ) : null}
        </div>
        <div
          className="relative h-1 overflow-hidden bg-white/10"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span
            className="absolute inset-y-0 left-0 bg-ember-400 transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-5">
        <Button
          variant={completed ? "secondary" : "primary"}
          size="md"
          onClick={() => {
            if (completed) return;
            setRunning(false);
            onComplete(loggedMinutes);
          }}
          aria-pressed={completed}
        >
          {completed ? (
            <>
              <CheckCircle size={16} weight="fill" />
              Marked complete
            </>
          ) : (
            <>
              Mark complete
              <ArrowRight size={14} weight="bold" />
            </>
          )}
        </Button>
        <Button variant="tertiary" size="md" href="/field-log/new">
          Log details
        </Button>
        {completed ? (
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ember-400/90">
            Logged {loggedMinutes} min &middot; squad notified.
          </span>
        ) : null}
      </div>
    </section>
  );
}
