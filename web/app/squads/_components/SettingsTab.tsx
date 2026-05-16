"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  ShieldCheck,
  Warning,
  ArrowRight,
  Crown,
  Eye,
} from "@phosphor-icons/react/dist/ssr";
import { MonoLabel } from "../../components/ui/MonoLabel";
import { Section, SettingsGroup } from "../../components/ui/Section";
import { Toggle } from "../../components/ui/Toggle";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import type { Squad } from "../../chat/_data/seed";

type Props = {
  squad: Squad;
  isLead: boolean;
};

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease },
});

export function SettingsTab({ squad, isLead }: Props) {
  // Per-squad notification toggles — stored locally for now, scoped by callsign
  const [allActivity, setAllActivity] = useState(true);
  const [leadAnnouncements, setLeadAnnouncements] = useState(true);
  const [misses, setMisses] = useState(true);

  // Lead-only mock state for the brief
  const [briefDraft, setBriefDraft] = useState(
    `${squad.name} is running ${squad.cycleCode}. ${squad.totalDays}-day cycle, ${squad.intensity.toLowerCase()} intensity.`,
  );

  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-10 md:px-10 md:py-14">
      <motion.header {...fadeUp(0)} className="mb-10">
        <MonoLabel ember>Squad settings</MonoLabel>
        <h2 className="mt-4 text-balance font-sans text-[clamp(1.8rem,3.4vw,2.6rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-bone">
          Tune the squad to you.
        </h2>
        <p className="mt-5 max-w-[55ch] text-[14px] leading-relaxed text-ink-200/80">
          Notification controls apply to{" "}
          <span className="font-mono text-bone">{squad.callsign}</span> only —
          your global preferences in{" "}
          <a
            href="/settings/notifications"
            className="text-bone underline underline-offset-4 decoration-bone/40 transition hover:decoration-bone"
          >
            Settings → Notifications
          </a>{" "}
          set the floor.
        </p>
      </motion.header>

      <div className="flex flex-col gap-12">
        <motion.div {...fadeUp(0.08)}>
          <Section
            kicker="01 / Channel"
            title="Per-squad notifications"
            description="Mute this squad without muting everything. Useful when one cycle gets loud."
          >
            <SettingsGroup>
              <Toggle
                label="All squad activity"
                description="Pings on new messages, stamps, and field-log entries from this squad."
                checked={allActivity}
                onChange={setAllActivity}
              />
              <div className="border-t border-white/[0.04]" />
              <Toggle
                label="Lead announcements"
                description="Pings only when the squad lead pins or posts a brief. Recommended on."
                checked={leadAnnouncements}
                onChange={setLeadAnnouncements}
              />
              <div className="border-t border-white/[0.04]" />
              <Toggle
                label="Miss flags"
                description="Tells you when a squad-mate slips or ghosts. The receipts feed without the chatter."
                checked={misses}
                onChange={setMisses}
              />
            </SettingsGroup>
          </Section>
        </motion.div>

        <motion.div {...fadeUp(0.14)}>
          <Section
            kicker="02 / Brief"
            title="Squad mission statement"
            description={
              isLead ? (
                <>
                  Lead-only. Edit the brief any squad-mate sees on the{" "}
                  <span className="font-mono text-bone">Brief</span> tab.
                  Changes broadcast to the squad chat as a pinned update.
                </>
              ) : (
                <>
                  Read-only for members. Ask your lead (
                  <span className="font-mono text-bone">
                    @{squad.roster.find((r) => r.role === "lead")?.handle}
                  </span>
                  ) to revise the brief if it&rsquo;s stale.
                </>
              )
            }
          >
            <div className="flex flex-col gap-3">
              <textarea
                id="brief-draft"
                rows={5}
                value={briefDraft}
                onChange={(e) => isLead && setBriefDraft(e.target.value)}
                readOnly={!isLead}
                maxLength={1500}
                placeholder="What this squad is here to do."
                className={`block w-full rounded-sm border bg-ink-900 px-3.5 py-3 text-[14.5px] leading-relaxed outline-none transition focus:border-ember-400/60 focus:ring-1 focus:ring-ember-400/30 ${
                  isLead
                    ? "border-white/10 text-bone"
                    : "border-white/[0.06] text-ink-200/70"
                }`}
              />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
                  {isLead ? "Save broadcasts to squad chat" : "Lead-only edits"}
                </span>
                {isLead ? (
                  <Button>
                    Save brief
                    <ArrowRight size={13} weight="bold" />
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 border border-white/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-200/80">
                    <Eye size={11} weight="bold" />
                    Read only
                  </span>
                )}
              </div>
            </div>
          </Section>
        </motion.div>

        <motion.div {...fadeUp(0.2)}>
          <Section
            kicker="03 / Roster"
            title="Manage members"
            description={
              isLead
                ? "Invite new members, remove inactive ones, or pass the lead. Squad cap is 8."
                : "Members can leave the squad below. Only the lead can invite or remove."
            }
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 border border-white/10 bg-ink-900/40 p-4">
                <div className="flex items-center gap-3">
                  <Crown
                    size={16}
                    weight={isLead ? "fill" : "regular"}
                    className={isLead ? "text-ember-400" : "text-ink-300/65"}
                  />
                  <div>
                    <div className="text-[13.5px] font-medium text-bone">
                      Invite by handle or email
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/60">
                      {isLead ? "Open" : "Lead-only action"}
                    </div>
                  </div>
                </div>
                {/* Invite button is suppressed until the invite endpoint
                    ships. The lead-only row still surfaces the capability,
                    but we don't render a dead-link CTA. */}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled
                  onClick={() => undefined}
                >
                  Soon
                </Button>
              </div>

              <div className="flex items-center justify-between gap-3 border border-white/10 bg-ink-900/40 p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={16} weight="bold" className="text-bone" />
                  <div>
                    <div className="text-[13.5px] font-medium text-bone">
                      Pass the lead
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/60">
                      {isLead ? "Pick a successor" : "Lead-only action"}
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!isLead}
                >
                  Pass
                </Button>
              </div>
            </div>
          </Section>
        </motion.div>

        <motion.div {...fadeUp(0.26)}>
          <Section
            kicker="04 / Privacy"
            title="Who can see this squad"
          >
            <SettingsGroup>
              <Toggle
                label="Listed in cross-squad activity feed"
                description="When Operator users browse the global feed, your squad's anonymized completions can appear. Off by default for new squads."
                checked={false}
                onChange={() => undefined}
                disabled={!isLead}
              />
            </SettingsGroup>
            {!isLead ? (
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/60">
                Lead-only toggle.
              </p>
            ) : null}
          </Section>
        </motion.div>

        <motion.div {...fadeUp(0.32)}>
          <Section
            kicker="Danger"
            title="Leave the squad"
            destructive
            description={
              <>
                Removes you from{" "}
                <span className="font-mono text-bone">{squad.name}</span>. Your
                field-log entries stay on the squad ledger for the moderation
                trail. You can rejoin later if the squad lead invites you
                back.
              </>
            }
          >
            {!confirmLeave ? (
              <button
                type="button"
                onClick={() => setConfirmLeave(true)}
                className="tactile inline-flex items-center gap-2 border border-ember-400/50 bg-ember-400/[0.04] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ember-400 transition hover:border-ember-400/80 hover:bg-ember-400/[0.08]"
              >
                Leave squad
              </button>
            ) : (
              <div className="flex flex-col gap-4 border border-ember-400/40 bg-ember-400/[0.04] p-5">
                <div className="flex items-start gap-3">
                  <Warning
                    size={20}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-ember-400"
                  />
                  <p className="text-[13.5px] leading-relaxed text-bone">
                    Type{" "}
                    <code className="font-mono font-bold text-ember-400">
                      LEAVE
                    </code>{" "}
                    to confirm. The squad will see &ldquo;@you left the
                    squad&rdquo; in the field log.
                  </p>
                </div>
                <Input
                  label="Confirmation"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type LEAVE"
                  autoComplete="off"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={confirmText.trim().toUpperCase() !== "LEAVE"}
                    className="tactile inline-flex items-center gap-2 bg-ember-400 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-950 transition hover:bg-ember-300 disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-ink-400"
                  >
                    Confirm leave
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmLeave(false);
                      setConfirmText("");
                    }}
                    className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-200/80 transition hover:text-bone"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Section>
        </motion.div>
      </div>
    </div>
  );
}
