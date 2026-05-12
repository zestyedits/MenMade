"use client";

/**
 * Auth callback. The destination Supabase redirects to after a user
 * clicks the link in their confirmation / password-reset / magic-link
 * email. The session tokens arrive in the URL fragment (#access_token=...
 * &refresh_token=...&type=signup); @supabase/ssr's browser client has
 * detectSessionInUrl=true by default, so it picks them up automatically
 * on mount.
 *
 * Once the session lands we route forward — onboarding for first-time
 * confirmations, dashboard for return visitors, /auth/sign-in?reset=1
 * for password resets (the reset-password page wants the user to set
 * a new password, not auto-proceed).
 *
 * We give it up to 8 seconds before giving up and bouncing to sign-in
 * with an error banner.
 */

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { hydrateStoreFromServer } from "../../lib/store-sync";
import { store } from "../../lib/store";
import { MonoLabel } from "../../components/ui/MonoLabel";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackShell label="Verifying" />}>
      <CallbackInner />
    </Suspense>
  );
}

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Supabase sends these in the URL fragment on error (e.g., expired link).
    // Parse the hash for any explicit error first.
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash.includes("error")) {
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const desc = params.get("error_description") ?? params.get("error");
      setErrorMsg(decodeURIComponent(desc ?? "Link expired or invalid.").replace(/\+/g, " "));
      const t = setTimeout(() => router.replace("/auth/sign-in"), 2400);
      return () => clearTimeout(t);
    }

    const supabase = createClient();
    let resolved = false;

    // Determine the post-sign-in destination based on email link "type".
    const type = new URLSearchParams(
      hash.replace(/^#/, ""),
    ).get("type");

    const queryNext = searchParams.get("next");
    function destination(): string {
      if (queryNext && queryNext.startsWith("/")) return queryNext;
      // Password-reset links: the user still needs to choose a new password,
      // so route them back to sign-in with the reset banner showing.
      if (type === "recovery") return "/auth/sign-in?reset=1";
      return store.hasOnboarded() ? "/dashboard" : "/onboarding";
    }

    async function go() {
      if (resolved) return;
      resolved = true;
      // Pull the user's persisted state down before the next page reads it.
      try {
        await hydrateStoreFromServer();
      } catch {
        // Non-fatal — onboarding/dashboard will fetch what they need.
      }
      router.replace(destination());
    }

    // The browser client auto-detects the URL session on construction —
    // we just need to wait for it to land. Use onAuthStateChange as the
    // primary signal, plus a getSession() poll as belt-and-suspenders.
    const { data: sub } = supabase.auth.onAuthStateChange(
      (event: string, session: unknown) => {
        if (event === "SIGNED_IN" && session) {
          void go();
        }
      },
    );

    // Some browsers / refresh paths surface the session synchronously.
    supabase.auth.getSession().then(({ data }: { data: { session: unknown } }) => {
      if (data.session) void go();
    });

    const timeout = setTimeout(() => {
      if (resolved) return;
      setErrorMsg("Confirmation took too long. Try signing in directly.");
      setTimeout(() => router.replace("/auth/sign-in"), 1800);
    }, 8000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, searchParams]);

  return <CallbackShell label={errorMsg ? "Hold up" : "Verifying"} error={errorMsg} />;
}

function CallbackShell({ label, error }: { label: string; error?: string | null }) {
  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <MonoLabel ember>{label}</MonoLabel>
      {error ? (
        <p className="max-w-sm text-[14px] leading-relaxed text-bone">
          {error}
        </p>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Dot delay="0s" />
            <Dot delay="0.16s" />
            <Dot delay="0.32s" />
          </div>
          <p className="max-w-sm text-[13.5px] leading-relaxed text-ink-300/80">
            Confirming your enlistment and pulling your file.
          </p>
        </>
      )}
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
