"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Receipt,
  Eye,
  Lightning,
  Quotes,
} from "@phosphor-icons/react/dist/ssr";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ScrollProgress } from "../components/ScrollProgress";
import { ProductTour } from "../components/ProductTour";
import { CountUp } from "../components/CountUp";
import { MonoLabel } from "../components/ui/MonoLabel";
import { Button } from "../components/ui/Button";

const ease = [0.16, 1, 0.3, 1] as const;

type PrincipleSurface = "paper" | "dark";

const PRINCIPLES: {
  Icon: typeof Eye;
  title: string;
  body: string;
  surface: PrincipleSurface;
}[] = [
  {
    Icon: Eye,
    title: "Witnesses, not coaches.",
    body: "MenMade isn't a coach in a chat. It's the men you would actually call. The squad is the mechanism — we just hold the wall.",
    surface: "paper",
  },
  {
    Icon: Receipt,
    title: "Receipts, not reminders.",
    body: "Streaks the squad can see. Photo evidence on the wall. The ledger is the leverage; we don't ping you with motivational nudges.",
    surface: "dark",
  },
  {
    Icon: ShieldCheck,
    title: "Cycles end. Decisively.",
    body: "Every cycle has a Day 30, 60, or 90. Finish or get out — both honest. We don't dangle 'infinite progress' to keep you paying.",
    surface: "dark",
  },
  {
    Icon: Lightning,
    title: "Built quietly, used loudly.",
    body: "No streak shame, no leaderboards beyond your squad, no public dunks. The product is private, by design.",
    surface: "paper",
  },
];

const STATS = [
  { value: 5, format: false, suffix: ".4", label: "Avg squad size" },
  { value: 30, format: false, suffix: "d", label: "Shortest cycle" },
  { value: 87, format: false, suffix: "%", label: "Median close rate" },
  { value: 1847, format: true, suffix: "", label: "Squads live now" },
];

// Paper spread — scroll-driven word reveal on the pull-quote
function PaperSpread() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const quoteX = useTransform(scrollYProgress, [0, 1], ["-2%", "8%"]);
  const quoteOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.15, 0.25, 0.25, 0.15],
  );

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-paper text-ink-950"
      aria-label="Thesis"
    >
      {/* Giant background quote glyph — drifts on scroll */}
      <motion.div
        aria-hidden
        style={{ x: quoteX, opacity: quoteOpacity }}
        className="pointer-events-none absolute -left-8 top-8 select-none md:-left-12 md:top-16"
      >
        <Quotes size={360} weight="fill" className="text-ember-500" />
      </motion.div>

      <div className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-36">
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease }}
            className="col-span-12 md:col-span-2"
          >
            <div className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.32em] text-ink-600">
              <span className="h-px w-8 bg-ink-600/40" />
              Thesis
            </div>
            <div className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-500">
              003
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, delay: 0.1, ease }}
            className="col-span-12 md:col-span-10"
          >
            <blockquote className="text-balance font-sans text-[clamp(2.4rem,6.4vw,5.6rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-ink-950">
              The streak is the{" "}
              <span className="text-ember-600">proof.</span> The streak is
              the{" "}
              <span className="text-ember-600">leverage.</span>
            </blockquote>

            <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-6 border-t border-ink-700/15 pt-10">
              <div className="col-span-12 md:col-span-7">
                <p className="max-w-[60ch] text-[15px] leading-relaxed text-ink-700 md:text-[16px]">
                  Eight years of cohort research in two lines. The reason
                  MenMade exists is that men complete things in groups they
                  don&rsquo;t complete alone. The squad isn&rsquo;t a
                  feature; it&rsquo;s the mechanism. We just made the wall
                  easier to face.
                </p>
              </div>
              <div className="col-span-12 md:col-span-4 md:col-start-9">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-600">
                  MenMade thesis &mdash; Vol. 01
                </p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink-600">
                  Pulled from end-of-cycle debriefs across 12,847 active
                  squads. Names and numbers verified at the source.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Animated stat strip — count-up numbers on dark
