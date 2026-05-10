"use client";

import { useEffect, useState } from "react";
import { Section, SettingsGroup } from "../../components/ui/Section";
import { Toggle } from "../../components/ui/Toggle";
import {
  store,
  defaultNotifications,
  type NotificationPrefs,
} from "../../lib/store";

export default function NotificationsSettingsPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultNotifications);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setPrefs(store.getNotifications());
  }, []);

  function update<K extends keyof NotificationPrefs>(
    key: K,
    value: NotificationPrefs[K],
  ) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    store.setNotifications(next);
    setSavedAt(Date.now());
    window.setTimeout(() => setSavedAt(null), 1500);
  }

  return (
    <>
      <Section
        kicker="01 / Cycle"
        title="Cycle reminders"
        description="Daily nudges tied to your active cycle. Disabled cycles still tick — we just won't ping you."
      >
        <SettingsGroup>
          <Toggle
            label="Daily directive reminder"
            description="One ping early in your local day with today's brief."
            checked={prefs.cycleReminder}
            onChange={(v) => update("cycleReminder", v)}
          />
          <div className="border-t border-white/[0.04]" />
          <Toggle
            label="Cycle close reminder"
            description="48 hours before your cycle ends, so you can ship the last objective."
            checked={prefs.cycleClose}
            onChange={(v) => update("cycleClose", v)}
          />
        </SettingsGroup>
      </Section>

      <Section
        kicker="02 / Squad"
        title="Squad activity"
        description="Real-time pings from your channels. Mute these if your squads get loud."
      >
        <SettingsGroup>
          <Toggle
            label="All squad activity"
            description="New messages, stamps, and field-log updates from any squad you're in."
            checked={prefs.squadActivity && !prefs.mentionsOnly}
            onChange={(v) => {
              update("squadActivity", v);
              if (v) update("mentionsOnly", false);
            }}
          />
          <div className="border-t border-white/[0.04]" />
          <Toggle
            label="Mentions only"
            description="Only when someone @mentions your handle. Overrides 'all squad activity'."
            checked={prefs.mentionsOnly}
            onChange={(v) => update("mentionsOnly", v)}
          />
          <div className="border-t border-white/[0.04]" />
          <Toggle
            label="Squad lead announcements"
            description="Pinned messages and brief edits from the squad lead. Recommended on."
            checked={prefs.squadLeadAnnouncements}
            onChange={(v) => update("squadLeadAnnouncements", v)}
          />
        </SettingsGroup>
      </Section>

      <Section
        kicker="03 / Digest"
        title="Email digests"
        description="Bundled summaries instead of real-time pings. Lower volume."
      >
        <SettingsGroup>
          <Toggle
            label="Daily digest"
            description="One email each morning with what your squads did yesterday."
            checked={prefs.dailyDigest}
            onChange={(v) => update("dailyDigest", v)}
          />
          <div className="border-t border-white/[0.04]" />
          <Toggle
            label="Weekly digest"
            description="Cycle progress, streak, and squad headlines every Sunday."
            checked={prefs.weeklyDigest}
            onChange={(v) => update("weeklyDigest", v)}
          />
        </SettingsGroup>
      </Section>

      <Section
        kicker="04 / Channels"
        title="Where notifications go"
        description="Master switches for each channel. App Store policy requires explicit user control over each."
      >
        <SettingsGroup>
          <Toggle
            label="Push notifications"
            description="Requires permission from your device. Toggling on here will prompt your browser/OS the first time."
            checked={prefs.push}
            onChange={(v) => update("push", v)}
          />
          <div className="border-t border-white/[0.04]" />
          <Toggle
            label="Email"
            description="Transactional, digest, and account emails to the address on file. Marketing opt-in is in Privacy & data."
            checked={prefs.email}
            onChange={(v) => update("email", v)}
          />
          <div className="border-t border-white/[0.04]" />
          <Toggle
            label="In-app"
            description="Always on. The product can't function without telling you when something changes."
            checked
            onChange={() => undefined}
            disabled
          />
        </SettingsGroup>
      </Section>

      <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/55">
        {savedAt ? "Saved." : "Changes save as you toggle."}
      </p>
    </>
  );
}
