"use client";

import { useEffect, useState } from "react";
import {
  Hammer,
  Lightning,
  Pen,
  GraduationCap,
  Wrench,
  Compass,
} from "@phosphor-icons/react/dist/ssr";
import { Section } from "../../components/ui/Section";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { RadioGroup } from "../../components/ui/RadioGroup";
import {
  store,
  defaultPreferences,
  type FocusArea,
  type Intensity,
} from "../../lib/store";

const FOCUS_OPTIONS: {
  id: FocusArea;
  label: string;
  blurb: string;
  Icon: typeof Hammer;
}[] = [
  { id: "build", label: "Build", blurb: "Wood, metal, code, projects", Icon: Hammer },
  { id: "move", label: "Move", blurb: "Lift, run, swim, sweat", Icon: Lightning },
  { id: "make", label: "Make", blurb: "Write, draw, ship", Icon: Pen },
  { id: "master", label: "Master", blurb: "Study a hard thing", Icon: GraduationCap },
  { id: "mend", label: "Mend", blurb: "Repair, restore, cook", Icon: Wrench },
  { id: "mark", label: "Mark", blurb: "Lead, teach, coach", Icon: Compass },
];

const INTENSITY_OPTIONS: { value: Intensity; label: string; description: string }[] =
  [
    { value: "light", label: "Light", description: "20–30 min/day. Foundations." },
    { value: "steady", label: "Steady", description: "45–60 min/day. Real habit." },
    { value: "heavy", label: "Heavy", description: "90 min/day. Project-grade." },
    { value: "brutal", label: "Brutal", description: "2+ hr/day. No excuses logged." },
  ];

export default function ProfileSettingsPage() {
  const [pronouns, setPronouns] = useState("");
  const [bio, setBio] = useState("");
  const [focus, setFocus] = useState<FocusArea[]>([]);
  const [intensity, setIntensity] = useState<Intensity>("steady");
  const [daysPerWeek, setDaysPerWeek] = useState<4 | 5 | 6 | 7>(6);
  const [tz, setTz] = useState(defaultPreferences.timezone);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    const id = store.getIdentity();
    if (id?.pronouns) setPronouns(id.pronouns);
    const prefs = store.getPreferences();
    setFocus(prefs.focus);
    setIntensity(prefs.intensity);
    setDaysPerWeek(prefs.daysPerWeek);
    setTz(prefs.timezone);
  }, []);

  function toggleFocus(id: FocusArea) {
    setFocus((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  function handleSave() {
    const id = store.getIdentity();
    if (id) {
      store.setIdentity({
        ...id,
        pronouns: pronouns.trim() || undefined,
      });
    }
    store.setPreferences({
      focus,
      intensity,
      daysPerWeek,
      squadStyle: store.getPreferences().squadStyle,
      timezone: tz,
    });
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 1800);
  }

  function refreshTz() {
    if (typeof Intl !== "undefined") {
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }

  return (
    <>
      <Section
        kicker="01 / Persona"
        title="How you read on the wall"
        description="Pronouns and bio show up on your profile and to your squad-mates. Skip anything that doesn't apply."
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Pronouns"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            hint="Optional."
          />
          <div className="flex flex-col gap-2">
            <label htmlFor="bio" className="text-[13px] font-medium text-bone">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={240}
              placeholder="One line about what you're working on. Skip the resume."
              className="block w-full bg-ink-900 border border-white/10 rounded-sm px-3.5 py-2.5 text-[14px] text-bone placeholder:text-ink-400 outline-none transition focus:border-ember-400/60 focus:ring-1 focus:ring-ember-400/30"
            />
            <p className="text-[11px] tabular-nums text-ink-300/55">
              {bio.length} / 240
            </p>
          </div>
        </div>
      </Section>

      <Section
        kicker="02 / Brief"
        title="What you're here to do"
        description="Pick one or more focus areas. We use this to suggest squads at re-match time."
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
                    : "border-white/10 bg-ink-900/40 hover:border-white/25"
                }`}
              >
                <Icon
                  size={18}
                  weight={on ? "fill" : "regular"}
                  className={on ? "text-ember-400" : "text-ink-200/70"}
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
      </Section>

      <Section
        kicker="03 / Dial"
        title="Intensity & cadence"
        description="Honest is better than ambitious. We match you to men running the same dial."
      >
        <div className="flex flex-col gap-7">
          <RadioGroup
            legend="Intensity"
            value={intensity}
            options={INTENSITY_OPTIONS}
            onChange={setIntensity}
          />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-bone">
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
        </div>
      </Section>

      <Section
        kicker="04 / Region"
        title="Time zone"
        description="Used for daily directive timing and squad matching with people in your band. Auto-detected from this device."
      >
        <div className="flex items-center justify-between gap-3 border border-white/10 bg-ink-900/40 px-4 py-3">
          <span className="font-mono text-[13px] text-bone">{tz}</span>
          <button
            type="button"
            onClick={refreshTz}
            className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-200/80 transition hover:text-bone"
          >
            Re-detect
          </button>
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-5 flex items-center justify-end gap-3 border-t border-white/[0.06] bg-ink-950/95 px-5 py-4 backdrop-blur-md md:-mx-10 md:px-10">
        {savedAt ? (
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ember-400/85">
            Saved.
          </span>
        ) : null}
        <Button onClick={handleSave}>Save changes</Button>
      </div>
    </>
  );
}
