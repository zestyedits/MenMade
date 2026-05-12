"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { MonoLabel } from "../components/ui/MonoLabel";
import { CycleCard } from "./_components/CycleCard";
import { CycleFilters } from "./_components/CycleFilters";
import { CYCLES, type CycleLength } from "./_data/cycles";
import type { FocusArea, Intensity } from "../lib/store";

export default function CyclesPage() {
  const [focus, setFocus] = useState<FocusArea | null>(null);
  const [length, setLength] = useState<CycleLength | null>(null);
  const [intensity, setIntensity] = useState<Intensity | null>(null);

  const filtered = useMemo(() => {
    return CYCLES.filter(
      (c) =>
        (focus === null || c.focus === focus) &&
        (length === null || c.length === length) &&
        (intensity === null || c.intensity === intensity),
    );
  }, [focus, length, intensity]);

  const hasFilters = focus !== null || length !== null || intensity !== null;
  const featured = hasFilters
    ? null
    : filtered.find((c) => c.featured) ?? null;
  const rest = featured
    ? filtered.filter((c) => c.code !== featured.code)
    : filtered;

  return (
    <>
      <Navbar />

      <main className="bg-ink-950">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 60% at 80% 0%, rgb(239 123 53 / 0.08) 0%, transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-[1400px] px-5 pb-12 pt-24 md:px-10 md:pb-16 md:pt-32">
            <MonoLabel rule>Cycle library / 001</MonoLabel>
            <h1 className="mt-5 max-w-[22ch] text-balance text-[44px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[64px]">
              Pick a fight{" "}
              <span className="text-ember-400">worth picking.</span>
            </h1>
            <p className="mt-6 max-w-[60ch] text-[15px] leading-relaxed text-ink-200/80">
              Twelve curated cycle templates. Each one has been run by real
              squads to a documented close rate. Pick yours, get matched,
              start Monday.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/70">
              <span>
                <span className="font-bold tabular-nums text-bone">
                  {CYCLES.length}
                </span>{" "}
                templates
              </span>
              <span aria-hidden className="hidden h-3 w-px self-center bg-white/15 sm:block" />
              <span>
                <span className="font-bold tabular-nums text-bone">14</span>
                <span className="text-ink-300/45"> &middot; </span>
                <span className="font-bold tabular-nums text-bone">30</span>
                <span className="text-ink-300/45"> &middot; </span>
                <span className="font-bold tabular-nums text-bone">60</span>
                <span className="text-ink-300/45"> &middot; </span>
                <span className="font-bold tabular-nums text-bone">90</span>{" "}
                day cycles
              </span>
              <span aria-hidden className="hidden h-3 w-px self-center bg-white/15 sm:block" />
              <span>
                Median squad close rate{" "}
                <span className="font-bold tabular-nums text-bone">79%</span>
              </span>
            </div>
          </div>
        </section>

        {/* Filters + grid */}
        <section className="border-b border-white/[0.06] py-12 md:py-16">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <CycleFilters
              focus={focus}
              length={length}
              intensity={intensity}
              onFocus={setFocus}
              onLength={setLength}
              onIntensity={setIntensity}
              count={filtered.length}
            />

            {/* Empty state */}
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-12 flex flex-col items-center gap-4 border border-white/[0.08] bg-ink-900/40 px-8 py-16 text-center"
              >
                <span className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ember-400/85">
                  Nothing matches
                </span>
                <p className="max-w-[44ch] text-[15px] leading-relaxed text-ink-200/80">
                  Loosen a filter and try again. Or pick a templated cycle and
                  bend it to fit &mdash; Operator unlocks custom cycles.
                </p>
              </motion.div>
            ) : (
              <>
                {/* Featured + grid (only when no filters active) */}
                {featured ? (
                  <div className="mt-10 grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-3">
                    <CycleCard cycle={featured} featured delay={0} />
                    {rest.slice(0, 2).map((c, i) => (
                      <CycleCard
                        key={c.code}
                        cycle={c}
                        delay={0.06 * (i + 1)}
                      />
                    ))}
                  </div>
                ) : null}

                {/* Remaining cards in a regular grid */}
                <div
                  className={`grid grid-cols-1 gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3 ${
                    featured ? "mt-4 md:mt-5" : "mt-10"
                  }`}
                >
                  {(featured ? rest.slice(2) : rest).map((c, i) => (
                    <CycleCard
                      key={c.code}
                      cycle={c}
                      delay={0.04 * (i + 1)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Bottom call to action — for users browsing without an account */}
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <div className="border border-white/[0.06] bg-ink-900/40 p-10 md:p-16">
              <div className="grid grid-cols-12 items-end gap-x-6 gap-y-6">
                <div className="col-span-12 md:col-span-7">
                  <MonoLabel rule>Custom cycles</MonoLabel>
                  <h2 className="mt-5 text-balance text-[32px] font-extrabold uppercase leading-tight tracking-tight text-bone md:text-[44px]">
                    Don&rsquo;t see your fight?
                  </h2>
                  <p className="mt-4 max-w-[55ch] text-[14.5px] leading-relaxed text-ink-200/80">
                    Operator unlocks custom cycles. Pick the focus, set the
                    length, write the objectives. Your squad votes it in.
                  </p>
                </div>
                <div className="col-span-12 flex flex-col gap-3 md:col-span-4 md:col-start-9">
                  <a
                    href="/pricing"
                    className="tactile group inline-flex items-center justify-center gap-2 bg-bone px-5 py-3 font-sans text-[13px] font-bold uppercase tracking-[0.12em] text-ink-950 transition hover:bg-white"
                  >
                    See Operator pricing
                  </a>
                  <a
                    href="/auth/sign-up"
                    className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-bone transition hover:border-white/30"
                  >
                    Start on Free
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
