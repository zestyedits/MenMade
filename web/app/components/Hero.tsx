"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Play } from "@phosphor-icons/react/dist/ssr";
import { MagneticButton } from "./MagneticButton";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Full-bleed image background — taste-skill: full-bleed with tonal overlay,
          bottom-left composition anchor, NOT centered, NOT left-text/right-image. */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/generated/hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
        {/* Tonal overlay — keeps text readable, palette-locked */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgb(12 10 9 / 0.30) 0%, rgb(12 10 9 / 0.55) 55%, rgb(12 10 9 / 0.92) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-3/5"
          style={{
            background:
              "linear-gradient(90deg, rgb(12 10 9 / 0.65) 0%, rgb(12 10 9 / 0.0) 100%)",
          }}
        />
      </div>

      <div className="mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col px-5 pt-24 md:px-10">
        {/* Top instrument label — concept spine: precision instrument */}
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-200/60">
          <span className="h-px w-8 bg-ink-200/40" />
          <span>Squad protocol</span>
          <span className="text-ember-400/80">/ 001</span>
        </div>

        {/* Spacer pushes hero text to bottom-left */}
        <div className="flex-1" />

        <div className="grid grid-cols-12 gap-x-6 pb-20 md:pb-28">
          <div className="col-span-12 md:col-span-9 lg:col-span-8">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-sans text-[clamp(2.6rem,7.4vw,6.5rem)] font-medium leading-[0.94] tracking-[-0.035em] text-bone"
            >
              The men who finish
              <br />
              <span className="text-ember-400">show up together.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 max-w-[44ch] text-[15px] leading-relaxed text-ink-200/85 md:text-[17px]"
            >
              MenMade is a private squad app: three to eight men, one real
              challenge, and a group that actually notices when you go quiet.
              You don&rsquo;t out-discipline a brotherhood that&rsquo;s
              watching.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <MagneticButton
                aria-label="Form your squad"
                className="tactile group inline-flex h-12 items-center gap-2 rounded-full bg-bone px-6 text-[14px] font-medium text-ink-950 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.55),0_18px_38px_-18px_rgb(221_87_34_/_0.6)] ring-1 ring-inset ring-white/10"
              >
                Form your squad
                <ArrowUpRight
                  size={14}
                  weight="bold"
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </MagneticButton>

              <button
                type="button"
                className="tactile inline-flex h-12 items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.04] px-5 text-[14px] text-bone backdrop-blur-md transition hover:bg-white/[0.08]"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-bone text-ink-950">
                  <Play size={10} weight="fill" />
                </span>
                Watch a squad cycle
                <span className="font-mono text-[11px] text-ink-300/70">
                  1:24
                </span>
              </button>
            </motion.div>
          </div>

          {/* Right-rail editorial annotation — anti-AI, supports the precision-instrument spine */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-12 mt-10 flex flex-col gap-4 md:col-span-3 md:col-start-10 md:mt-0 md:self-end lg:col-start-11 lg:col-span-2"
          >
            <div className="hairline w-full" />
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-300/70">
              Field log &mdash; March
            </div>
            <p className="font-sans text-[13px] leading-snug text-ink-200/85">
              <span className="text-bone">Squad 142</span> &mdash; six men,
              eighty-seven days, zero ghosters. Two cold plunges, one half
              marathon, one sober month.
            </p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="pulse-ring absolute inset-0 rounded-full bg-ember-400" />
                <span className="relative h-2 w-2 rounded-full bg-ember-400" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-200/70">
                Live now &middot; 1,847 squads
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
