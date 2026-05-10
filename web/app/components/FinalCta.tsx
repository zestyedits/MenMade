"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { MagneticButton } from "./MagneticButton";

export function FinalCta() {
  return (
    <section
      id="start"
      className="relative overflow-hidden border-t border-white/[0.06] bg-ink-950 py-28 md:py-40"
    >
      {/* Subtle palette-matched radial wash — taste-skill: tonal gradient, no AI mesh */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 110%, rgb(221 87 34 / 0.18) 0%, transparent 65%)",
        }}
      />

      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="mx-auto max-w-[920px]">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-300/70">
            <span className="h-px w-8 bg-ink-300/30" />
            Squad protocol / 005
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 font-sans text-[clamp(2.4rem,6vw,5.4rem)] font-medium leading-[0.98] tracking-[-0.035em] text-bone"
          >
            Pick the men.
            <br />
            Pick the cycle.
            <br />
            <span className="text-ember-400">Then go finish it.</span>
          </motion.h2>

          <p className="mt-8 max-w-[52ch] text-[15px] leading-relaxed text-ink-200/80 md:text-[17px]">
            Free for the first squad. No feed, no ads, no algorithm telling
            you what to feel. Bring three to seven men &mdash; we do the rest.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton
              aria-label="Start a squad"
              className="tactile group inline-flex h-13 items-center gap-2 rounded-full bg-ember-500 px-7 py-3.5 text-[15px] font-medium text-ink-950 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.45),0_22px_50px_-20px_rgb(221_87_34_/_0.85)]"
            >
              Start a squad
              <ArrowUpRight
                size={15}
                weight="bold"
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </MagneticButton>

            <a
              href="#impact"
              className="tactile inline-flex h-13 items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-6 py-3.5 text-[14px] text-bone backdrop-blur-md transition hover:bg-white/[0.07]"
            >
              Read the field log
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300/70">
            <span>iOS &middot; TestFlight</span>
            <span>Android &middot; closed beta</span>
            <span>Web &middot; live</span>
          </div>
        </div>
      </div>
    </section>
  );
}
