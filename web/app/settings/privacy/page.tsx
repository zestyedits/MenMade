"use client";

import { useEffect, useState } from "react";
import {
  Lock,
  Download,
  Trash,
  Warning,
  CheckCircle,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { Section, SettingsGroup } from "../../components/ui/Section";
import { Toggle } from "../../components/ui/Toggle";
import { Input } from "../../components/ui/Input";
import {
  store,
  defaultPrivacy,
  type PrivacyPrefs,
} from "../../lib/store";
import { signOut } from "../../lib/auth";

const LOCAL_DATA_LIST = [
  "Your handle, display name, optional pronouns, and timezone",
  "Onboarding answers (focus areas, intensity, days/week)",
  "Cycle progress, streak, total minutes logged",
  "Field log entries you write",
  "Messages you've sent in squad chat (cached for offline reads)",
  "Reactions, stamps, and reports you've made",
  "Operatives you've blocked",
  "Your notification, accessibility, and safety preferences",
];

const NEVER_LIST = [
  "Your precise location",
  "Your contacts, photos, or calendar (without an explicit per-action grant)",
  "Your activity on other apps or websites",
  "Behavioral profiles for ad targeting",
  "Voice, audio, or biometric data",
];

const THIRD_PARTY_LIST = [
  { name: "Vercel", purpose: "Hosting (web app delivery, no analytics SDK)" },
  { name: "Resend (planned)", purpose: "Transactional email (sign-in, digests). No marketing tools." },
];

export default function PrivacySettingsPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<PrivacyPrefs>(defaultPrivacy);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [exported, setExported] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    setPrefs(store.getPrivacy());
  }, []);

  function update<K extends keyof PrivacyPrefs>(
    key: K,
    value: PrivacyPrefs[K],
  ) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    store.setPrivacy(next);
    setSavedAt(Date.now());
    window.setTimeout(() => setSavedAt(null), 1500);
  }

  function handleExport() {
    const data = store.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `menmade-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    window.setTimeout(() => setExported(false), 2000);
  }

  async function handleWipe() {
    if (confirmText.trim().toUpperCase() !== "WIPE") return;
    store.wipeAll();
    await signOut();
    router.replace("/");
  }

  return (
    <>
      <Section
        kicker="01 / Posture"
        title="Local-first by default"
        description={
          <>
            MenMade runs on your device. We don&rsquo;t embed third-party
            analytics, ad pixels, or behavioral trackers. The product
            doesn&rsquo;t sell, rent, or syndicate your data.
          </>
        }
      >
        <div className="border border-ember-400/30 bg-ember-400/[0.04] p-5">
          <div className="flex items-start gap-3">
            <Lock
              size={20}
              weight="fill"
              className="mt-0.5 shrink-0 text-ember-400"
            />
            <p className="text-[14px] leading-relaxed text-bone">
              We only sync data off your device when you explicitly join a
              shared squad. Even then, the only thing that leaves is what
              you&rsquo;d expect to leave (chat messages, completion
              checkmarks, public profile fields).
            </p>
          </div>
        </div>
      </Section>

      <Section
        kicker="02 / Stored on this device"
        title="What we keep locally"
        description="Everything below lives in your browser's local storage and never leaves unless you act."
      >
        <ul className="flex flex-col divide-y divide-white/[0.04] border border-white/10 bg-ink-900/40">
          {LOCAL_DATA_LIST.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 px-4 py-3 text-[13.5px] text-ink-100/85"
            >
              <CheckCircle
                size={14}
                weight="fill"
                className="shrink-0 text-ember-400/80"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        kicker="03 / Never collected"
        title="What we don't take"
      >
        <ul className="flex flex-col divide-y divide-white/[0.04] border border-white/10 bg-ink-900/40">
          {NEVER_LIST.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 px-4 py-3 text-[13.5px] text-ink-200/80"
            >
              <X size={14} weight="bold" className="shrink-0 text-ink-300/60" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        kicker="04 / Vendors"
        title="Who we share infrastructure with"
        description="A small set of vendors that run the boring parts. Each is contractually limited to the purpose listed."
      >
        <ul className="flex flex-col divide-y divide-white/[0.04] border border-white/10 bg-ink-900/40">
          {THIRD_PARTY_LIST.map((v) => (
            <li
              key={v.name}
              className="flex items-baseline justify-between gap-4 px-4 py-3"
            >
              <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-bone">
                {v.name}
              </span>
              <span className="text-right text-[12.5px] text-ink-300/80">
                {v.purpose}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        kicker="05 / Email preferences"
        title="What we're allowed to send"
      >
        <SettingsGroup>
          <Toggle
            label="Marketing email"
            description="Product launch announcements and squad-of-the-month type emails. Off by default and easy to leave off."
            checked={prefs.marketingEmails}
            onChange={(v) => update("marketingEmails", v)}
          />
          <div className="border-t border-white/[0.04]" />
          <Toggle
            label="Product update email"
            description="Material changes to the product (new features, terms updates). Recommended on."
            checked={prefs.productUpdateEmails}
            onChange={(v) => update("productUpdateEmails", v)}
          />
        </SettingsGroup>
      </Section>

      <Section
        kicker="06 / Cross-squad sharing"
        title="Activity outside your squads"
        description="Future: an aggregated feed of cycle finishes across MenMade. You'd be anonymous unless you opt in."
      >
        <Toggle
          label="Share my completions to the cross-squad feed"
          description="Off by default. Off means you only show up to operatives in squads you've joined."
          checked={prefs.shareSquadActivity}
          onChange={(v) => update("shareSquadActivity", v)}
        />
      </Section>

      <Section
        kicker="07 / Export"
        title="Take your data with you"
        description="Downloads everything in this list as a JSON file. Open it in any text editor."
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="tactile inline-flex items-center gap-2 border border-white/15 bg-ink-900/40 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-bone transition hover:border-white/25"
          >
            <Download size={13} weight="bold" />
            Export everything
          </button>
          {exported ? (
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ember-400/85">
              Downloaded.
            </span>
          ) : null}
        </div>
      </Section>

      <Section
        kicker="Danger"
        title="Wipe local data"
        destructive
        description={
          <>
            Erases everything stored in your browser for MenMade and signs
            you out. Your account on the server (if you've joined a squad)
            stays — use the Account tab&rsquo;s &ldquo;Delete account&rdquo;
            for that.
          </>
        }
      >
        {!showWipeConfirm ? (
          <button
            type="button"
            onClick={() => setShowWipeConfirm(true)}
            className="tactile inline-flex items-center gap-2 border border-ember-400/50 bg-ember-400/[0.04] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ember-400 transition hover:border-ember-400/80 hover:bg-ember-400/[0.08]"
          >
            <Trash size={13} weight="bold" />
            Wipe local data
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
                <code className="font-mono font-bold text-ember-400">WIPE</code>{" "}
                to confirm. This is irreversible on this device.
              </p>
            </div>
            <Input
              label="Confirmation"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type WIPE"
              autoComplete="off"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={confirmText.trim().toUpperCase() !== "WIPE"}
                onClick={handleWipe}
                className="tactile inline-flex items-center gap-2 bg-ember-400 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-950 transition hover:bg-ember-300 disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-ink-400"
              >
                Wipe everything
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowWipeConfirm(false);
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

      <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/55">
        {savedAt ? "Saved." : "Email preferences save automatically."}
      </p>
    </>
  );
}
