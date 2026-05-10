"use client";

import { useEffect, useState } from "react";
import { Prohibit, Flag, ArrowCounterClockwise } from "@phosphor-icons/react/dist/ssr";
import { Section } from "../../components/ui/Section";
import { RadioGroup } from "../../components/ui/RadioGroup";
import { Avatar } from "../../components/ui/Avatar";
import {
  store,
  defaultSafety,
  type SafetyPrefs,
} from "../../lib/store";
import { mySquads } from "../../chat/_data/seed";

type ReportEntry = { messageId: string; squadCallsign: string };

export default function SafetySettingsPage() {
  const [blocked, setBlocked] = useState<string[]>([]);
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const [safety, setSafety] = useState<SafetyPrefs>(defaultSafety);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setBlocked(store.getBlockedHandles());
    setSafety(store.getSafety());
    // Aggregate reports across all squads (UI-side; real impl reads server queue).
    const all: ReportEntry[] = [];
    mySquads().forEach((sq) => {
      const ids = store.getReportedMessageIds(sq.callsign);
      ids.forEach((messageId) =>
        all.push({ messageId, squadCallsign: sq.callsign }),
      );
    });
    setReports(all);
  }, []);

  function unblock(handle: string) {
    store.unblockHandle(handle);
    setBlocked(store.getBlockedHandles());
  }

  function updateSafety<K extends keyof SafetyPrefs>(
    key: K,
    value: SafetyPrefs[K],
  ) {
    const next = { ...safety, [key]: value };
    setSafety(next);
    store.setSafety(next);
    setSavedAt(Date.now());
    window.setTimeout(() => setSavedAt(null), 1500);
  }

  return (
    <>
      <Section
        kicker="01 / Bouncer"
        title="Squad chat moderation"
        description={
          <>
            Reminder of how moderation works: hard rules (threats, doxxing,
            slurs) auto-block at send. Soft rules (directed pile-ons, repeat
            targeting) get flagged for the squad lead. Read the{" "}
            <a
              className="text-bone underline underline-offset-4 decoration-bone/40 hover:decoration-bone"
              href="/terms"
            >
              full code
            </a>
            .
          </>
        }
      >
        <RadioGroup
          legend="Show flagged messages"
          description="Soft-flagged messages are NOT auto-removed — they're labeled. Pick how you want to see them."
          value={safety.softFlaggedVisibility}
          options={[
            {
              value: "show",
              label: "Show inline",
              description:
                "Render with a small 'flagged' tag. Default for squad leads.",
            },
            {
              value: "collapse",
              label: "Collapse",
              description:
                "Hide content behind a tap-to-show. Recommended for new operatives.",
            },
            {
              value: "hide",
              label: "Hide entirely",
              description:
                "Don't show flagged messages at all. You can still see who sent them in the audit trail.",
            },
          ]}
          onChange={(v) => updateSafety("softFlaggedVisibility", v)}
        />
      </Section>

      <Section
        kicker="02 / Block list"
        title="Blocked operatives"
        description="Blocking hides every message and stamp from this person across all your squads, immediately. They aren't notified."
      >
        {blocked.length === 0 ? (
          <p className="border border-white/10 bg-ink-900/40 px-4 py-6 text-center text-[13px] text-ink-300/75">
            No one blocked. Roast within reason and you won&rsquo;t need to
            start.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/[0.05] border border-white/10 bg-ink-900/40">
            {blocked.map((h) => (
              <li
                key={h}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={h} size="sm" />
                  <div>
                    <div className="text-[13.5px] font-medium text-bone">
                      @{h}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/60">
                      Blocked
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => unblock(h)}
                  className="inline-flex items-center gap-1.5 border border-white/15 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-bone/85 transition hover:border-white/25 hover:text-bone"
                >
                  <ArrowCounterClockwise size={11} weight="bold" />
                  Unblock
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        kicker="03 / Reports filed"
        title="Messages you've reported"
        description="Reports go to the squad lead first, then to MenMade staff. The reported person isn't told who filed."
      >
        {reports.length === 0 ? (
          <p className="border border-white/10 bg-ink-900/40 px-4 py-6 text-center text-[13px] text-ink-300/75">
            No reports filed. Use the message menu (… → Report) when something
            crosses the line.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/[0.05] border border-white/10 bg-ink-900/40">
            {reports.map((r) => (
              <li
                key={`${r.squadCallsign}-${r.messageId}`}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Flag
                    size={14}
                    weight="fill"
                    className="text-ember-400/80"
                  />
                  <div>
                    <div className="text-[13.5px] text-bone">
                      Message{" "}
                      <code className="font-mono text-[12px] text-ink-200/80">
                        {r.messageId.slice(0, 18)}…
                      </code>
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/60">
                      Squad {r.squadCallsign} &middot; under review
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/55">
                  Logged
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        kicker="04 / Hard floors"
        title="What's never allowed"
        description="The platform-level floors. Cannot be roast-exempted, cannot be opted out of."
      >
        <ul className="flex flex-col divide-y divide-white/[0.04] border border-white/10 bg-ink-900/40">
          {[
            "Threats of physical violence",
            "Doxxing — sharing someone's address, full name, or workplace without consent",
            "Slurs targeting protected classes",
            "Sexual content involving minors",
            "Coordinating illegal activity",
            "Bulk spam, scams, or impersonation",
          ].map((rule) => (
            <li
              key={rule}
              className="flex items-center gap-3 px-4 py-3 text-[13.5px] text-ink-100/85"
            >
              <Prohibit
                size={14}
                weight="bold"
                className="shrink-0 text-ember-400"
              />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </Section>

      <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/55">
        {savedAt ? "Saved." : "Visibility changes save automatically."}
      </p>
    </>
  );
}
