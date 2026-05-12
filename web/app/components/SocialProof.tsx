"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CountUp } from "./CountUp";

const leadQuote = {
  name: "Marcus Adebayo",
  role: "Squad 047 · Lagos",
  avatar: "/generated/avatar-1.png",
  quote:
    "I'd quit two running plans on my own. Sixty-three days into squad cycle one I ran my first half. Five guys at the finish line, three of them flew in.",
};

const stats: { value: number; suffix?: string; label: string }[] = [
  { value: 47238, label: "Active members" },
  { value: 12847, label: "Squads in cycle" },
  { value: 521394, label: "Challenges closed" },
  { value: 87, suffix: "%", label: "Median close rate" },
];

export function SocialProof() {
  return (
    <section id="proof" className="relative bg-ink-950 py-20 md:py-24">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid grid-cols-12 items-end gap-x-6 gap-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-12 md:col-span-7"
          >
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-300/70">
              <span className="h-px w-8 bg-ink-300/30" />
              Squad protocol / 003
            </div>
            <h2 className="mt-5 font-sans text-[clamp(2rem,4.6vw,3.6rem)] font-medium leading-[1.02] tracking-[-0.03em] text-bone">
              The men inside&nbsp;
              <span className="text-ember-400">talk like men inside.</span>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-12 md:col-span-4 md:col-start-9"
          >
            <p className="max-w-[36ch] text-[15px] leading-relaxed text-ink-200/80">
              One squad debrief, pulled with permission. Numbers verified
              against current cycle data.
            </p>
          </motion.div>
        </div>

        {/* Single hero quote — wider, tighter than before */}
        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 grid grid-cols-1 items-stretch gap-0 overflow-hidden rounded-[var(--radius-card)] border border-white/[0.06] bg-ink-900/55 backdrop-blur-md md:grid-cols-12"
        >
          <div className="relative aspect-[4/5] overflow-hidden md:col-span-4 md:aspect-auto">
            <Image
              src={leadQuote.avatar}
              alt={leadQuote.name}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgb(12 10 9 / 0) 50%, rgb(12 10 9 / 0.55) 100%)",
              }}
            />
          </div>
          <div className="flex flex-col justify-between p-7 md:col-span-8 md:p-12">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ember-400/85">
              Squad debrief
            </div>
            <blockquote className="mt-6 text-balance text-[clamp(1.4rem,2.2vw,2rem)] font-medium leading-snug tracking-[-0.015em] text-bone">
              &ldquo;{leadQuote.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-5">
              <div>
                <div className="text-[14px] font-medium text-bone">
                  {leadQuote.name}
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-300/75">
                  {leadQuote.role}
                </div>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-300/60">
                Cycle 03
              </span>
            </figcaption>
          </div>
        </motion.figure>

        {/* Animated number strip — counts up as it enters view */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/[0.06] pt-10 md:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-2">
              <CountUp
                value={s.value}
                suffix={s.suffix ?? ""}
                className="font-mono text-[clamp(1.8rem,3vw,2.4rem)] font-medium tabular-nums tracking-[-0.02em] text-bone"
              />
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300/70">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
