"use client";

import { Fragment, useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  Lock,
  Crown,
  Lightning,
  Check,
  Minus,
} from "@phosphor-icons/react/dist/ssr";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ScrollProgress } from "../components/ScrollProgress";
import { MonoLabel } from "../components/ui/MonoLabel";
import { Button } from "../components/ui/Button";
type Cycle = "monthly" | "annual";

type PricingClientProps = {
  founderClaimed: number;
  founderCap: number;
};

const TIER_QUOTES = {
  free: "The standalone product. Use it forever, no card.",
  operator: "Capacity, custom cycles, and lead tools — for serious squads.",
  founder: "One decision. In for the long run. Locked at the founding price.",
};

const FREE_FEATURES = [
  "Up to 3 active squads",
  "1 cycle at a time, all templates",
  "Full squad chat — stamps, emoji, reactions",
  "Field log (30-day retention)",
  "Block, report, export — always",
];

const OPERATOR_HEADLINE_FEATURES = [
  "6 active squads (double the run)",
  "Multiple concurrent cycles",
  "Custom cycles — design your own",
  "Lead Captain tools & squad analytics",
  "Field log retention forever",
];

const OPERATOR_OTHER_FEATURES = [
  "Cross-squad activity feed",
  "Lead-only stamps",
  "Operator badge on profile",
  "Priority moderation review",
  "Direct support email",
];

const FOUNDER_FEATURES = [
  "Everything in Operator, current + future",
  "Locked at the founding price",
  "Founder's mark on profile",
  "Direct line for product input",
  "Early access to new templates (~2 wk)",
  "Founder's Wall listing (opt-in)",
];

const UPGRADE_SCENARIOS = [
  {
    handle: "Wes",
    role: "Squad lead, third cycle",
    frame: "Lead Captain tools + analytics",
    quote:
      "I was eyeballing who'd flake by Day 14. Now I see the cadence chart. Found two members mid-slip, pinged them privately, both finished. Operator paid for the cycle by Day 6.",
  },
  {
    handle: "Marcus",
    role: "Multi-track member",
    frame: "Multiple concurrent cycles + custom cycles",
    quote:
      "I wanted a 90-day workshop build running alongside a 30-day writing cycle. Free caps you to one. The custom cycle I built for the writing track wasn't in the templates anyway. Both run now.",
  },
  {
    handle: "Theo",
    role: "Finishing his first cycle",
    frame: "Field log retention forever",
    quote:
      "Day 32. Tried to look back at the rough patches around Day 8 to see what I'd written about it. Free retention drops them after Day 30. Annual was cheaper than the regret.",
  },
];

// Comparison matrix — one source of truth that the cards above gloss.
type Tier = "free" | "operator" | "founder";
type Cell = boolean | string;

const COMPARISON: {
  group: string;
  rows: { feature: string; free: Cell; operator: Cell; founder: Cell }[];
}[] = [
  {
    group: "The product, free forever",
    rows: [
      { feature: "Active squads", free: "3", operator: "6", founder: "6" },
      { feature: "Concurrent cycles", free: "1", operator: "Unlimited", founder: "Unlimited" },
      { feature: "Cycle templates", free: true, operator: true, founder: true },
      { feature: "Daily directives & streak", free: true, operator: true, founder: true },
      { feature: "Squad chat (stamps + emoji)", free: true, operator: true, founder: true },
      { feature: "Squad activity feed", free: true, operator: true, founder: true },
      { feature: "Block / report / COC", free: true, operator: true, founder: true },
      { feature: "Data export (JSON)", free: true, operator: true, founder: true },
    ],
  },
  {
    group: "Capacity & power tools",
    rows: [
      { feature: "Custom cycles (build your own)", free: false, operator: true, founder: true },
      { feature: "Lead Captain tools", free: false, operator: true, founder: true },
      { feature: "Squad analytics (completion %, attendance)", free: false, operator: true, founder: true },
      { feature: "Lead-only stamps", free: false, operator: true, founder: true },
      { feature: "Cross-squad activity feed", free: false, operator: true, founder: true },
      { feature: "Field log retention", free: "30 days", operator: "Forever", founder: "Forever" },
      { feature: "Operator badge", free: false, operator: true, founder: true },
    ],
  },
  {
    group: "Founder-only",
    rows: [
      { feature: "All future Operator features included", free: false, operator: false, founder: true },
      { feature: "Price locked at founding rate", free: false, operator: false, founder: true },
      { feature: "Founder's mark on profile", free: false, operator: false, founder: true },
      { feature: "Direct product input channel", free: false, operator: false, founder: true },
      { feature: "Early access to new templates (~2 wk)", free: false, operator: false, founder: true },
      { feature: "Founder's Wall listing (opt-in)", free: false, operator: false, founder: true },
    ],
  },
  {
    group: "Support & moderation",
    rows: [
      { feature: "Standard moderation review", free: true, operator: true, founder: true },
      { feature: "Priority moderation queue", free: false, operator: true, founder: true },
      { feature: "Standard support (community)", free: true, operator: true, founder: true },
      { feature: "Direct support email", free: false, operator: true, founder: true },
    ],
  },
];

