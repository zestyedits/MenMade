"use client";

/**
 * Landing page for both self-serve and admin-issued password recovery
 * links. Supabase verifies the token in the URL and redirects here with
 * a recovery-mode session in the URL fragment; the browser client picks
 * that up automatically (detectSessionInUrl=true).
 *
 * Flow:
 *   1. Mount → wait for session to materialize (or for an explicit error
 *      in the URL fragment).
 *   2. Show the password form.
 *   3. Submit → `supabase.auth.updateUser({ password })` → sign out →
 *      bounce to /auth/sign-in?reset=ok with a success banner.
 *
 * If the user lands here without a recovery session (refresh, bookmark,
 * expired link), surface a clear "link expired" state instead of a
 * silent failure.
 */

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Button } from "../../components/ui/Button";
import { MonoLabel } from "../../components/ui/MonoLabel";
import { createClient } from "../../lib/supabase/client";

type Phase = "checking" | "ready" | "submitting" | "done" | "expired";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Inspect both hash and query string. Supabase password recovery uses
    // EITHER `#access_token=…&type=recovery` (legacy hash flow) OR
    // `?code=…` (PKCE flow, default for @supabase/ssr). detectSessionInUrl
    // handles hash automatically; we exchange the PKCE code ourselves so
    // we don't depend on whatever async timing the SDK uses.
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const search = typeof window !== "undefined" ? window.location.search : "";
    const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
    const queryParams = new URLSearchParams(search);

    if (hashParams.get("error") || queryParams.get("error")) {
      setPhase("expired");
      return;
    }

    let resolved = false;
    function arm(session: unknown) {
      if (resolved || !session) return;
      resolved = true;
      setPhase("ready");
      // Strip the URL fragment + code query so a hard-refresh doesn't
      // re-trigger anything weird, and the URL bar looks clean.
      if (typeof window !== "undefined" && window.history.replaceState) {
        window.history.replaceState(null, "", "/auth/reset-password");
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange(
      (event: string, session: unknown) => {
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          arm(session);
        }
      },
    );

    // Explicit PKCE code exchange — runs in parallel with the SDK's own
    // detectSessionInUrl. If both fire, our arm() is idempotent.
    const code = queryParams.get("code");
    // Helper: only flip to "expired" if we haven't already armed. The
    // supabase/ssr browser client auto-detects `?code=` and exchanges it,
    // firing SIGNED_IN before our explicit exchange runs. The explicit
    // exchange then fails (code is single-use) and used to clobber the
    // success state with "expired." This guard prevents that race.
    function failIfNotArmed() {
      if (resolved) return;
      setPhase("expired");
    }

    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(
          (result: {
            data: { session: unknown };
            error: { message: string } | null;
          }) => {
            if (result.error) {
              console.warn("[reset-password] code exchange failed:", result.error);
              failIfNotArmed();
              return;
            }
            arm(result.data.session);
          },
        )
        .catch((err: unknown) => {
          console.warn("[reset-password] code exchange threw:", err);
          failIfNotArmed();
        });
    }

    // Sync check in case the session was already established.
    supabase.auth
      .getSession()
      .then(({ data }: { data: { session: unknown } }) => {
        if (data.session) arm(data.session);
      });

    // 12s timeout — gives slow Codespace networks room.
    const timeout = setTimeout(failIfNotArmed, 12000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("At least 8 characters. We're not joking.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setPhase("submitting");
    const supabase = createClient();
    const { error: upErr } = await supabase.auth.updateUser({ password });
    if (upErr) {
      setError(upErr.message);
      setPhase("ready");
      return;
    }

    // Sign out the recovery-mode session so the user has to use their new
    // password explicitly. Cleaner mental model.
    await supabase.auth.signOut();
    setPhase("done");
    setTimeout(() => router.replace("/auth/sign-in?reset=ok"), 1200);
  }

  if (phase === "checking") {
    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center">
        <MonoLabel ember>Verifying</MonoLabel>
        <div className="flex items-center gap-2">
          <Dot delay="0s" />
          <Dot delay="0.16s" />
          <Dot delay="0.32s" />
        </div>
        <p className="max-w-sm text-[13.5px] leading-relaxed text-ink-300/80">
          Confirming the recovery link.
        </p>
      </div>
    );
  }

  if (phase === "expired") {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <MonoLabel ember>Link expired</MonoLabel>
          <h1 className="text-[34px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[40px]">
            That link&rsquo;s dead.
          </h1>
          <p className="text-[14px] leading-relaxed text-ink-200/75">
            Reset links work once and expire after an hour. Request a fresh
            one.
          </p>
        </header>
        <div className="flex flex-wrap gap-3">
          <Button href="/auth/forgot">Request new link</Button>
          <Button variant="secondary" href="/auth/sign-in">
            Back to sign-in
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center">
        <MonoLabel ember>Set</MonoLabel>
        <p className="max-w-sm text-[14px] leading-relaxed text-bone">
          New password locked in. Signing you out so you can use it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <MonoLabel ember>Reset / Set new</MonoLabel>
        <h1 className="text-[34px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[40px]">
          Pick a new one.
        </h1>
        <p className="text-[14px] leading-relaxed text-ink-200/75">
          Make it something a stranger can&rsquo;t guess. We&rsquo;ll sign you
          out after so you can use the new one.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error ? (
          <div
            role="alert"
            className="border border-ember-400/60 bg-ember-400/[0.06] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ember-400"
          >
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="rp-password"
            className="text-[13px] font-medium text-bone"
          >
            New password
          </label>
          <input
            id="rp-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            disabled={phase === "submitting"}
            className="block w-full bg-ink-900 border border-white/10 rounded-sm px-3.5 py-2.5 text-[14px] text-bone placeholder:text-ink-400 outline-none transition focus:border-ember-400/60 focus:ring-1 focus:ring-ember-400/30"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="rp-confirm"
            className="text-[13px] font-medium text-bone"
          >
            Confirm
          </label>
          <input
            id="rp-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Type it again"
            disabled={phase === "submitting"}
            className="block w-full bg-ink-900 border border-white/10 rounded-sm px-3.5 py-2.5 text-[14px] text-bone placeholder:text-ink-400 outline-none transition focus:border-ember-400/60 focus:ring-1 focus:ring-ember-400/30"
          />
        </div>

        <Button type="submit" fullWidth disabled={phase === "submitting"} className="mt-2">
          {phase === "submitting" ? "Locking it in…" : "Set new password"}
          {phase !== "submitting" ? <ArrowRight size={14} weight="bold" /> : null}
        </Button>
      </form>

      <p className="flex items-center justify-center gap-2 text-center text-[12.5px] text-ink-300/75">
        <EnvelopeSimple size={13} weight="bold" className="text-ink-300/60" />
        <span>
          Wrong email?{" "}
          <Link
            href="/auth/forgot"
            className="text-bone underline underline-offset-4 decoration-bone/40 hover:decoration-bone"
          >
            Request a different reset
          </Link>
          .
        </span>
      </p>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block size-1.5 rounded-full bg-ember-400/80 animate-pulse"
      style={{ animationDelay: delay }}
    />
  );
}
