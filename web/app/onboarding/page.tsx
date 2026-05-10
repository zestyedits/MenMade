"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Hammer,
  Lightning,
  Pen,
  GraduationCap,
  Wrench,
  Compass,
  Lock,
} from "@phosphor-icons/react/dist/ssr";
import { Logo } from "../components/ui/Logo";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { MonoLabel } from "../components/ui/MonoLabel";
import { StepShell } from "./_steps/StepShell";
import { getSession, signIn } from "../lib/auth";
import {
  store,
  defaultPreferences,
  type FocusArea,
  type Intensity,
  type SquadStyle,
} from "../lib/store";

const TOTAL = 4;

const FOCUS_OPTIONS: {
  id: FocusArea;
  label: string;
  blurb: string;
  Icon: typeof Hammer;
}[] = [
  { id: "build", label: "Build", blurb: "Wood, metal, code, garage projects", Icon: Hammer },
  { id: "move", label: "Move", blurb: "Lift, run, swim, fight, sweat", Icon: Lightning },
  { id: "make", label: "Make", blurb: "Write, draw, compose, ship", Icon: Pen },
  { id: "master", label: "Master", blurb: "Study a hard thing daily", Icon: GraduationCap },
  { id: "mend", label: "Mend", blurb: "Repair, restore, garden, cook", Icon: Wrench },
  { id: "mark", label: "Mark", blurb: "Lead, teach, mentor, coach", Icon: Compass },
];

const INTENSITY_OPTIONS: {
  id: Intensity;
  label: string;
  blurb: string;
  joke: string;
}[] = [
  {
    id: "light",
    label: "Light",
    blurb: "20–30 minutes a day. Foundations.",
    joke: "Honest is better than ambitious.",
  },
  {
    id: "steady",
    label: "Steady",
    blurb: "45–60 minutes a day. Real habit.",
    joke: "Where most squads land.",
  },
  {
    id: "heavy",
    label: "Heavy",
    blurb: "90 minutes a day. Project-grade.",
    joke: "Pick this if your calendar says you mean it.",
  },
  {
    id: "brutal",
    label: "Brutal",
    blurb: "2+ hours a day. No excuses logged.",
    joke: "We will fact-check you.",
  },
];

