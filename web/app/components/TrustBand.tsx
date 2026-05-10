"use client";

import { motion } from "framer-motion";

const items = [
  "47,238 active members",
  "12,847 squads formed",
  "521,394 challenges closed out",
  "4.8 / 5 from the men inside",
  "98 day median streak",
  "no algorithm, no feed",
];

export function TrustBand() {
  return (
    <section
      aria-label="Squad signal"
      className="relative border-y border-white/5 bg-ink-950"
    >
      <div className="mx-auto flex max-w-[1400px] items-stretch gap-6 overflow-hidden px-5 py-7 md:px-10">
        <span className="hidden shrink-0 self-center font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/70 md:inline">
          Signal /
        </span>
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <motion.div
            className="marquee-track flex w-max items-center gap-10"
            initial={false}
          >
            {[...items, ...items].map((label, i) => (
              <span
                key={i}
                className="flex items-center gap-3 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.18em] text-ink-200/70"
              >
                <span className="h-px w-6 bg-ink-300/30" />
                {label}
                <span className="text-ember-400/70">&bull;</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
