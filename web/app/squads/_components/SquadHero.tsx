"use client";

import { motion } from "framer-motion";
import { Broadcast, Crown, Lightning, Timer } from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "../../components/ui/Avatar";
import { LiveDot } from "../../components/ui/LiveDot";
import { MonoLabel } from "../../components/ui/MonoLabel";
import type { Squad } from "../../chat/_data/seed";

type Props = {
  squad: Squad;
  myHandle: string;
  myName: string;
};

const ease = [0.16, 1, 0.3, 1] as const;

export function SquadHero({ squad, myHandle, myName }: Props) {
  const onlineCount =
    squad.roster.filter((m) => m.online).length + 1; // +1 = you
  const totalCount = squad.roster.length + 1;
  const lead = squad.roster.find((r) => r.role === "lead");
  const daysRemaining = Math.max(0, squad.totalDays - squad.cycleDay);
  const progressPct = Math.min(
    100,
    Math.round((squad.cycleDay / squad.totalDays) * 100),
  );

  return (
    <section
      aria-label="Squad header"
      className="relative overflow-hidden border-b border-white/[0.06] bg-ink-900"
    >
      {/* Ambient ember on the right side */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 80% at 100% 0%, rgb(239 123 53 / 0.10) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-5 py-10 md:px-10 md:py-14">
        {/* Top row — callsign chip + live status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-wrap items-center gap-3"
        >
          <span className="inline-flex items-center gap-2 border border-white/15 bg-ink-800 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.32em] text-bone">
            <Broadcast size={11} weight="fill" />
            {squad.callsign}
          </span>
          <span aria-hidden className="h-3 w-px bg-white/15" />
          <MonoLabel>Squad ledger / 001</MonoLabel>
          <span aria-hidden className="h-3 w-px bg-white/15" />
          <LiveDot label="Live channel" />
        </motion.div>

        {/* Squad name — display + lead callout under it */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease }}
          className="mt-5 text-balance font-sans text-[clamp(2.4rem,6vw,5rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-bone"
        >
          {squad.name}
        </motion.h1>

        {lead ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease }}
            className="mt-4 flex flex-wrap items-center gap-2.5 text-[13.5px] text-ink-200/85"
          >
            <Crown size={13} weight="regular" className="text-ink-300/70" />
            <span>
              Led by{" "}
              <span className="font-bold text-bone">{lead.name}</span>
            </span>
            <span aria-hidden className="h-3 w-px bg-white/15" />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/60">
              @{lead.handle}
            </span>
          </motion.div>
        ) : null}

        {/* Cycle context strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease }}
          className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-white/[0.06] py-5 md:grid-cols-4"
        >
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink-300/55">
              Cycle
            </span>
            <span className="mt-1.5 font-mono text-[13px] tabular-nums text-ink-200/85">
              {squad.cycleCode}
            </span>
          </div>
          {/* Day is the load-bearing value — only one number on this strip
              earns the bold, large treatment; the rest are intentionally
              dialed down so the eye lands here first. */}
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink-300/55">
              Day
            </span>
            <span className="mt-1.5 font-mono text-[18px] tabular-nums text-bone">
              <span className="font-extrabold">
                {String(squad.cycleDay).padStart(2, "0")}
              </span>
              <span className="text-ink-300/55">
                {" / "}
                {String(squad.totalDays).padStart(2, "0")}
              </span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink-300/55">
              Intensity
            </span>
            <span className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[13px] uppercase text-ink-200/85">
              <Lightning size={12} weight="bold" className="text-ink-300/65" />
              {squad.intensity}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink-300/55">
              On channel
            </span>
            <span className="mt-1.5 font-mono text-[13px] tabular-nums text-ink-200/85">
              {onlineCount}
              <span className="text-ink-300/55"> / {totalCount}</span>
            </span>
          </div>
        </motion.div>

        {/* Bottom row — progress bar + countdown + roster preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease }}
          className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto]"
        >
          {/* Cycle progress */}
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink-300/55">
                Cycle progress
              </span>
              <span className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-bone">
                <Timer size={11} weight="bold" className="text-ink-300/65" />
                <span className="font-bold tabular-nums">{daysRemaining}</span>
                <span className="text-ink-300/55">days left</span>
              </span>
            </div>
            <div
              className="relative h-1.5 w-full overflow-hidden bg-white/[0.08]"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Cycle progress ${progressPct}%`}
            >
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.1, delay: 0.3, ease }}
                className="block h-full bg-ember-400"
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-300/55">
              <span>Started Day 01</span>
              <span className="tabular-nums">{progressPct}%</span>
              <span>Closes Day {String(squad.totalDays).padStart(2, "0")}</span>
            </div>
          </div>

          {/* Roster avatar stack */}
          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink-300/55">
              Members
            </span>
            <div className="flex -space-x-2.5">
              {/* You first — bone ring instead of ember, "you" is the anchor */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3, ease }}
                className="relative ring-2 ring-ink-900"
              >
                <Avatar name={myName} size="md" />
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-bone ring-2 ring-ink-900"
                />
              </motion.div>
              {squad.roster.slice(0, 6).map((m, i) => (
                <motion.div
                  key={m.handle}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.32 + 0.04 * (i + 1),
                    ease,
                  }}
                  className="group relative ring-2 ring-ink-900"
                >
                  <Avatar name={m.name} size="md" />
                  <span
                    aria-hidden
                    className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-ink-900 ${
                      m.online ? "bg-ember-400" : "bg-ink-500"
                    }`}
                  />
                  {m.role === "lead" ? (
                    <span
                      aria-label="Squad lead"
                      className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center border border-bone bg-ink-900 text-bone"
                    >
                      <Crown size={9} weight="fill" />
                    </span>
                  ) : null}
                  {/* Tooltip on hover */}
                  <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap border border-white/15 bg-ink-900 px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-bone opacity-0 transition group-hover:opacity-100">
                    {m.name.split(" ")[0]} &middot; @{m.handle}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
