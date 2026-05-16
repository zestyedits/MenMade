"use client";

import { motion } from "framer-motion";
import { CheckCircle, Quotes } from "@phosphor-icons/react/dist/ssr";
import { MonoLabel } from "../../components/ui/MonoLabel";
import type { Squad } from "../../chat/_data/seed";
import { getCycle } from "../../cycles/_data/cycles";

type Props = {
  squad: Squad;
};

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease },
});

export function BriefTab({ squad }: Props) {
  // Try to find the matching cycle template for objectives. Fall back to
  // squad-specific defaults if it's a custom cycle.
  const template = getCycle(squad.cycleCode);

  const objectives = template?.objectives ?? [
    "Show up on the days the cycle calls for",
    "Submit weekly photo or doc evidence",
    "Roast missed days within reason",
    "Finish the cycle. No 'I learned a lot.'",
  ];

  const milestones = [
    {
      day: `Day 01`,
      label: "Cycle opened",
      detail: `${squad.roster.length + 1} members joined. Brief signed.`,
    },
    {
      day: `Day ${String(Math.floor(squad.totalDays / 4)).padStart(2, "0")}`,
      label: "First quarter checkpoint",
      detail: "Squad posted photos to the field log. Lead pinned the best.",
    },
    {
      day: `Day ${String(Math.floor(squad.totalDays / 2)).padStart(2, "0")}`,
      label: "Halfway mark",
      detail: "Cadence held. Two members flagged slipping — both came back.",
    },
    {
      day: `Day ${String(squad.cycleDay).padStart(2, "0")}`,
      label: "Today",
      detail: `${squad.cycleDay - 1} days in. ${squad.totalDays - squad.cycleDay} to go.`,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-10 md:px-10 md:py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Left column — brief + objectives */}
        <div className="flex flex-col gap-10 lg:col-span-7">
          <motion.section {...fadeUp(0)}>
            <MonoLabel ember>The brief</MonoLabel>
            <h2 className="mt-4 text-balance font-sans text-[clamp(1.8rem,3.4vw,2.6rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-bone">
              {template?.name ?? squad.cycleCode}
            </h2>
            <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-ink-200/85">
              {template?.brief ??
                "Custom cycle for this squad. No template — the members defined what done looks like at intake."}
            </p>

            {template?.summary ? (
              <blockquote className="mt-7 flex gap-4 border-l-2 border-ember-400/50 pl-5">
                <Quotes
                  size={20}
                  weight="fill"
                  className="shrink-0 text-ember-400/70"
                />
                <p className="text-[16px] italic leading-relaxed text-bone">
                  {template.summary}
                </p>
              </blockquote>
            ) : null}
          </motion.section>

          <motion.section {...fadeUp(0.08)}>
            <MonoLabel rule>Objectives / what done looks like</MonoLabel>
            <ul className="mt-5 flex flex-col divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {objectives.map((o, i) => (
                <motion.li
                  key={o}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.1 + 0.05 * i, ease }}
                  className="flex items-start gap-4 py-4"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center border border-white/15 bg-ink-900 font-mono text-[10px] font-bold tabular-nums text-bone">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-[14.5px] leading-relaxed text-ink-100/90">
                    {o}
                  </span>
                  <CheckCircle
                    size={14}
                    weight="bold"
                    className="mt-1 shrink-0 text-ink-300/35"
                  />
                </motion.li>
              ))}
            </ul>
          </motion.section>
        </div>

        {/* Right column — milestones + stats */}
        <div className="flex flex-col gap-8 lg:col-span-5">
          <motion.section
            {...fadeUp(0.12)}
            className="squad-paper-raised border-l-2 border-l-ember-400/35 border-y border-r border-white/[0.04] p-6"
          >
            <div className="border-b border-white/[0.06] pb-4">
              <span className="text-[11.5px] text-ink-300/70">Timeline</span>
              <h3 className="mt-1 text-[19px] font-bold leading-tight tracking-tight text-bone">
                Milestones
              </h3>
            </div>
            <ol className="mt-2 flex flex-col gap-0">
              {milestones.map((m, i) => {
                const isLast = i === milestones.length - 1;
                const isToday = m.label === "Today";
                return (
                  <motion.li
                    key={m.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: 0.18 + 0.06 * i,
                      ease,
                    }}
                    className="relative flex gap-4 pb-5 last:pb-0"
                  >
                    {/* Timeline rail */}
                    {!isLast ? (
                      <span
                        aria-hidden
                        className="absolute left-[7px] top-3 bottom-0 w-px bg-white/[0.08]"
                      />
                    ) : null}
                    {/* Dot */}
                    <span
                      aria-hidden
                      className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 ${
                        isToday
                          ? "bg-ember-400"
                          : "border border-white/20 bg-ink-900"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <h4
                          className={`text-[14px] font-bold leading-tight ${
                            isToday ? "text-bone" : "text-ink-100/90"
                          }`}
                        >
                          {m.label}
                        </h4>
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] tabular-nums text-ink-300/55">
                          {m.day}
                        </span>
                      </div>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-200/75">
                        {m.detail}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </motion.section>

          <motion.section
            {...fadeUp(0.18)}
            className="px-1"
          >
            <div className="border-b border-white/[0.08] pb-3">
              <span className="text-[11.5px] text-ink-300/70">Snapshot</span>
              <h3 className="mt-1 text-[19px] font-bold leading-tight tracking-tight text-bone">
                Squad signals
              </h3>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
              {[
                {
                  label: "Median streak",
                  value: Math.round(
                    squad.roster.reduce((acc, m) => acc + m.streak, 0) /
                      squad.roster.length,
                  ),
                },
                {
                  label: "On channel now",
                  value: squad.roster.filter((m) => m.online).length + 1,
                },
                {
                  label: "Members",
                  value: squad.roster.length + 1,
                },
                {
                  label: "Total days",
                  value: squad.totalDays,
                },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.25 + 0.04 * i,
                    ease,
                  }}
                  className="flex flex-col"
                >
                  <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
                    {s.label}
                  </dt>
                  <dd className="mt-2 font-mono text-[26px] font-extrabold tabular-nums leading-none tracking-tight text-bone">
                    {s.value}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
