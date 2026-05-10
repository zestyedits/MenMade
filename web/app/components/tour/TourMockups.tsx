"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Stamp,
  Lightning,
  Compass,
  Hammer,
  Pen,
  GraduationCap,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";

// Shared frame — sharp-cornered "device" the mockups live inside.
function MockFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative">
      <div className="absolute -top-3 left-6 z-10 bg-ink-950 px-2 font-mono text-[9px] uppercase tracking-[0.28em] text-ember-400/80">
        {label}
      </div>
      <div className="relative overflow-hidden border border-white/[0.08] bg-ink-900 shadow-[0_30px_60px_-25px_rgb(0_0_0/0.7)]">
        <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// 1. Enlist — fields auto-fill, button stamps on submit
export function MockEnlist({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!active) {
      setPhase(0);
      return;
    }
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2400),
      setTimeout(() => setPhase(4), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const fields = [
    { label: "Name", value: "Marcus Vega", filled: phase >= 1 },
    { label: "Email", value: "marcus@workshop.co", filled: phase >= 2 },
    { label: "Password", value: "••••••••••••", filled: phase >= 3 },
  ];

  return (
    <MockFrame label="ENLIST / 001">
      <div className="flex flex-col gap-4">
        <div className="font-sans text-[16px] font-extrabold uppercase tracking-tight text-bone">
          Cut a new ID.
        </div>
        {fields.map((f) => (
          <div key={f.label} className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-bone/80">{f.label}</span>
            <div className="relative h-9 border border-white/10 bg-ink-900/80 px-3">
              <span className="absolute inset-0 flex items-center px-3 font-mono text-[12px] text-ink-300/40">
                {f.filled ? null : `Enter your ${f.label.toLowerCase()}`}
              </span>
              <motion.span
                key={`${f.label}-${f.filled}`}
                initial={f.filled ? { width: 0 } : false}
                animate={f.filled ? { width: "auto" } : { width: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center overflow-hidden whitespace-nowrap px-3 text-[13px] text-bone"
              >
                {f.value}
                <span className="ml-0.5 inline-block h-3.5 w-px bg-ember-400" />
              </motion.span>
            </div>
          </div>
        ))}
        <motion.div
          animate={
            phase >= 4
              ? { scale: [1, 0.96, 1], backgroundColor: "rgb(255 255 255)" }
              : {}
          }
          transition={{ duration: 0.5 }}
          className="mt-2 flex items-center justify-center gap-2 bg-bone py-2.5 font-sans text-[12px] font-bold uppercase tracking-[0.18em] text-ink-950"
        >
          {phase >= 4 ? (
            <>
              <CheckCircle size={14} weight="fill" />
              Enlisted
            </>
          ) : (
            "Enlist"
          )}
        </motion.div>
      </div>
    </MockFrame>
  );
}

// 2. Brief — chips light up sequentially
export function MockBrief({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    const id = setInterval(() => setStep((s) => Math.min(s + 1, 6)), 600);
    return () => clearInterval(id);
  }, [active]);

  const chips = [
    { Icon: Hammer, label: "Build" },
    { Icon: Lightning, label: "Move" },
    { Icon: Pen, label: "Make" },
    { Icon: GraduationCap, label: "Master" },
    { Icon: Wrench, label: "Mend" },
    { Icon: Compass, label: "Mark" },
  ];

  return (
    <MockFrame label="BRIEF / 002">
      <div className="flex flex-col gap-4">
        <div className="font-sans text-[15px] font-extrabold uppercase tracking-tight text-bone">
          What are you here to do?
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/60">
          Pick one or more
        </div>
        <div className="grid grid-cols-3 gap-2">
          {chips.map((c, i) => {
            const on = step > i;
            return (
              <motion.button
                key={c.label}
                disabled
                animate={
                  on
                    ? { borderColor: "rgb(239 123 53 / 0.6)", backgroundColor: "rgb(239 123 53 / 0.08)" }
                    : { borderColor: "rgb(255 255 255 / 0.08)", backgroundColor: "rgb(255 255 255 / 0)" }
                }
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center gap-1.5 border px-2 py-3"
              >
                <c.Icon
                  size={16}
                  weight={on ? "fill" : "regular"}
                  className={on ? "text-ember-400" : "text-ink-300/70"}
                />
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                    on ? "text-bone" : "text-ink-300/70"
                  }`}
                >
                  {c.label}
                </span>
              </motion.button>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember-400/80">
            {Math.min(step, chips.length)} selected
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/60">
            02 / 04
          </span>
        </div>
      </div>
    </MockFrame>
  );
}

// 3. Matched — silhouettes resolve into named avatars
const matchedSquad = [
  { initials: "MV", name: "Marcus", tz: "PST" },
  { initials: "TP", name: "Theo", tz: "EST" },
  { initials: "WH", name: "Wes", tz: "CST" },
  { initials: "JR", name: "Jonas", tz: "MST" },
];

export function MockMatched({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!active) {
      setPhase(0);
      return;
    }
    const timers = matchedSquad.map((_, i) =>
      setTimeout(() => setPhase((p) => Math.max(p, i + 1)), 350 + i * 350),
    );
    timers.push(setTimeout(() => setPhase(matchedSquad.length + 1), 2200));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <MockFrame label="MATCH / 003">
      <div className="flex flex-col gap-4">
        <div className="font-sans text-[15px] font-extrabold uppercase tracking-tight text-bone">
          Bravo Workshop
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/60">
          5 operatives &middot; 30-day cycle starts tomorrow
        </div>
        <ul className="grid grid-cols-2 gap-2">
          {matchedSquad.map((m, i) => {
            const resolved = phase > i;
            return (
              <motion.li
                key={m.initials}
                animate={
                  resolved
                    ? {
                        borderColor: "rgb(255 255 255 / 0.12)",
                        backgroundColor: "rgb(255 255 255 / 0.02)",
                      }
                    : {
                        borderColor: "rgb(255 255 255 / 0.06)",
                        backgroundColor: "rgb(0 0 0 / 0.3)",
                      }
                }
                transition={{ duration: 0.6 }}
                className="flex items-center gap-3 border px-3 py-2"
              >
                <motion.span
                  animate={
                    resolved
                      ? { backgroundColor: "rgb(236 231 220)", color: "rgb(12 10 9)" }
                      : { backgroundColor: "rgb(40 36 32)", color: "rgb(120 113 108)" }
                  }
                  transition={{ duration: 0.6 }}
                  className="grid h-7 w-7 place-items-center rounded-full font-mono text-[10px] font-bold"
                >
                  {resolved ? m.initials : "??"}
                </motion.span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium text-bone">
                    {resolved ? m.name : "—"}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-300/60">
                    {resolved ? m.tz : "scanning"}
                  </div>
                </div>
              </motion.li>
            );
          })}
          <li className="flex items-center justify-center border border-dashed border-ember-400/40 bg-ember-400/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ember-400/85">
            You
          </li>
        </ul>
      </div>
    </MockFrame>
  );
}

// 4. Cycle — mini dashboard with ticking timer + dripping events
export function MockCycle({ active }: { active: boolean }) {
  const [seconds, setSeconds] = useState(0);
  const [events, setEvents] = useState<{ id: string; text: string }[]>([
    { id: "e0", text: "Marcus marked Day 12 — 42 min." },
  ]);

  useEffect(() => {
    if (!active) {
      setSeconds(0);
      setEvents([{ id: "e0", text: "Marcus marked Day 12 — 42 min." }]);
      return;
    }
    const tick = setInterval(() => setSeconds((s) => s + 1), 1000);
    const drips = [
      setTimeout(
        () =>
          setEvents((prev) => [
            { id: "e1", text: "Theo logged a brief: 'Frame is square.'" },
            ...prev,
          ]),
        2200,
      ),
      setTimeout(
        () =>
          setEvents((prev) => [
            { id: "e2", text: "Wes uploaded photo evidence." },
            ...prev,
          ]),
        4400,
      ),
    ];
    return () => {
      clearInterval(tick);
      drips.forEach(clearTimeout);
    };
  }, [active]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const pct = Math.min(100, (seconds / 270) * 100);

  return (
    <MockFrame label="CYCLE / 004">
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-ember-400/80">
              Day 12 / 30
            </div>
            <div className="font-sans text-[14px] font-extrabold uppercase tracking-tight text-bone">
              Forty-five focused minutes.
            </div>
          </div>
          <div className="font-mono text-[18px] font-bold tabular-nums text-bone">
            {mm}:{ss}
          </div>
        </div>
        <div className="relative h-1 overflow-hidden bg-white/10">
          <motion.span
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "linear" }}
            className="absolute inset-y-0 left-0 bg-ember-400"
          />
        </div>
        <div className="border-t border-white/[0.06] pt-3">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-300/60">
            Squad activity
          </div>
          <ul className="mt-2 flex flex-col gap-1.5">
            <AnimatePresence initial={false}>
              {events.slice(0, 3).map((e) => (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-[11.5px] leading-snug text-ink-100/85"
                >
                  <span className="mr-1.5 inline-block h-1 w-1 translate-y-[-2px] rounded-full bg-ember-400/80" />
                  {e.text}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </MockFrame>
  );
}

// 5. Finish — Day 30/30 stamp + completion
export function MockFinish({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!active) {
      setPhase(0);
      return;
    }
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1100),
      setTimeout(() => setPhase(3), 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <MockFrame label="FINISH / 005">
      <div className="flex flex-col items-center gap-4 py-3 text-center">
        <motion.div
          animate={
            phase >= 1
              ? { scale: [0.6, 1.05, 1], opacity: 1, rotate: [-6, 0, 0] }
              : { opacity: 0 }
          }
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative grid h-24 w-24 place-items-center border-2 border-ember-400 bg-ember-400/10"
        >
          <Stamp size={32} weight="fill" className="text-ember-400" />
          <span className="absolute -bottom-3 bg-ink-900 px-2 font-mono text-[9px] uppercase tracking-[0.28em] text-ember-400">
            Cycle close
          </span>
        </motion.div>
        <motion.div
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.5 }}
          className="font-sans text-[18px] font-extrabold uppercase tracking-tight text-bone"
        >
          Day 30 / 30
        </motion.div>
        <motion.div
          animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-3 gap-3 border-y border-white/[0.06] py-3 text-center"
        >
          <div>
            <div className="font-mono text-[14px] font-bold text-bone">87%</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-300/60">
              Squads close
            </div>
          </div>
          <div>
            <div className="font-mono text-[14px] font-bold text-bone">5/5</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-300/60">
              Operatives
            </div>
          </div>
          <div>
            <div className="font-mono text-[14px] font-bold text-bone">26d</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-300/60">
              Streak
            </div>
          </div>
        </motion.div>
        <motion.p
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[28ch] font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/70"
        >
          Signed by your squad. No participation trophies.
        </motion.p>
      </div>
    </MockFrame>
  );
}