const FAQ = [
  {
    q: "Is the free tier really free, forever?",
    a: "Yes. Permanent free tier, no trial countdown, no card required. The product works completely on Free — paid is for capacity (more squads, custom cycles, lead tools), not access.",
  },
  {
    q: "Why only 500 Founder's Passes?",
    a: "Real number, hard cap, publicly counted. We're not running a fake-scarcity countdown. When 500 sell, the tier closes; it's not coming back at the same price.",
  },
  {
    q: "Why is it 'Founder's Pass' and not 'Lifetime'?",
    a: "Apple makes us actually deliver lifetime if we say lifetime, and the company has to outlive us all. 'Founder's Pass' is the same economic deal — all current and future Operator features, locked at the founding price — without making a promise the legal system would hold us to literally forever.",
  },
  {
    q: "Can I cancel monthly anytime?",
    a: "Yes. Cancel from settings, no clicks-deep cancellation maze. Annual gets a 14-day no-questions refund. Founder's Pass too.",
  },
  {
    q: "What happens to my data if I downgrade?",
    a: "Nothing leaves you. Your field log, identity, and squad memberships stay. Above-cap squads go read-only after a 30-day grace period — finish the cycle you're in, then trim down.",
  },
  {
    q: "Apple App Store vs web pricing — are they different?",
    a: "Same price either way. Apple takes a cut on App Store purchases (we eat that), so web purchases via Stripe leave more money for development. Buy whichever way is easier.",
  },
];

