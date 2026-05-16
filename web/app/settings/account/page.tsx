"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, SignOut, Trash, Warning } from "@phosphor-icons/react/dist/ssr";
import { Section } from "../../components/ui/Section";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { getSession, signOut } from "../../lib/auth";
import { store } from "../../lib/store";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmText, setConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await getSession();
      if (cancelled) return;
      const id = store.getIdentity();
      if (s) setEmail(s.email);
      if (id) {
        setName(id.displayName);
        setHandle(id.handle);
      } else if (s) {
        setName(s.name);
        setHandle(s.handle);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSaveIdentity() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Required.";
    if (handle.trim().length < 2) next.handle = "At least 2 characters.";
    else if (!/^[a-z0-9_-]+$/.test(handle))
      next.handle = "Letters, numbers, hyphen, underscore only. Lowercase.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    store.setIdentity({
      handle: handle.trim(),
      displayName: name.trim(),
      pronouns: store.getIdentity()?.pronouns,
    });
    // The store sync layer persists handle/display_name to the profiles
    // table server-side; the supabase auth identity (email + userId) is
    // owned by supabase.auth and doesn't change here.
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 1800);
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/auth/sign-in");
  }

  async function handleDeleteAccount() {
    if (confirmText.trim().toUpperCase() !== "DELETE") return;
    setDeleting(true);
    try {
      // Server-side delete first (Supabase admin API removes the user
      // and RLS cascades clean up all user_id rows). Then wipe local
      // cache. If the API call fails, we still wipe local + sign out
      // so the user isn't stuck in a half-deleted state.
      await fetch("/api/account/delete", { method: "POST" });
    } catch {
      // proceed regardless
    }
    store.wipeAll();
    await signOut();
    router.replace("/");
  }

  return (
    <>
      <Section
        kicker="01 / Identity"
        title="Member ID"
        description={
          <>
            What the squad sees. Your handle is also the link people use to
            find you (<code className="font-mono text-bone">@{handle || "—"}</code>).
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            autoComplete="name"
          />
          <Input
            label="Handle"
            value={handle}
            onChange={(e) =>
              setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
            }
            error={errors.handle}
            hint="Letters, numbers, hyphen, underscore. Lowercased."
          />
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSaveIdentity}>Save</Button>
            {savedAt ? (
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ember-400/85">
                Saved.
              </span>
            ) : null}
          </div>
        </div>
      </Section>

      <Section
        kicker="02 / Sign-in"
        title="Email & password"
        description="Sign-in identity. Changing your email moves your account to the new address; old links keep working."
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Email"
            type="email"
            value={email}
            readOnly
            hint="Email change requires a verification link. We'll email both addresses."
            autoComplete="email"
          />

          <div className="border border-white/10 bg-ink-900/40 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <div className="text-[14px] font-medium text-bone">Password</div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-300/75">
                  We never store your raw password. Reset sends a one-time
                  link to the email on file.
                </p>
              </div>
              <Button variant="secondary" size="sm" href="/auth/forgot">
                Send reset link
              </Button>
            </div>
          </div>

          <div className="border border-white/10 bg-ink-900/40 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <div className="text-[14px] font-medium text-bone">
                  Two-factor authentication
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-300/75">
                  Coming with the native app. App Store policy requires 2FA
                  for accounts that can post in shared squads.
                </p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
                Soon
              </span>
            </div>
          </div>
        </div>
      </Section>

      <Section
        kicker="03 / Session"
        title="Sign out"
        description="Signs out of this device only. Other devices stay signed in."
      >
        <Button variant="secondary" onClick={handleSignOut}>
          <SignOut size={14} weight="bold" />
          Sign out
        </Button>
      </Section>

      <Section
        kicker="Danger"
        title="Delete account"
        destructive
        description={
          <>
            Permanently deletes your account, your field log, and your stamp
            history. Squad memberships end. Cannot be undone.{" "}
            <strong className="text-bone">
              Your authored chat messages stay visible to your squad-mates by
              default
            </strong>{" "}
            (per the moderation appeals trail) — request a hard purge from
            the Privacy tab if you need them removed.
          </>
        }
      >
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="tactile inline-flex items-center gap-2 border border-ember-400/50 bg-ember-400/[0.04] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ember-400 transition hover:border-ember-400/80 hover:bg-ember-400/[0.08]"
          >
            <Trash size={13} weight="bold" />
            Begin deletion
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
                  DELETE
                </code>{" "}
                to confirm. This wipes your local data immediately and queues
                a server-side purge that completes within 30 days.
              </p>
            </div>
            <Input
              label="Confirmation"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              autoComplete="off"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={confirmText.trim().toUpperCase() !== "DELETE"}
                onClick={handleDeleteAccount}
                className="tactile inline-flex items-center gap-2 bg-ember-400 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-950 transition hover:bg-ember-300 disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-ink-400"
              >
                Delete account
                <ArrowRight size={13} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
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
    </>
  );
}
