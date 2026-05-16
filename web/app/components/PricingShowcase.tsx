"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  CheckCircle,
  Crown,
  Lightning,
  PaperPlaneTilt,
} from "@phosphor-icons/react/dist/ssr";
import { FOUNDER_PASS_CAP, FOUNDER_PASS_SEED_CLAIMED } from "../lib/store";

const FREE_BULLETS = [
  "3 active squads",
  "Full chat & stamps",
  "Field log (30 days)",
];

const OPERATOR_BULLETS = [
  "6 squads, multiple concurrent cycles",
  "Custom cycles + Lead Captain tools",
  "Field log forever, cross-squad feed",
];

const FOUNDER_BULLETS = [
  "All current + future Operator features",
  "Locked at the founding price",
  "Founder's mark on profile",
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
};

export function PricingShowcase() {
  const founderClaimed = FOUNDER_PASS_SEED_CLAIMED;
  const founderRemaining = FOUNDER_PASS_CAP - founderClaimed;
  const founderPct = (founderClaimed / FOUNDER_PASS_CAP) * 100;

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="relative overflow-hidden border-t border-white/[0.06] bg-ink-950 py-20 md:py-24"
    >
      {/* ambient glow — single ember pulse, anchored center */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 20%, rgb(239 123 53 / 0.08) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgb(239 123 53 / 0.4) 50%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        {/* Section header — asymmetric */}
        <div className="grid grid-cols-12 items-end gap-x-6 gap-y-8">
          <motion.div {...fadeUp} className="col-span-12 md:col-span-8">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-200/60">
              <span className="h-px w-8 bg-ink-200/40" />
              Squad protocol / 005
              <span className="text-ember-400/80">/ pricing</span>
            </div>
            <h2
              id="pricing-heading"
              className="mt-6 text-balance font-sans text-[clamp(2.4rem,6.2vw,5.2rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-bone"
            >
              Free <span className="text-ember-400">works</span>.
              <br className="hidden md:block" />{" "}
              Operator <span className="text-ember-400">amplifies</span>.
              <br className="hidden md:block" />{" "}
              Founder&rsquo;s Pass{" "}
              <span className="text-ember-400">locks it</span>.
            </h2>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="col-span-12 md:col-span-4"
          >
            <p className="max-w-[42ch] text-[15px] leading-relaxed text-ink-200/80">
              Three tiers, one promise: nothing on Free gets gated
              retroactively. Pay for capacity, not for access.
            </p>
            <Link
              href="/pricing"
              className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-bone underline underline-offset-4 decoration-bone/40 transition hover:decoration-bone"
            >
              Compare every line
              <ArrowUpRight size={13} weight="bold" />
            </Link>
          </motion.div>
        </div>

        {/* Tier cards — asymmetric: Free 3 / Operator 5 / Founder 4 */}
        <div className="mt-12 grid grid-cols-1 gap-5 lg:mt-16 lg:grid-cols-12">
          {/* FREE */}
          <motion.article
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.15 }}
            className="flex flex-col border border-white/[0.08] bg-ink-900/40 p-6 lg:col-span-3"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink-300/65">
                Tier 01
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
                Forever
              </span>
            </div>

            <h3 className="mt-5 font-sans text-[20px] font-extrabold uppercase tracking-tight text-bone">
              Free
            </h3>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-sans text-[44px] font-extrabold leading-none tracking-tight text-bone">
                $0
              </span>
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/65">
              No card &middot; no trial trap
            </p>

            <p className="mt-5 text-[13px] leading-relaxed text-ink-200/80">
              The standalone product. Use it for life.
            </p>

            <ul className="mt-5 flex flex-col gap-2.5 border-t border-white/[0.06] pt-4">
              {FREE_BULLETS.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 text-[12.5px] leading-snug text-ink-100/85"
                >
                  <CheckCircle
                    size={13}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-ink-300/70"
                  />
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-7">
              <Link
                href="/auth/sign-up"
                className="tactile group inline-flex w-full items-center justify-center gap-2 border border-white/15 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-bone transition hover:border-white/30 hover:bg-white/[0.04]"
              >
                Start free
                <ArrowRight
                  size={13}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </motion.article>

          {/* OPERATOR — visually dominant */}
          <motion.article
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.25 }}
            className="relative flex flex-col border-2 border-ember-400/65 bg-ink-900/70 p-7 shadow-[0_30px_80px_-25px_rgb(239_123_53/0.35)] lg:col-span-5 lg:scale-[1.02]"
          >
            <span
              aria-hidden
              className="absolute -top-3 left-7 inline-flex items-center gap-1 bg-ember-400 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-ink-950"
            >
              <Lightning size={11} weight="fill" />
              Most men land here
            </span>

            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-ember-400/85">
                Tier 02
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
                Cancel any time
              </span>
            </div>

            <h3 className="mt-5 font-sans text-[26px] font-extrabold uppercase tracking-tight text-bone md:text-[30px]">
              Operator
            </h3>

            <div className="mt-5 flex items-end gap-3">
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-[64px] font-extrabold leading-none tracking-tight text-bone md:text-[72px]">
                  $14
                </span>
                <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-300/65">
                  / mo
                </span>
              </div>
              <span className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ember-400/85">
                or $129/yr · save 23%
              </span>
            </div>

            <p className="mt-5 text-[14.5px] leading-relaxed text-bone">
              Capacity, custom cycles, and lead tools &mdash; for serious
              squads.
            </p>

            <ul className="mt-5 flex flex-col gap-3 border-t border-white/[0.06] pt-5">
              {OPERATOR_BULLETS.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2.5 text-[14px] font-medium leading-snug text-bone"
                >
                  <CheckCircle
                    size={15}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-ember-400"
                  />
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-7">
              <Link
                href="/auth/sign-up?intent=operator"
                className="tactile group inline-flex w-full items-center justify-center gap-2 bg-bone px-5 py-3 font-sans text-[13px] font-bold uppercase tracking-[0.12em] text-ink-950 transition hover:bg-white"
              >
                Start as Operator
                <PaperPlaneTilt
                  size={14}
                  weight="fill"
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
              <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
                14-day refund on annual
              </p>
            </div>
          </motion.article>

          {/* FOUNDER */}
          <motion.article
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.35 }}
            className="relative flex flex-col border border-white/[0.10] bg-ink-900/40 p-6 lg:col-span-4"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.32em] text-ink-300/65">
                Tier 03
              </span>
              <span className="inline-flex items-center gap-1 border border-white/20 px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-bone/85">
                <Crown size={10} weight="fill" />
                {founderRemaining} of {FOUNDER_PASS_CAP} left
              </span>
            </div>

            <h3 className="mt-5 font-sans text-[22px] font-extrabold uppercase tracking-tight text-bone">
              Founder&rsquo;s Pass
            </h3>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-sans text-[44px] font-extrabold leading-none tracking-tight text-bone">
                $299
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300/65">
                one-time
              </span>
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/65">
              ~26 months of monthly &middot; pays for itself
            </p>

            {/* Live counter — visually anchors the scarcity */}
            <div className="mt-5 border border-white/[0.06] bg-ink-950/60 p-3.5">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.28em] text-ember-400/85">
                  Seats claimed
                </span>
                <span className="font-mono text-[12px] tabular-nums text-bone">
                  <span className="font-bold">{founderClaimed}</span>
                  <span className="text-ink-300/45">
                    {" "}/ {FOUNDER_PASS_CAP}
                  </span>
                </span>
              </div>
              <div
                className="mt-2 h-[3px] overflow-hidden bg-white/10"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={FOUNDER_PASS_CAP}
                aria-valuenow={founderClaimed}
              >
                <motion.span
                  initial={{ width: 0 }}
                  whileInView={{ width: `${founderPct}%` }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="block h-full bg-ember-400"
                />
              </div>
              <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-300/55">
                Real cap. Real number. Not coming back.
              </p>
            </div>

            <ul className="mt-5 flex flex-col gap-2.5 border-t border-white/[0.06] pt-4">
              {FOUNDER_BULLETS.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 text-[12.5px] leading-snug text-ink-100/85"
                >
                  <CheckCircle
                    size={13}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-bone"
                  />
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-7">
              <Link
                href="/auth/sign-up?intent=founder"
                className="tactile group inline-flex w-full items-center justify-center gap-2 border border-white/20 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-bone transition hover:border-bone hover:bg-white/[0.04]"
              >
                Claim a Pass
                <Crown size={12} weight="fill" />
              </Link>
            </div>
          </motion.article>
        </div>

        {/* Footer — pricing principles strip */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.45 }}
          className="mt-12 grid grid-cols-1 gap-x-8 gap-y-3 border-t border-white/[0.06] pt-8 md:grid-cols-4"
        >
          {[
            "Free works on its own",
            "No fake urgency",
            "Cancel actually cancels",
            "Refunds are honest",
          ].map((p) => (
            <div key={p} className="flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-ember-400/60" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-bone/85">
                {p}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