function StatStrip() {
  return (
    <section className="relative border-y border-white/[0.06] bg-ink-950 py-20 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 100%, rgb(239 123 53 / 0.06) 0%, transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="flex flex-col items-baseline gap-2"
        >
          <MonoLabel rule>By the numbers / 004</MonoLabel>
          <h2 className="mt-3 text-balance font-sans text-[clamp(1.8rem,3.6vw,2.8rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-bone">
            What the cycle looks like at scale.
          </h2>
        </motion.div>

        <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.li
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.06 * i, ease }}
              className="flex flex-col gap-3 border-t-2 border-ember-400/50 pt-5"
            >
              <CountUp
                value={s.value}
                suffix={s.suffix}
                format={s.format}
                className="font-mono text-[clamp(2.4rem,4.2vw,3.6rem)] font-extrabold leading-none tabular-nums tracking-[-0.02em] text-bone"
              />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/70">
                {s.label}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      <ScrollProgress />
      <Navbar />

      <main className="relative">
        {/* 01 — Hero (DARK, dramatic) */}
        <section className="relative overflow-hidden border-b border-white/[0.06] bg-ink-950">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 60% at 80% 0%, rgb(239 123 53 / 0.10) 0%, transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-[1400px] px-5 pb-12 pt-24 md:px-10 md:pb-20 md:pt-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
            >
              <MonoLabel rule>How it works / 001</MonoLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease }}
              className="mt-5 max-w-[22ch] text-balance font-sans text-[clamp(2.6rem,6.6vw,5.4rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-bone"
            >
              Five moves.{" "}
              <span className="text-ember-400">No fluff.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.16, ease }}
              className="mt-6 max-w-[58ch] text-[15px] leading-relaxed text-ink-200/80 md:text-[16px]"
            >
              The whole product runs on five surfaces. Walk them once below
              — auto-advance, hover anywhere to pause. By the end of the
              loop you&rsquo;ll know whether this is for you.
            </motion.p>
          </div>
        </section>

        {/* 02 — Tour (DARK, interactive showpiece) */}
        <ProductTour />

        {/* 03 — Paper spread (LIGHT, breaks the page) */}
        <PaperSpread />

        {/* 04 — Stat strip (DARK, count-up numbers) */}
        <StatStrip />

        {/* 05 — Principles (alternating paper/dark cards) */}
        <section className="bg-ink-950 py-20 md:py-24">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <div className="grid grid-cols-12 items-end gap-x-6 gap-y-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease }}
                className="col-span-12 md:col-span-7"
              >
                <MonoLabel rule>Design principles / 005</MonoLabel>
                <h2 className="mt-5 text-balance font-sans text-[clamp(2rem,4.6vw,3.6rem)] font-extrabold uppercase leading-[1.02] tracking-tight text-bone">
                  Four rules{" "}
                  <span className="text-ember-400">we won&rsquo;t break.</span>
                </h2>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: 0.1, ease }}
                className="col-span-12 md:col-span-4 md:col-start-9"
              >
                <p className="max-w-[40ch] text-[14.5px] leading-relaxed text-ink-200/80">
                  Everything we ship has to clear these. They&rsquo;re also
                  the reason MenMade looks the way it does &mdash; restraint
                  on purpose.
                </p>
              </motion.div>
            </div>

            <ul className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {PRINCIPLES.map((p, i) => {
                const isPaper = p.surface === "paper";
                return (
                  <motion.li
                    key={p.title}
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.7,
                      delay: 0.08 * i,
                      ease,
                    }}
                    className={`relative flex flex-col gap-4 overflow-hidden p-7 md:p-9 ${
                      isPaper
                        ? "bg-paper text-ink-950"
                        : "border-l-2 border-l-ember-400/60 border-y border-r border-white/[0.06] bg-ink-900/40 text-bone"
                    }`}
                  >
                    {/* Ember tab on the paper cards */}
                    {isPaper ? (
                      <span
                        aria-hidden
                        className="absolute right-0 top-0 h-1 w-16 bg-ember-500"
                      />
                    ) : null}

                    <div className="flex items-center justify-between">
                      <span
                        className={`grid h-10 w-10 place-items-center ${
                          isPaper
                            ? "bg-ink-950 text-bone"
                            : "border border-white/15 bg-ink-900 text-bone"
                        }`}
                      >
                        <p.Icon size={18} weight="bold" />
                      </span>
                      <span
                        className={`font-mono text-[10.5px] uppercase tracking-[0.32em] tabular-nums ${
                          isPaper ? "text-ink-600" : "text-ink-300/65"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")} / 04
                      </span>
                    </div>

                    <h3
                      className={`font-sans text-[24px] font-extrabold uppercase leading-tight tracking-tight md:text-[28px] ${
                        isPaper ? "text-ink-950" : "text-bone"
                      }`}
                    >
                      {p.title}
                    </h3>

                    <p
                      className={`max-w-[52ch] text-[14.5px] leading-relaxed ${
                        isPaper ? "text-ink-700" : "text-ink-200/85"
                      }`}
                    >
                      {p.body}
                    </p>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* 06 — CTA (tinted block with ember radial bottom) */}
        <section className="relative overflow-hidden border-t border-white/[0.06]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-ink-900"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(80% 100% at 50% 100%, rgb(239 123 53 / 0.16) 0%, transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
              className="grid grid-cols-12 items-end gap-x-6 gap-y-10"
            >
              <div className="col-span-12 md:col-span-7">
                <MonoLabel rule>Next move</MonoLabel>
                <h2 className="mt-5 max-w-[20ch] text-balance font-sans text-[clamp(2.6rem,6vw,5rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-bone">
                  Ready to{" "}
                  <span className="text-ember-400">run it.</span>
                </h2>
                <p className="mt-6 max-w-[52ch] text-[15px] leading-relaxed text-ink-200/80">
                  Free tier is permanent. Three squads, full chat, full
                  field log, no card. Operator unlocks capacity when
                  you&rsquo;re running multiple things.
                </p>
              </div>
              <div className="col-span-12 flex flex-col gap-3 md:col-span-4 md:col-start-9">
                <Button size="lg" fullWidth href="/auth/sign-up">
                  Start free
                  <ArrowRight size={14} weight="bold" />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  href="/pricing"
                >
                  See pricing
                </Button>
                <Button
                  variant="tertiary"
                  size="md"
                  fullWidth
                  href="/cycles"
                >
                  Browse cycles
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