const SQUAD_OPTIONS: {
  id: SquadStyle;
  label: string;
  blurb: string;
}[] = [
  {
    id: "matched",
    label: "Match me with strangers.",
    blurb: "Algorithm pairs you with operatives at your intensity and time zone. Easiest start.",
  },
  {
    id: "invite",
    label: "I'll bring my own.",
    blurb: "Create a private squad and invite three to seven men yourself.",
  },
  {
    id: "solo",
    label: "Run it alone.",
    blurb: "Allowed. Not recommended. Most solo runs ghost by Day 6.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Pre-fill from session if available; otherwise blank.
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [focus, setFocus] = useState<FocusArea[]>([]);
  const [intensity, setIntensity] = useState<Intensity>("steady");
  const [daysPerWeek, setDaysPerWeek] = useState<4 | 5 | 6 | 7>(6);
  const [squadStyle, setSquadStyle] = useState<SquadStyle>("matched");
  const [tz, setTz] = useState<string>(defaultPreferences.timezone);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const s = getSession();
    if (s) {
      setDisplayName((dn) => dn || s.name);
      setHandle((h) => h || s.handle);
    }
    if (typeof Intl !== "undefined") {
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, []);

  const canAdvance = useMemo(() => {
    if (step === 0) return focus.length > 0;
    if (step === 1) return Boolean(intensity) && Boolean(daysPerWeek);
    if (step === 2) return Boolean(squadStyle);
    if (step === 3) {
      return (
        displayName.trim().length > 0 &&
        handle.trim().length >= 2 &&
        /^[a-z0-9_-]+$/i.test(handle)
      );
    }
    return false;
  }, [step, focus, intensity, daysPerWeek, squadStyle, displayName, handle]);

  function next() {
    if (!canAdvance) {
      if (step === 3) {
        const e: Record<string, string> = {};
        if (!displayName.trim()) e.name = "Required.";
        if (handle.trim().length < 2) e.handle = "At least 2 characters.";
        else if (!/^[a-z0-9_-]+$/i.test(handle))
          e.handle = "Letters, numbers, hyphen, underscore only.";
        setErrors(e);
      }
      return;
    }
    setErrors({});
    if (step === TOTAL - 1) {
      finish();
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  }

  function back() {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  }

  function toggleFocus(id: FocusArea) {
    setFocus((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  function finish() {
    store.setPreferences({
      focus,
      intensity,
      daysPerWeek,
      squadStyle,
      timezone: tz,
    });
    store.setIdentity({
      handle: handle.trim(),
      displayName: displayName.trim(),
      pronouns: pronouns.trim() || undefined,
    });
    store.markOnboarded();

    // Ensure the session reflects the chosen handle/name.
    const session = getSession();
    if (session) {
      signIn({
        email: session.email,
        name: displayName.trim(),
        handle: handle.trim(),
      });
    }

    router.push("/dashboard");
  }

  return (
    <main className="grid min-h-[100dvh] grid-cols-1 lg:grid-cols-[1fr_minmax(560px,640px)]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-ink-900 lg:block">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 80% 10%, rgb(239 123 53 / 0.10) 0%, transparent 60%), linear-gradient(180deg, rgb(20 17 15 / 1) 0%, rgb(12 10 9 / 1) 100%)",
          }}
        />
        <div className="relative flex min-h-[100dvh] flex-col p-12">
          <Logo size="md" />

          <div className="mt-auto flex flex-col gap-6">
            <MonoLabel rule>Operative / intake</MonoLabel>
            <h1 className="max-w-[14ch] text-balance text-[44px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone">
              Four questions.{" "}
              <span className="text-ember-400">No spam ever.</span>
            </h1>
            <p className="max-w-[44ch] text-[14px] leading-relaxed text-ink-200/75">
              We use the answers to put you in the right squad. We don&rsquo;t
              sell, ship, or syndicate them. Live on this device until you
              join a squad &mdash; you can wipe it from settings any time.
            </p>

            <div className="mt-2 flex items-center gap-3 border-t border-white/[0.06] pt-5">
              <Lock size={14} weight="bold" className="text-ember-400/80" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/70">
                Stays on your device unless you say so
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Form column */}
      <section className="relative flex min-h-[100dvh] flex-col bg-ink-950">
        {/* Mobile-only logo strip */}
        <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-4 lg:hidden">
          <Logo size="sm" />
          <MonoLabel>Intake / 0{step + 1}</MonoLabel>
        </div>

        {/* Top progress bar */}
        <div className="relative h-px w-full bg-white/[0.06]">
          <motion.span
            animate={{ width: `${((step + 1) / TOTAL) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-y-0 left-0 bg-ember-400"
          />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-12 md:px-10">
          <div className="w-full max-w-[520px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div key={step} className="flex flex-col gap-7">
                {step === 0 ? (
                  <StepShell
                    index="01"
                    total={String(TOTAL).padStart(2, "0")}
                    kicker="Focus"
                    title="What are you here to do?"
                    hint="Pick one or more. We'll prioritize squads that share at least two of your areas."
                  >
                    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
                      {FOCUS_OPTIONS.map(({ id, label, blurb, Icon }) => {
                        const on = focus.includes(id);
                        return (
                          <button
                            key={id}
                            type="button"
                            aria-pressed={on}
                            onClick={() => toggleFocus(id)}
                            className={`tactile group flex flex-col items-start gap-1.5 border px-3.5 py-3.5 text-left transition ${
                              on
                                ? "border-ember-400/60 bg-ember-400/[0.06]"
                                : "border-white/10 bg-ink-900/40 hover:border-white/25 hover:bg-ink-900/70"
                            }`}
                          >
                            <Icon
                              size={18}
                              weight={on ? "fill" : "regular"}
                              className={
                                on ? "text-ember-400" : "text-ink-200/70"
                              }
                            />
                            <span
                              className={`font-sans text-[14px] font-bold uppercase tracking-tight ${
                                on ? "text-bone" : "text-ink-100/85"
                              }`}
                            >
                              {label}
                            </span>
                            <span className="text-[11.5px] leading-snug text-ink-300/70">
                              {blurb}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/60">
                      {focus.length} selected
                    </p>
                  </StepShell>
                ) : null}

                {step === 1 ? (
                  <StepShell
                    index="02"
                    total={String(TOTAL).padStart(2, "0")}
                    kicker="Intensity"
                    title="How hard are you running this?"
                    hint="Honest is better than ambitious. We match you to operatives at the same dial."
                  >
                    <div className="grid grid-cols-1 gap-2.5">
                      {INTENSITY_OPTIONS.map(({ id, label, blurb, joke }) => {
                        const on = intensity === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            aria-pressed={on}
                            onClick={() => setIntensity(id)}
                            className={`tactile flex items-center justify-between gap-4 border px-4 py-3.5 text-left transition ${
                              on
                                ? "border-ember-400/60 bg-ember-400/[0.06]"
                                : "border-white/10 bg-ink-900/40 hover:border-white/25 hover:bg-ink-900/70"
                            }`}
                          >
                            <div className="flex flex-col gap-1">
                              <span
                                className={`font-sans text-[15px] font-bold uppercase tracking-tight ${
                                  on ? "text-bone" : "text-ink-100/85"
                                }`}
                              >
                                {label}
                              </span>
                              <span className="text-[12.5px] leading-snug text-ink-300/80">
                                {blurb}
                              </span>
                              <span
                                className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                                  on ? "text-ember-400/85" : "text-ink-300/60"
                                }`}
                              >
                                {joke}
                              </span>
                            </div>
                            <span
                              className={`grid h-5 w-5 place-items-center rounded-full border ${
                                on
                                  ? "border-ember-400 bg-ember-400 text-ink-950"
                                  : "border-white/20"
                              }`}
                              aria-hidden
                            >
                              {on ? "✓" : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-7 flex flex-col gap-3 border-t border-white/[0.06] pt-5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-200/80">
                          Days per week
                        </span>
                        <span className="font-mono text-[12px] tabular-nums text-bone">
                          {daysPerWeek} / 7
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[4, 5, 6, 7].map((d) => {
                          const on = daysPerWeek === d;
                          return (
                            <button
                              key={d}
                              type="button"
                              aria-pressed={on}
                              onClick={() => setDaysPerWeek(d as 4 | 5 | 6 | 7)}
                              className={`tactile border py-2.5 font-mono text-[12px] font-bold tabular-nums transition ${
                                on
                                  ? "border-ember-400/60 bg-ember-400/10 text-bone"
                                  : "border-white/10 bg-ink-900/40 text-ink-200/85 hover:border-white/25"
                              }`}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </StepShell>
                ) : null}

                {step === 2 ? (
                  <StepShell
                    index="03"
                    total={String(TOTAL).padStart(2, "0")}
                    kicker="Squad"
                    title="Who are you running with?"
                    hint="You can change this later. Most operatives start matched and graduate to a private squad after a cycle or two."
                  >
                    <div className="grid grid-cols-1 gap-2.5">
                      {SQUAD_OPTIONS.map(({ id, label, blurb }) => {
                        const on = squadStyle === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            aria-pressed={on}
                            onClick={() => setSquadStyle(id)}
                            className={`tactile flex items-start justify-between gap-4 border px-4 py-3.5 text-left transition ${
                              on
                                ? "border-ember-400/60 bg-ember-400/[0.06]"
                                : "border-white/10 bg-ink-900/40 hover:border-white/25 hover:bg-ink-900/70"
                            }`}
                          >
                            <div className="flex flex-col gap-1">
                              <span
                                className={`font-sans text-[15px] font-bold uppercase tracking-tight ${
                                  on ? "text-bone" : "text-ink-100/85"
                                }`}
                              >
                                {label}
                              </span>
                              <span className="text-[12.5px] leading-snug text-ink-300/80">
                                {blurb}
                              </span>
                            </div>
                            <span
                              className={`mt-1 grid h-5 w-5 place-items-center rounded-full border ${
                                on
                                  ? "border-ember-400 bg-ember-400 text-ink-950"
                                  : "border-white/20"
                              }`}
                              aria-hidden
                            >
                              {on ? "✓" : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </StepShell>
                ) : null}

                {step === 3 ? (
                  <StepShell
                    index="04"
                    total={String(TOTAL).padStart(2, "0")}
                    kicker="Identity"
                    title="What does the squad call you?"
                    hint="Your handle is what your squad sees in the field log. Pick something you'd answer to."
                  >
                    <div className="flex flex-col gap-5">
                      <Input
                        label="Display name"
                        type="text"
                        autoComplete="name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        error={errors.name}
                      />
                      <Input
                        label="Handle"
                        type="text"
                        value={handle}
                        onChange={(e) =>
                          setHandle(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9_-]/g, ""),
                          )
                        }
                        error={errors.handle}
                        hint="Letters, numbers, hyphen, underscore. Lowercased."
                      />
                      <Input
                        label="Pronouns"
                        type="text"
                        value={pronouns}
                        onChange={(e) => setPronouns(e.target.value)}
                        hint="Optional. Skip if it's not your thing."
                      />

                      <div className="border-t border-white/[0.06] pt-4">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-200/80">
                            Time zone (auto-detected)
                          </span>
                          <span className="font-mono text-[11px] text-bone">
                            {tz}
                          </span>
                        </div>
                      </div>
                    </div>
                  </StepShell>
                ) : null}
              </motion.div>
            </AnimatePresence>

            {/* Nav row */}
            <div className="mt-10 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-6">
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                className="inline-flex items-center gap-2 px-2 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-200/70 transition hover:text-bone disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={12} weight="bold" />
                Back
              </button>

              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/60">
                {String(step + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
              </span>

              <Button
                type="button"
                onClick={next}
                disabled={!canAdvance}
              >
                {step === TOTAL - 1 ? "Find my squad" : "Next"}
                <ArrowRight size={14} weight="bold" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
