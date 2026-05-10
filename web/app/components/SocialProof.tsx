"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Marcus Adebayo",
    role: "Squad 047 &middot; Lagos",
    avatar: "/generated/avatar-1.png",
    quote:
      "I'd quit two running plans on my own. Sixty-three days into squad cycle one I ran my first half. Five guys at the finish line, three of them flew in.",
  },
  {
    name: "Eitan Voss",
    role: "Squad 198 &middot; Tel Aviv",
    avatar: "/generated/avatar-2.png",
    quote:
      "Therapy didn't fix my drinking, but six men in a chat I couldn't ignore did. 217 days dry. The streak is shared, that's why it holds.",
  },
  {
    name: "Tomás Reinholt",
    role: "Squad 311 &middot; São Paulo",
    avatar: "/generated/avatar-3.png",
    quote:
      "We picked 'ship one side project in 90 days.' Four of us launched, the fifth pivoted twice. The accountability was the whole product.",
  },
  {
    name: "Devan Okafor",
    role: "Squad 022 &middot; Atlanta",
    avatar: "/generated/avatar-4.png",
    quote:
      "First squad I've been in where 'how are you' had a follow-up question. Saved a friendship I almost let go cold.",
  },
];

export function SocialProof() {
  return (
    <section id="proof" className="relative bg-ink-950 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid grid-cols-12 items-end gap-x-6 gap-y-6">
          <div className="col-span-12 md:col-span-7">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-300/70">
              <span className="h-px w-8 bg-ink-300/30" />
              Squad protocol / 004
            </div>
            <h2 className="mt-5 font-sans text-[clamp(2rem,4.6vw,3.6rem)] font-medium leading-[1.02] tracking-[-0.03em] text-bone">
              The men inside&nbsp;
              <span className="text-ember-400">talk like men inside.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9">
            <p className="max-w-[36ch] text-[15px] leading-relaxed text-ink-200/80">
              Real squads, real cycles. Pulled from end-of-cycle debriefs,
              published with permission. Names &amp; cities verified.
            </p>
          </div>
        </div>

        {/* Asymmetric quote layout — large lead quote + 3 supporting quotes (no 3-column slop) */}
        <div className="mt-14 grid grid-cols-12 gap-4 md:gap-5">
          <motion.figure
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-12 grid grid-cols-12 items-stretch gap-0 overflow-hidden rounded-[var(--radius-card)] border border-white/[0.06] bg-ink-900/55 backdrop-blur-md md:col-span-7"
          >
            <div className="relative col-span-12 aspect-[4/5] overflow-hidden md:col-span-5 md:aspect-auto">
              <Image
                src={testimonials[0].avatar}
                alt={testimonials[0].name}
                fill
                sizes="(min-width: 768px) 30vw, 100vw"
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
            <div className="col-span-12 flex flex-col justify-between p-7 md:col-span-7 md:p-10">
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ember-400/85">
                Squad debrief
              </div>
              <blockquote className="mt-6 text-[22px] font-medium leading-snug tracking-[-0.015em] text-bone md:text-[26px]">
                &ldquo;{testimonials[0].quote}&rdquo;
              </blockquote>
              <figcaption className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-5">
                <div>
                  <div className="text-[14px] font-medium text-bone">
                    {testimonials[0].name}
                  </div>
                  <div
                    className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-300/75"
                    dangerouslySetInnerHTML={{ __html: testimonials[0].role }}
                  />
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-300/60">
                  Cycle 03
                </span>
              </figcaption>
            </div>
          </motion.figure>

          {/* Right column — three vertically stacked smaller quotes */}
          <div className="col-span-12 grid grid-cols-1 gap-4 md:col-span-5 md:gap-5">
            {testimonials.slice(1).map((t, i) => (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.7,
                  delay: 0.06 * (i + 1),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex items-start gap-5 rounded-[var(--radius-card)] border border-white/[0.06] bg-ink-900/55 p-6 backdrop-blur-md md:p-7"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <blockquote className="text-[14.5px] leading-relaxed text-bone/95">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-3 flex items-center justify-between">
                    <div className="text-[13px] font-medium text-bone">
                      {t.name}
                    </div>
                    <div
                      className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-300/70"
                      dangerouslySetInnerHTML={{ __html: t.role }}
                    />
                  </figcaption>
                </div>
              </motion.figure>
            ))}
          </div>
        </div>

        {/* Numeric strip — organic numbers, no fake 99% */}
        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/[0.06] pt-10 md:grid-cols-4">
          {[
            ["47,238", "Active members"],
            ["12,847", "Squads in cycle"],
            ["521,394", "Challenges closed"],
            ["87.4%", "Median squad close rate"],
          ].map(([n, l]) => (
            <div key={l} className="flex flex-col gap-2">
              <div className="font-mono text-[clamp(1.8rem,3vw,2.4rem)] font-medium tracking-[-0.02em] text-bone">
                {n}
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300/70">
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
