"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Lightning } from "@phosphor-icons/react/dist/ssr";

export function Impact() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Subtle parallax on the image — drifts as user scrolls through the section.
  const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1.0, 1.08]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 0.95, 1]);

  return (
    <section id="impact" ref={ref} className="relative py-20 md:py-24">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        {/* Editorial intro — tight, asymmetric */}
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
              Squad protocol / 002
            </div>
            <h2 className="mt-5 font-sans text-[clamp(2rem,4.6vw,3.6rem)] font-medium leading-[1.02] tracking-[-0.03em] text-bone">
              An app that feels like<br />
              <span className="text-ember-400">a real group of friends</span>
              &nbsp;&mdash; with stakes.
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
              We built the parts a self-help app can&rsquo;t fake: a private
              squad, a real challenge, and the kind of people who notice
              you&rsquo;re slacking before you do.
            </p>
          </motion.div>
        </div>

        {/* Single hero card — full-width image, ledger callout, parallax */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-10 overflow-hidden rounded-[var(--radius-tile)] border border-white/[0.06]"
          style={{
            boxShadow: "var(--shadow-diffusion), var(--shadow-inset-edge)",
          }}
        >
          <motion.div
            className="relative aspect-[16/10] md:aspect-[16/8]"
            style={{ y: imageY, scale: imageScale }}
          >
            <Image
              src="/generated/section-impact.png"
              alt=""
              fill
              sizes="(min-width: 768px) 90vw, 100vw"
              className="object-cover"
            />
          </motion.div>

          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgb(12 10 9 / 0.0) 30%, rgb(12 10 9 / 0.65) 70%, rgb(12 10 9 / 0.95) 100%)",
              opacity: overlayOpacity,
            }}
          />

          {/* Top mono badge */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-7 md:p-10">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/85">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-bone/95 text-ink-950">
                <Lightning size={11} weight="fill" />
              </span>
              Accountability
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone/60">
              01 / 03
            </span>
          </div>

          {/* Bottom anchor copy */}
          <div className="absolute inset-x-0 bottom-0 p-7 md:p-12">
            <h3 className="max-w-[22ch] text-balance text-[28px] font-medium leading-[1.05] tracking-[-0.02em] text-bone md:text-[44px]">
              The group chat that doesn&rsquo;t let you off the hook.
            </h3>
            <p className="mt-5 max-w-[52ch] text-[14.5px] leading-relaxed text-ink-100/90 md:text-[15.5px]">
              Squads of 3 to 8. Daily check-ins. Streaks the squad can see.
              Miss a day and you owe an explanation &mdash; not to a coach,
              to your friends.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
