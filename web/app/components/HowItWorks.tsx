"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Recruit three to eight men.",
    body: "Group chat people you'd want at your funeral, not your followers. Squads of three feel intimate; eight is the cap before it goes generic.",
    detail: "Average squad size: 5.4",
  },
  {
    n: "02",
    title: "Pick a challenge with teeth.",
    body: "Not a habit. A finish line. Six weeks, ninety days, one hundred. The squad locks the cycle and the stakes; everyone signs.",
    detail: "Median cycle length: 71 days",
  },
  {
    n: "03",
    title: "Show up. Get logged. Repeat.",
    body: "Daily check-ins are 9 seconds. The ledger is public to your squad. Miss a day, the chat asks why &mdash; gently the first time.",
    detail: "Squad close rate: 87%",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="relative overflow-hidden border-t border-white/[0.06] bg-paper text-ink-950"
    >
      {/* Reversed palette section — same palette family, swapped surface (taste-skill: cross-section contrast) */}
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <div className="grid grid-cols-12 items-end gap-x-6 gap-y-8">
          <div className="col-span-12 md:col-span-7">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-700/70">
              <span className="h-px w-8 bg-ink-700/40" />
              Squad protocol / 003
            </div>
            <h2 className="mt-5 font-sans text-[clamp(2rem,4.6vw,3.6rem)] font-medium leading-[1.02] tracking-[-0.03em] text-ink-950">
              The whole thing&nbsp;
              <span className="text-ember-600">runs in three moves.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9">
            <p className="max-w-[40ch] text-[15px] leading-relaxed text-ink-700">
              We obsessively cut every screen that didn&rsquo;t earn its
              keep. No feed. No streak shame. Just the three motions a squad
              actually needs.
            </p>
          </div>
        </div>

        {/* Steps — second-read moment: oversized numerals double as structural rule */}
        <div className="mt-16 md:mt-24">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-12 items-start gap-x-4 border-t border-ink-300/30 py-10 md:py-14"
            >
              {/* Oversized numeral — the second-read moment */}
              <div className="col-span-3 md:col-span-2">
                <div className="font-mono text-[clamp(3.6rem,9vw,7.2rem)] font-medium leading-[0.9] tracking-[-0.04em] text-ink-950">
                  {s.n}
                </div>
              </div>

              <div className="col-span-9 md:col-span-7">
                <h3 className="font-sans text-[clamp(1.5rem,2.8vw,2.1rem)] font-medium leading-[1.08] tracking-[-0.02em] text-ink-950">
                  {s.title}
                </h3>
                <p
                  className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-ink-700"
                  dangerouslySetInnerHTML={{ __html: s.body }}
                />
              </div>

              <div className="col-span-12 mt-4 md:col-span-3 md:mt-2">
                <div className="flex items-center gap-3 md:justify-end">
                  <span className="h-px flex-1 bg-ink-300/30 md:max-w-[40px]" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-700/85">
                    {s.detail}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          <div className="border-t border-ink-300/30" />
        </div>

        {/* Editorial side-image — supporting, not decorative */}
        <div className="mt-20 grid grid-cols-12 gap-6 md:mt-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative col-span-12 aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] md:col-span-7"
          >
            <Image
              src="/generated/section-how.png"
              alt=""
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover"
            />
          </motion.div>
          <div className="col-span-12 self-end md:col-span-4 md:col-start-9">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-700/70">
              From the field log
            </div>
            <blockquote className="mt-4 font-sans text-[20px] leading-snug tracking-[-0.01em] text-ink-950 md:text-[22px]">
              &ldquo;The chat went quiet for two days, then Ramon dropped a
              cold-plunge video at 5:42am. The squad was up by six. Nobody
              missed the next morning.&rdquo;
            </blockquote>
            <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-700/85">
              &mdash; Squad 142 / day 41
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
