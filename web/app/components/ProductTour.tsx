"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, Broadcast } from "@phosphor-icons/react/dist/ssr";
import {
  MockEnlist,
  MockBrief,
  MockMatched,
  MockCycle,
  MockFinish,
} from "./tour/TourMockups";

type Step = {
  index: string;
  title: string;
  satire: string;
  body: string;
  Mock: ({ active }: { active: boolean }) => React.JSX.Element;
};

const STEPS: Step[] = [
  {
    index: "01",
    title: "Sign up.",
    satire: "Two minutes of setup. Then you're in.",
    body: "Apple, Google, or just an email. We don't ask for your follower count or your astrological sign.",
    Mock: MockEnlist,
  },
  {
    index: "02",
    title: "Take the brief.",
    satire: "We ask the questions a horoscope can't.",
    body: "Focus, intensity, cadence, time zone. Real answers determine real matches. No vibes-based pairings.",
    Mock: MockBrief,
  },
  {
    index: "03",
    title: "Get matched.",
    satire: "Real men. Vetted by what they actually do.",
    body: "Three to eight men in your time-zone band, calibrated to the same intensity dial. A squad, not a chat room.",
    Mock: MockMatched,
  },
  {
    index: "04",
    title: "Run the cycle.",
    satire: "Show up six days a week. The seventh is for sleep, not scrolling.",
    body: "Daily directive. Logged time. Squad sees you. You see them. The ledger doesn't lie about whether you showed up.",
    Mock: MockCycle,
  },
  {
    index: "05",
    title: "Finish (or get out).",
    satire: "No participation trophies. No 'I learned a lot.'",
    body: "87% of squads close their cycle. The other 13% ghost. Both are honest signals. The men who finish keep finishing.",
    Mock: MockFinish,
  },
];

const STEP_MS = 9_000;

