"use client";

import { motion } from "framer-motion";
import type { FocusArea, Intensity } from "../../lib/store";
import {
  type CycleLength,
  FOCUS_LABELS,
  INTENSITY_LABELS,
} from "../_data/cycles";

const LENGTHS: CycleLength[] = [14, 30, 60, 90];
const FOCUSES: FocusArea[] = ["build", "move", "make", "master", "mend", "mark"];
const INTENSITIES: Intensity[] = ["light", "steady", "heavy", "brutal"];

type Props = {
  focus: FocusArea | null;
  length: CycleLength | null;
  intensity: Intensity | null;
  onFocus: (v: FocusArea | null) => void;
  onLength: (v: CycleLength | null) => void;
  onIntensity: (v: Intensity | null) => void;
  count: number;
};

export function CycleFilters({
  focus,
  length,
  intensity,
  onFocus,
  onLength,
  onIntensity,
  count,
}: Props) {
  const hasFilters = focus !== null || length !== null || intensity !== null;

  function clearAll() {
    onFocus(null);
    onLength(null);
    onIntensity(null);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 border-y border-white/[0.06] py-6"
    >
      {/* Focus row */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-300/60 w-[68px]">
          Focus
        </span>
        <div className="flex flex-wrap gap-1.5">
          {FOCUSES.map((f) => {
            const on = focus === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => onFocus(on ? null : f)}
                className={`border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] transition ${
                  on
                    ? "border-ember-400/60 bg-ember-400/[0.08] text-ember-400"
                    : "border-white/10 text-ink-200/80 hover:border-white/25 hover:text-bone"
                }`}
              >
                {FOCUS_LABELS[f]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Length row */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-300/60 w-[68px]">
          Length
        </span>
        <div className="flex flex-wrap gap-1.5">
          {LENGTHS.map((l) => {
            const on = length === l;
            return (
              <button
                key={l}
                type="button"
                aria-pressed={on}
                onClick={() => onLength(on ? null : l)}
                className={`border px-3 py-1.5 font-mono text-[10.5px] tabular-nums uppercase tracking-[0.18em] transition ${
                  on
                    ? "border-ember-400/60 bg-ember-400/[0.08] text-ember-400"
                    : "border-white/10 text-ink-200/80 hover:border-white/25 hover:text-bone"
                }`}
              >
                {l} days
              </button>
            );
          })}
        </div>
      </div>

      {/* Intensity row */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-300/60 w-[68px]">
          Intensity
        </span>
        <div className="flex flex-wrap gap-1.5">
          {INTENSITIES.map((i) => {
            const on = intensity === i;
            return (
              <button
                key={i}
                type="button"
                aria-pressed={on}
                onClick={() => onIntensity(on ? null : i)}
                className={`border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] transition ${
                  on
                    ? "border-ember-400/60 bg-ember-400/[0.08] text-ember-400"
                    : "border-white/10 text-ink-200/80 hover:border-white/25 hover:text-bone"
                }`}
              >
                {INTENSITY_LABELS[i]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.04] pt-4">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-200/80">
          <span className="font-bold tabular-nums text-bone">{count}</span>{" "}
          {count === 1 ? "cycle" : "cycles"} matching
        </span>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-bone underline underline-offset-4 decoration-bone/40 transition hover:decoration-bone"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}