export default function PricingClient({
  founderClaimed,
  founderCap,
}: PricingClientProps) {
  const [cycle, setCycle] = useState<Cycle>("annual");
  const founderRemaining = founderCap - founderClaimed;
  const founderSoldOut = founderRemaining <= 0;
  // Local alias preserves the original variable name throughout the
  // JSX below without forcing a rename of every reference.
  const FOUNDER_PASS_CAP = founderCap;

  return (
    <>
      <ScrollProgress />
      <Navbar />

      <main className="bg-ink-950">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 0%, rgb(239 123 53 / 0.06) 0%, transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-[1400px] px-5 pb-12 pt-24 md:px-10 md:pb-16 md:pt-32">
            <MonoLabel rule>Pricing / 001</MonoLabel>
            <h1 className="mt-5 max-w-[18ch] text-balance text-[44px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[64px]">
              Pay for the thing.{" "}
              <span className="text-ember-400">Not the trap.</span>
            </h1>
            <p className="mt-6 max-w-[60ch] text-[15px] leading-relaxed text-ink-200/80">
              Free tier is permanent. Paid tiers buy capacity, not access. No
              fake urgency, no countdown timer, no &ldquo;trial cancels in
              7&rdquo; pop-ups. The product is the product.
            </p>

            {/* Monthly / Annual toggle */}
            <div className="mt-10 inline-flex items-center gap-1 border border-white/15 p-1">
              {(["monthly", "annual"] as Cycle[]).map((c) => {
                const on = c === cycle;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCycle(c)}
                    aria-pressed={on}
                    className={`tactile px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.22em] transition ${
                      on
                        ? "bg-bone text-ink-950"
                        : "text-bone/85 hover:text-bone"
                    }`}
                  >
                    {c === "monthly" ? "Monthly" : "Annual"}
                    {c === "annual" ? (
                      <span
                        className={`ml-2 font-mono text-[9px] tabular-nums ${
                          on ? "text-ember-700" : "text-ember-400/85"
                        }`}
                      >
                        SAVE 23%
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="border-b border-white/[0.06] py-16 md:py-24">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* FREE */}
              <article className="flex flex-col border border-white/[0.08] bg-ink-900/40 p-6 lg:col-span-3">
                <header className="border-b border-white/[0.06] pb-4">
                  <MonoLabel>Tier 01</MonoLabel>
                  <h2 className="mt-3 font-sans text-[22px] font-extrabold uppercase tracking-tight text-bone">
                    Free
                  </h2>
                </header>

                <div className="py-5">
                  <div className="font-sans text-[36px] font-extrabold leading-none tracking-tight text-bone">
                    $0
                  </div>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/65">
                    Forever &middot; no card
                  </p>
                </div>

                <p className="border-t border-white/[0.06] pt-4 text-[12.5px] leading-relaxed text-ink-200/80">
                  {TIER_QUOTES.free}
                </p>

                <ul className="mt-4 flex flex-col gap-2.5">
                  {FREE_FEATURES.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[12.5px] leading-snug text-ink-100/85"
                    >
                      <CheckCircle
                        size={13}
                        weight="fill"
                        className="mt-0.5 shrink-0 text-ink-300/70"
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <Button variant="secondary" fullWidth href="/auth/sign-up">
                    Start free
                    <ArrowRight size={13} weight="bold" />
                  </Button>
                </div>
              </article>

              {/* OPERATOR — visually lifted, wider on desktop, fills the page */}
              <article className="relative flex flex-col border-2 border-ember-400/60 bg-ink-900/70 p-7 shadow-[0_30px_60px_-25px_rgb(239_123_53/0.25)] lg:col-span-5">
                <span
                  aria-hidden
                  className="absolute -top-3 left-7 inline-flex items-center gap-1 bg-ember-400 px-2 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-ink-950"
                >
                  <Lightning size={10} weight="fill" />
                  Most men land here
                </span>
                <header className="border-b border-white/[0.06] pb-4">
                  <MonoLabel ember>Tier 02</MonoLabel>
                  <h2 className="mt-3 font-sans text-[28px] font-extrabold uppercase tracking-tight text-bone">
                    Operator
                  </h2>
                </header>

                <div className="py-5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-sans text-[48px] font-extrabold leading-none tracking-tight text-bone">
                      ${cycle === "monthly" ? 14 : 129}
                    </span>
                    <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-300/65">
                      / {cycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ember-400/80">
                    {cycle === "monthly"
                      ? "Or $129/yr (save 23%)"
                      : "About $10.75/mo &middot; save 23%"}
                  </p>
                </div>

                <p className="border-t border-white/[0.06] pt-4 text-[13.5px] leading-relaxed text-bone">
                  {TIER_QUOTES.operator}
                </p>

                {/* Headline unlocks — bigger, bolder */}
                <ul className="mt-5 flex flex-col gap-3">
                  {OPERATOR_HEADLINE_FEATURES.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-[13.5px] font-medium leading-snug text-bone"
                    >
                      <CheckCircle
                        size={15}
                        weight="fill"
                        className="mt-0.5 shrink-0 text-ember-400"
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Plus quieter list — collapsed visually */}
                <details className="mt-4 border-t border-white/[0.06] pt-3 text-[12px] text-ink-300/75">
                  <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.22em] text-ink-200/80 transition hover:text-bone">
                    Plus 5 more
                  </summary>
                  <ul className="mt-3 flex flex-col gap-2 pl-4">
                    {OPERATOR_OTHER_FEATURES.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 leading-snug"
                      >
                        <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-300/55" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </details>

                <div className="mt-auto pt-6">
                  <Button fullWidth size="lg" href="/auth/sign-up?intent=operator">
                    Start as Operator
                    <ArrowRight size={14} weight="bold" />
                  </Button>
                  <p className="mt-2 text-center font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-300/55">
                    Cancel any time &middot; 14-day refund on annual
                  </p>
                </div>
              </article>

              {/* FOUNDER */}
              <article className="relative flex flex-col border border-white/[0.10] bg-ink-900/40 p-6 lg:col-span-4">
                <header className="border-b border-white/[0.06] pb-4">
                  <div className="flex items-center justify-between">
                    <MonoLabel>Tier 03</MonoLabel>
                    {founderSoldOut ? (
                      <span className="inline-flex items-center gap-1 border border-white/15 px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-ink-300/70">
                        Sold out
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 border border-white/20 px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-bone/85">
                        <Crown size={10} weight="fill" />
                        {founderRemaining} of 500 left
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 font-sans text-[24px] font-extrabold uppercase tracking-tight text-bone">
                    Founder&rsquo;s Pass
                  </h2>
                </header>

                <div className="py-5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-sans text-[36px] font-extrabold leading-none tracking-tight text-bone">
                      $299
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300/65">
                      one-time
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/65">
                    ~26 months of Operator monthly
                  </p>
                </div>

                <p className="border-t border-white/[0.06] pt-4 text-[12.5px] leading-relaxed text-ink-200/80">
                  {TIER_QUOTES.founder}
                </p>

                {/* Live counter */}
                <div className="mt-4 border border-white/[0.06] bg-ink-950/50 p-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-300/65">
                      Seats claimed
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-bone">
                      <span className="font-bold">{founderClaimed}</span>
                      <span className="text-ink-300/45"> / {FOUNDER_PASS_CAP}</span>
                    </span>
                  </div>
                  <div
                    className="mt-1.5 h-[3px] overflow-hidden bg-white/10"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={FOUNDER_PASS_CAP}
                    aria-valuenow={founderClaimed}
                  >
                    <span
                      className="block h-full bg-ember-400"
                      style={{ width: `${(founderClaimed / FOUNDER_PASS_CAP) * 100}%` }}
                    />
                  </div>
                </div>

                <ul className="mt-4 flex flex-col gap-2.5">
                  {FOUNDER_FEATURES.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[12.5px] leading-snug text-ink-100/85"
                    >
                      <CheckCircle
                        size={13}
                        weight="fill"
                        className="mt-0.5 shrink-0 text-bone"
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <Button
                    variant="secondary"
                    fullWidth
                    href={
                      founderSoldOut
                        ? "/contact?intent=waitlist"
                        : "/auth/sign-up?intent=founder"
                    }
                  >
                    {founderSoldOut ? "Join the waitlist" : "Claim a Pass"}
                    <ArrowRight size={13} weight="bold" />
                  </Button>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Why people actually upgrade — concrete scenarios */}
        <section className="border-b border-white/[0.06] py-20 md:py-28">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <div className="grid grid-cols-12 gap-x-6 gap-y-6">
              <div className="col-span-12 md:col-span-5">
                <MonoLabel rule>Upgrade triggers</MonoLabel>
                <h2 className="mt-5 text-balance font-sans text-[clamp(2rem,4vw,3rem)] font-extrabold uppercase leading-[1.02] tracking-tight text-bone">
                  Why people actually upgrade.
                </h2>
              </div>
              <div className="col-span-12 md:col-span-7">
                <p className="max-w-[55ch] text-[14px] leading-relaxed text-ink-200/80">
                  Not theoretical &mdash; specific moments. If you recognize
                  yourself in any of these, that&rsquo;s the upgrade trigger.
                  If you don&rsquo;t, Free is the right tier and you should
                  stay on it.
                </p>
              </div>
            </div>

            <ul className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
              {UPGRADE_SCENARIOS.map((s, i) => (
                <li
                  key={s.handle}
                  className="flex flex-col border border-white/[0.08] bg-ink-900/40 p-6"
                >
                  <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.06] pb-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-ember-400/85">
                      Scenario {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/55">
                      Operator
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-3">
                    <h3 className="font-sans text-[18px] font-extrabold uppercase tracking-tight text-bone">
                      {s.handle}
                    </h3>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/65">
                      {s.role}
                    </span>
                  </div>
                  <blockquote className="mt-4 text-[14px] leading-relaxed text-ink-100/90">
                    &ldquo;{s.quote}&rdquo;
                  </blockquote>
                  <div className="mt-auto border-t border-white/[0.06] pt-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
                      Unlocked by
                    </div>
                    <div className="mt-1 text-[13px] font-bold text-ember-400">
                      {s.frame}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-10 max-w-[68ch] text-[13px] leading-relaxed text-ink-300/75">
              See yourself in the squad lead, the multi-tracker, or the
              historian? Operator pays for itself the first cycle. Otherwise:
              Free is genuinely fine. We&rsquo;re not running a guilt
              campaign.
            </p>
          </div>
        </section>

        {/* Comparison matrix — full transparency about what differs */}
        <section className="border-b border-white/[0.06] py-20 md:py-28">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <div className="grid grid-cols-12 gap-x-6 gap-y-8 md:items-end">
              <div className="col-span-12 md:col-span-7">
                <MonoLabel rule>Compare / line by line</MonoLabel>
                <h2 className="mt-5 text-balance font-sans text-[clamp(2rem,4vw,3rem)] font-extrabold uppercase leading-[1.02] tracking-tight text-bone">
                  What&rsquo;s actually different.
                </h2>
              </div>
              <div className="col-span-12 md:col-span-5">
                <p className="max-w-[44ch] text-[14px] leading-relaxed text-ink-200/80">
                  Free is the standalone product. Paid tiers add capacity and
                  power-user tools. Look down the column you&rsquo;re curious
                  about.
                </p>
              </div>
            </div>

            <div className="mt-12 -mx-5 overflow-x-auto md:mx-0">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.10]">
                    <th
                      scope="col"
                      className="w-[40%] px-5 py-4 text-left font-mono text-[11px] uppercase tracking-[0.22em] text-ink-300/65 md:px-6"
                    >
                      Feature
                    </th>
                    <th
                      scope="col"
                      className="w-[20%] px-3 py-4 text-center font-sans text-[14px] font-extrabold uppercase tracking-tight text-bone"
                    >
                      Free
                    </th>
                    <th
                      scope="col"
                      className="w-[20%] px-3 py-4 text-center font-sans text-[14px] font-extrabold uppercase tracking-tight text-ember-400"
                    >
                      Operator
                    </th>
                    <th
                      scope="col"
                      className="w-[20%] px-3 py-4 text-center font-sans text-[14px] font-extrabold uppercase tracking-tight text-bone"
                    >
                      Founder
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((g) => (
                    <Fragment key={g.group}>
                      <tr
                        className="border-b border-white/[0.06] bg-ink-900/40"
                      >
                        <th
                          colSpan={4}
                          scope="colgroup"
                          className="px-5 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.28em] text-ember-400/85 md:px-6"
                        >
                          {g.group}
                        </th>
                      </tr>
                      {g.rows.map((r) => (
                        <tr
                          key={`${g.group}-${r.feature}`}
                          className="border-b border-white/[0.04] transition hover:bg-white/[0.015]"
                        >
                          <td className="px-5 py-3.5 text-[13.5px] text-ink-100/85 md:px-6">
                            {r.feature}
                          </td>
                          {(["free", "operator", "founder"] as Tier[]).map(
                            (t) => {
                              const v = r[t];
                              return (
                                <td
                                  key={t}
                                  className="px-3 py-3.5 text-center"
                                >
                                  {typeof v === "boolean" ? (
                                    v ? (
                                      <Check
                                        size={16}
                                        weight="bold"
                                        className={`mx-auto ${
                                          t === "operator"
                                            ? "text-ember-400"
                                            : "text-bone"
                                        }`}
                                        aria-label="Included"
                                      />
                                    ) : (
                                      <Minus
                                        size={14}
                                        weight="bold"
                                        className="mx-auto text-ink-300/40"
                                        aria-label="Not included"
                                      />
                                    )
                                  ) : (
                                    <span
                                      className={`font-mono text-[12px] tabular-nums ${
                                        t === "operator"
                                          ? "text-ember-400"
                                          : "text-bone"
                                      }`}
                                    >
                                      {v}
                                    </span>
                                  )}
                                </td>
                              );
                            },
                          )}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-6 max-w-[60ch] text-[12.5px] leading-relaxed text-ink-300/70">
              The Free tier never gets gated retroactively. Anything in the
              Free column today stays in the Free column.
            </p>
          </div>
        </section>

        {/* Honest pricing principles */}
        <section className="border-b border-white/[0.06] py-20 md:py-28">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <div className="grid grid-cols-12 gap-x-6 gap-y-8">
              <div className="col-span-12 md:col-span-5">
                <MonoLabel rule>Pricing principles</MonoLabel>
                <h2 className="mt-5 text-balance font-sans text-[clamp(2rem,4vw,3rem)] font-extrabold uppercase leading-[1.02] tracking-tight text-bone">
                  Charging like we mean it.
                </h2>
              </div>
              <div className="col-span-12 grid grid-cols-1 gap-6 md:col-span-7 md:grid-cols-2">
                {[
                  {
                    title: "Free works.",
                    body: "If you only ever use Free, the product still works. Paid is for capacity, not access. No timed unlock, no try-then-pay.",
                  },
                  {
                    title: "No fake urgency.",
                    body: "No countdown timers. No 'price goes up tomorrow' alerts. Founder's Pass is capped at 500 because that's the real number.",
                  },
                  {
                    title: "Cancel actually cancels.",
                    body: "One click. No survey, no retention agent, no 'are you sure' modal layered three deep.",
                  },
                  {
                    title: "Refunds are honest.",
                    body: "14 days, no questions, on annual and Founder's Pass. After that you own the decision. We don't pretend otherwise.",
                  },
                ].map((p) => (
                  <div key={p.title} className="border-t border-white/[0.06] pt-5">
                    <h3 className="font-sans text-[18px] font-extrabold uppercase tracking-tight text-bone">
                      {p.title}
                    </h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-ink-200/80">
                      {p.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <div className="grid grid-cols-12 gap-x-6 gap-y-8">
              <div className="col-span-12 md:col-span-4">
                <MonoLabel rule>FAQ / 001</MonoLabel>
                <h2 className="mt-5 text-balance font-sans text-[clamp(2rem,4vw,3rem)] font-extrabold uppercase leading-[1.02] tracking-tight text-bone">
                  Common questions, real answers.
                </h2>
              </div>
              <ul className="col-span-12 flex flex-col divide-y divide-white/[0.06] border-y border-white/[0.06] md:col-span-8">
                {FAQ.map((item) => (
                  <li key={item.q} className="py-7">
                    <h3 className="font-sans text-[18px] font-bold tracking-tight text-bone md:text-[20px]">
                      {item.q}
                    </h3>
                    <p className="mt-3 max-w-[68ch] text-[14px] leading-relaxed text-ink-200/80">
                      {item.a}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Final security/trust note */}
            <div className="mt-16 flex flex-wrap items-center gap-3 border border-white/[0.06] bg-ink-900/40 px-6 py-5">
              <Lock size={16} weight="fill" className="text-bone" />
              <span className="text-[13.5px] text-ink-100/85">
                Payments handled by Stripe (web) and Apple/Google (native).
                We never see your card number. CVV, full billing address, and
                bank details stay with the processor.
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