export function ProductTour() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const tickRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (paused) return;
    tickRef.current = setTimeout(
      () => setActive((i) => (i + 1) % STEPS.length),
      STEP_MS,
    );
    return () => {
      if (tickRef.current) clearTimeout(tickRef.current);
    };
  }, [active, paused]);

  const Mock = STEPS[active].Mock;
  const activeStep = STEPS[active];

  return (
    <section
      id="tour"
      aria-labelledby="tour-heading"
      className="relative overflow-hidden border-t border-white/[0.06] bg-ink-950 py-20 md:py-24"
    >
      {/* Ambient glow — anchored to the visual side */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 30%, rgb(239 123 53 / 0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        {/* Heading row */}
        <div className="grid grid-cols-12 items-end gap-6 gap-y-8">
          <div className="col-span-12 md:col-span-7">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-200/60">
              <span className="h-px w-8 bg-ink-200/40" />
              Squad protocol / 004
              <span className="text-ember-400/80">/ tour</span>
            </div>
            <h2
              id="tour-heading"
              className="mt-5 text-balance font-sans text-[clamp(2rem,4.6vw,3.6rem)] font-extrabold uppercase leading-[1.02] tracking-tight text-bone"
            >
              Walk the loop &mdash;{" "}
              <span className="text-ember-400">five moves, no fluff.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9">
            <p className="max-w-[42ch] text-[15px] leading-relaxed text-ink-200/75">
              The whole product runs on five surfaces. Watch them work, then
              go run them yourself. Hover to pause. Click a step to jump.
            </p>
          </div>
        </div>

        {/* Tour body — generous gap, sticky mockup on desktop */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="mt-14 grid grid-cols-1 gap-y-14 lg:mt-20 lg:grid-cols-12 lg:gap-x-16"
        >
          {/* Step list — left rail */}
          <ol className="flex flex-col lg:col-span-5">
            {STEPS.map((s, i) => {
              const isActive = i === active;
              return (
                <li key={s.index} className="relative">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={isActive ? "step" : undefined}
                    className="group flex w-full items-start gap-6 border-t border-white/[0.06] py-8 text-left transition last:border-b md:gap-8 md:py-10"
                  >
                    {/* Display-type index — animates between active/inactive sizes */}
                    <span
                      className={`shrink-0 font-mono leading-none tabular-nums tracking-tighter transition-all duration-500 ${
                        isActive
                          ? "text-[44px] md:text-[64px] font-extrabold text-ember-400"
                          : "text-[28px] md:text-[36px] font-bold text-ink-300/40 group-hover:text-ink-100/70"
                      }`}
                    >
                      {s.index}
                    </span>

                    <div className="min-w-0 flex-1 pt-1">
                      <h3
                        className={`font-sans uppercase leading-tight tracking-tight transition-all duration-300 ${
                          isActive
                            ? "text-[22px] md:text-[26px] font-extrabold text-bone"
                            : "text-[18px] md:text-[20px] font-bold text-ink-200/70 group-hover:text-bone"
                        }`}
                      >
                        {s.title}
                      </h3>
                      <p
                        className={`mt-2 max-w-[44ch] font-mono text-[11px] uppercase tracking-[0.18em] transition ${
                          isActive
                            ? "text-ember-400/85"
                            : "text-ink-300/50 group-hover:text-ink-100/70"
                        }`}
                      >
                        {s.satire}
                      </p>

                      <AnimatePresence initial={false}>
                        {isActive ? (
                          <motion.div
                            key="body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: 0.45,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="overflow-hidden"
                          >
                            <p className="mt-4 max-w-[52ch] text-[14px] leading-relaxed text-ink-200/85">
                              {s.body}
                            </p>
                            {/* Auto-advance progress bar — thicker, more visible */}
                            <div
                              key={`bar-${i}-${paused}`}
                              className="mt-6 h-[2px] w-full overflow-hidden bg-white/10"
                              aria-hidden
                            >
                              <motion.span
                                initial={{ width: 0 }}
                                animate={
                                  paused ? { width: "20%" } : { width: "100%" }
                                }
                                transition={{
                                  duration: paused ? 0.3 : STEP_MS / 1000,
                                  ease: paused ? "easeOut" : "linear",
                                }}
                                className="block h-full bg-ember-400"
                              />
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </button>
                </li>
              );
            })}

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPaused((v) => !v)}
                aria-label={paused ? "Resume tour" : "Pause tour"}
                className="inline-flex items-center gap-2 border border-white/15 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-bone/85 transition hover:border-white/25 hover:text-bone"
              >
                {paused ? (
                  <>
                    <Play size={11} weight="fill" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause size={11} weight="fill" />
                    Pause
                  </>
                )}
              </button>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/60">
                {String(active + 1).padStart(2, "0")} of{" "}
                {String(STEPS.length).padStart(2, "0")}
              </span>
            </div>
          </ol>

          {/* Mockup column — sticky on desktop, framed as live demo */}
          <div className="lg:col-span-7 lg:sticky lg:top-32 lg:self-start lg:pt-12">
            <div className="relative mx-auto max-w-[560px]">
              {/* Ambient halo around the mockup */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 -z-10"
                style={{
                  background:
                    "radial-gradient(60% 60% at 50% 50%, rgb(239 123 53 / 0.10) 0%, transparent 65%)",
                }}
              />

              {/* "Currently showing" kicker — synchronized with active step */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.28em]">
                  <Broadcast
                    size={11}
                    weight="fill"
                    className="text-ember-400"
                  />
                  <span className="text-ink-300/55">Currently showing</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`kicker-${active}`}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.3 }}
                      className="font-bold text-bone"
                    >
                      {activeStep.index} /{" "}
                      {activeStep.title.replace(/\.$/, "")}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className="inline-flex items-center gap-2 border border-white/10 bg-ink-900/60 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-bone/85">
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-ember-400 opacity-70" />
                    <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-ember-400" />
                  </span>
                  Live demo
                </span>
              </div>

              {/* Mockup with stronger entry/exit motion */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.97 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Mock active={!paused} />
                </motion.div>
              </AnimatePresence>

              {/* Bottom mono caption — anchors the demo with a quiet stat */}
              <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
                <span>Frame {activeStep.index} / 05</span>
                <span>{paused ? "Paused" : "Auto-advance ~9s"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
