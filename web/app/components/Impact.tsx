"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Eye,
  Compass,
  Lightning,
} from "@phosphor-icons/react/dist/ssr";

const card =
  "group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-tile)] border border-white/[0.06] bg-ink-900/55 backdrop-blur-md transition duration-500 hover:border-white/[0.12]";
const cardShadow = {
  boxShadow: "var(--shadow-diffusion), var(--shadow-inset-edge)",
};

export function Impact() {
  return (
    <section id="impact" className="relative py-20 md:py-24">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        {/* Editorial intro — left-aligned, asymmetric */}
        <div className="grid grid-cols-12 items-end gap-x-6 gap-y-6">
          <div className="col-span-12 md:col-span-7">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-300/70">
              <span className="h-px w-8 bg-ink-300/30" />
              Squad protocol / 002
            </div>
            <h2 className="mt-5 font-sans text-[clamp(2rem,4.6vw,3.6rem)] font-medium leading-[1.02] tracking-[-0.03em] text-bone">
              An app that feels like<br />
              <span className="text-ember-400">a real group of friends</span>
              &nbsp;&mdash; with stakes.
            </h2>
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9">
            <p className="max-w-[36ch] text-[15px] leading-relaxed text-ink-200/80">
              We built the parts a self-help app can&rsquo;t fake: a private
              squad, a real challenge, and the kind of people who notice
              you&rsquo;re slacking before you do.
            </p>
          </div>
        </div>

        {/* Bento grid — pristine gapless rhythm, asymmetric (8/4 row, 4/4/4 row) */}
        <div className="mt-10 grid grid-cols-12 gap-4 md:gap-5">
          {/* Large hero card with embedded image — image-led storytelling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`${card} col-span-12 md:col-span-8 md:row-span-2 min-h-[400px] md:min-h-[520px]`}
            style={cardShadow}
          >
            <div className="absolute inset-0">
              <Image
                src="/generated/section-impact.png"
                alt=""
                fill
                sizes="(min-width: 768px) 66vw, 100vw"
                className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgb(12 10 9 / 0.0) 35%, rgb(12 10 9 / 0.55) 65%, rgb(12 10 9 / 0.95) 100%)",
                }}
              />
            </div>

            <div className="relative flex items-start justify-between p-7 md:p-9">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-bone/80">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-bone/95 text-ink-950">
                  <Lightning size={11} weight="fill" />
                </span>
                Accountability
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone/60">
                01 / 05
              </span>
            </div>

            <div className="relative p-7 pt-32 md:p-9 md:pt-40">
              <h3 className="max-w-[18ch] text-[26px] font-medium leading-[1.08] tracking-[-0.02em] text-bone md:text-[34px]">
                The group chat that doesn&rsquo;t let you off the hook.
              </h3>
              <p className="mt-4 max-w-[44ch] text-[14.5px] leading-relaxed text-ink-100/85">
                Squads of 3 to 8. Daily check-ins. Streaks the squad can see.
                Miss a day and you owe an explanation &mdash; not to a coach,
                to your friends.
              </p>
            </div>
          </motion.div>

          {/* Top-right card — Status / proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className={`${card} col-span-12 sm:col-span-6 md:col-span-4 min-h-[300px] p-7 md:p-9`}
            style={cardShadow}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-200/70">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-white/15 bg-ink-800/80 text-ember-400">
                  <Eye size={11} weight="bold" />
                </span>
                Status
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300/60">
                02 / 05
              </span>
            </div>

            <div>
              <h3 className="text-[22px] font-medium leading-snug tracking-[-0.015em] text-bone md:text-[24px]">
                Receipts, not vibes.
              </h3>
              <p className="mt-3 max-w-[34ch] text-[13.5px] leading-relaxed text-ink-200/80">
                Every rep, mile, and check-in goes on the squad ledger. The
                streak is the proof; the streak is also the leverage.
              </p>
            </div>

            {/* Mini ledger visualization */}
            <div className="mt-6 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 21 }).map((_, i) => {
                const filled = ![3, 11, 17].includes(i);
                return (
                  <span
                    key={i}
                    className={`h-3.5 rounded-[4px] ${
                      filled
                        ? "bg-ember-500/85 shadow-[0_0_0_1px_rgb(221_87_34_/_0.4)]"
                        : "bg-white/[0.06] ring-1 ring-inset ring-white/10"
                    }`}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-300/70">
              <span>21 day window</span>
              <span className="text-bone/85">streak: 18</span>
            </div>
          </motion.div>

          {/* Right column second card — Compass / direction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={`${card} col-span-12 sm:col-span-6 md:col-span-4 min-h-[300px] p-7 md:p-9`}
            style={cardShadow}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-200/70">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-white/15 bg-ink-800/80 text-ember-400">
                  <Compass size={11} weight="bold" />
                </span>
                Direction
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300/60">
                03 / 05
              </span>
            </div>

            <div>
              <h3 className="text-[22px] font-medium leading-snug tracking-[-0.015em] text-bone md:text-[24px]">
                Pick a fight worth picking.
              </h3>
              <p className="mt-3 max-w-[34ch] text-[13.5px] leading-relaxed text-ink-200/80">
                Pre-built challenge tracks from coaches and squads who
                actually finished them. Or design your own and let the squad
                vote it in.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {[
                "75 hard",
                "first half marathon",
                "100 days sober",
                "$10k saved",
                "ship a side project",
                "morning lift, 6 weeks",
              ].map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11.5px] text-ink-100/85"
                >
                  {c}
                </span>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
