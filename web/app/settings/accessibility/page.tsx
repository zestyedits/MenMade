"use client";

import { useEffect, useState } from "react";
import { Section, SettingsGroup } from "../../components/ui/Section";
import { Toggle } from "../../components/ui/Toggle";
import { RadioGroup } from "../../components/ui/RadioGroup";
import {
  store,
  defaultAccessibility,
  type AccessibilityPrefs,
} from "../../lib/store";

const SHORTCUTS = [
  { keys: "Enter", desc: "Send message in chat" },
  { keys: "Shift + Enter", desc: "Newline in chat composer" },
  { keys: "Esc", desc: "Close menus, dialogs, pickers" },
  { keys: "Tab", desc: "Move forward through interactive elements" },
  { keys: "Shift + Tab", desc: "Move backward" },
  { keys: "/", desc: "Focus the message composer (planned)" },
];

export default function AccessibilitySettingsPage() {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(defaultAccessibility);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setPrefs(store.getAccessibility());
  }, []);

  function update<K extends keyof AccessibilityPrefs>(
    key: K,
    value: AccessibilityPrefs[K],
  ) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    store.setAccessibility(next);
    setSavedAt(Date.now());
    window.setTimeout(() => setSavedAt(null), 1500);
  }

  return (
    <>
      <Section
        kicker="01 / Motion"
        title="Reduce motion"
        description={
          <>
            We honor your OS-level{" "}
            <code className="font-mono text-bone">prefers-reduced-motion</code>{" "}
            by default. You can override per-account here.
          </>
        }
      >
        <RadioGroup
          legend="Animation behavior"
          value={prefs.reduceMotion}
          options={[
            {
              value: "system",
              label: "Match my system",
              description: "Recommended. Uses your OS setting automatically.",
            },
            {
              value: "always",
              label: "Always reduce",
              description:
                "Cuts all non-essential animation regardless of OS settings.",
            },
            {
              value: "never",
              label: "Never reduce",
              description: "Keep full motion even if your OS asks for less.",
            },
          ]}
          onChange={(v) => update("reduceMotion", v)}
        />
      </Section>

      <Section
        kicker="02 / Type"
        title="Text size"
        description="Affects body text and message content. Headings stay proportional."
      >
        <RadioGroup
          legend="Body text size"
          value={prefs.textSize}
          options={[
            { value: "sm", label: "Small", description: "13px body, denser feeds." },
            { value: "md", label: "Medium", description: "Default. 15px body." },
            { value: "lg", label: "Large", description: "17px body. Easier to scan." },
          ]}
          onChange={(v) => update("textSize", v)}
        />
      </Section>

      <Section
        kicker="03 / Layout"
        title="Density"
        description="More breathing room or more content per screen — your call."
      >
        <RadioGroup
          legend="Layout density"
          value={prefs.density}
          options={[
            {
              value: "comfortable",
              label: "Comfortable",
              description: "Default. Generous whitespace.",
            },
            {
              value: "compact",
              label: "Compact",
              description: "Tighter padding. More messages on screen.",
            },
          ]}
          onChange={(v) => update("density", v)}
        />
      </Section>

      <Section
        kicker="04 / Keyboard"
        title="Keyboard navigation"
        description="MenMade is fully keyboard-navigable. Toggle on-screen hints and review the shortcut reference."
      >
        <SettingsGroup>
          <Toggle
            label="Show keyboard shortcut hints"
            description="Display small key glyphs next to interactive elements where they apply."
            checked={prefs.keyboardHints}
            onChange={(v) => update("keyboardHints", v)}
          />
        </SettingsGroup>

        <ul className="mt-6 flex flex-col divide-y divide-white/[0.05] border border-white/10 bg-ink-900/40">
          {SHORTCUTS.map((s) => (
            <li
              key={s.keys}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <span className="text-[13.5px] text-ink-100/85">{s.desc}</span>
              <kbd className="font-mono text-[11px] tracking-[0.05em] text-bone border border-white/15 px-2 py-0.5 bg-ink-900">
                {s.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        kicker="05 / Screen readers"
        title="Assistive tech"
        description="MenMade ships with semantic landmarks, ARIA labels on every interactive control, and live regions for chat and notifications."
      >
        <ul className="flex flex-col gap-3 text-[13.5px] leading-relaxed text-ink-100/85">
          <li>
            <strong className="text-bone">VoiceOver (iOS / macOS):</strong>{" "}
            tested. Reach out if anything reads wrong.
          </li>
          <li>
            <strong className="text-bone">TalkBack (Android):</strong> tested
            on the mobile-web shell. Native app launches with the same
            semantics.
          </li>
          <li>
            <strong className="text-bone">NVDA / JAWS (Windows):</strong>{" "}
            supported. We avoid div-soup patterns that confuse linear
            navigation.
          </li>
        </ul>
        <p className="mt-4 text-[12.5px] text-ink-300/75">
          Found something that doesn&rsquo;t read right?{" "}
          <a
            href="/contact"
            className="text-bone underline underline-offset-4 decoration-bone/40 hover:decoration-bone"
          >
            Send a brief
          </a>{" "}
          and tell us the screen + what your reader announced. We treat
          accessibility bugs as ship-blocking.
        </p>
      </Section>

      <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/55">
        {savedAt ? "Saved." : "Changes save as you adjust."}
      </p>
    </>
  );
}
