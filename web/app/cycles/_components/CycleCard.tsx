"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Users, Flag } from "@phosphor-icons/react/dist/ssr";
import {
  type CycleTemplate,
  FOCUS_LABELS,
  INTENSITY_LABELS,
  INTENSITY_DOTS,
} from "../_data/cycles";

type Props = {
  cycle: CycleTemplate;
  featured?: boolean;
  delay?: number;
};

export function CycleCard({ cycle, featured = false, delay = 0 }: Props) {
  const dots = INTENSITY_DOTS[cycle.intensity];
  const closeRateText = `${cycle.closeRate}% close rate`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex h-full flex-col border bg-ink-900/40 transition hover:bg-ink-900/60 ${
        featured
          ? "border-ember-400/40 lg:col-span-2 lg:row-span-2"
          : "border-white/[0.08]"
      }`}
    >
      <Link
        href={`/auth/sign-up?intent=cycle:${cycle.code}`}
        aria-label={`Start cycle ${cycle.code}: ${cycle.name}`}
        className="flex flex-1 flex-col p-6 md:p-7"
      >
        {/* Header — code + focus tag, length + intensity dots on the right */}
        <header className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-bone">
              {cycle.code}
            </span>
            <span aria-hidden className="h-3 w-px bg-white/15" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/65">
              {FOCUS_LABELS[cycle.focus]}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] tabular-nums text-bone">
              {cycle.length}d
            </span>
            <span
              aria-label={`Intensity: ${INTENSITY_LABELS[cycle.intensity]}`}
              className="flex items-center gap-0.5"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 ${
                    i < dots ? "bg-ember-400" : "bg-white/15"
                  }`}
                />
              ))}
            </span>
          </div>
        </header>

        {/* Name + summary */}
        <div className="mt-5 flex-1">
          <h3
            className={`font-sans uppercase leading-[1.05] tracking-tight text-bone ${
              featured ? "text-[28px] md:text-[34px]" : "text-[20px] md:text-[22px]"
            } font-extrabold`}
          >
            {cycle.name}
          </h3>
          <p
            className={`mt-3 max-w-[44ch] leading-relaxed text-ink-200/85 ${
              featured ? "text-[15px]" : "text-[13.5px]"
            }`}
          >
            {cycle.summary}
          </p>

          {/* Featured cards show the brief, regular cards stay terse */}
          {featured ? (
            <p className="mt-4 max-w-[55ch] text-[13.5px] leading-relaxed text-ink-200/70">
              {cycle.brief}
            </p>
          ) : null}
        </div>

        {/* Footer — author, runs count, close rate, action arrow */}
        <footer className="mt-5 flex items-end justify-between gap-3 border-t border-white/[0.06] pt-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/65">
              <span className="inline-flex items-center gap-1.5">
                <Users size={11} weight="bold" />
                {cycle.runsCount.toLocaleString()}
              </span>
              <span aria-hidden className="h-2.5 w-px bg-white/15" />
              <span className="inline-flex items-center gap-1.5">
                <Flag size={11} weight="bold" />
                {closeRateText}
              </span>
            </div>
            <p className="mt-2 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/55">
              By {cycle.author}
            </p>
          </div>
          <span
            aria-hidden
            className="grid h-9 w-9 shrink-0 place-items-center border border-white/15 text-bone transition group-hover:border-ember-400/60 group-hover:bg-ember-400/[0.08] group-hover:text-ember-400"
          >
            <ArrowUpRight size={14} weight="bold" />
          </span>
        </footer>
      </Link>
    </motion.article>
  );
}
