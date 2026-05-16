"use client";

/**
 * Lightweight client hook: returns whether the user has a Supabase
 * session. No DB query — only reads the cached auth state. Use this in
 * marketing chrome (Navbar, Footer) to swap "Sign in / Sign up" CTAs
 * for "Open dashboard" when the user is already signed in.
 *
 * For tier-specific behavior (paid vs free), use lib/use-tier.ts —
 * that one queries the subscriptions table and is more expensive.
 */

import { useEffect, useState } from "react";
import { createClient } from "./supabase/client";

type State = "checking" | "signed-in" | "signed-out";

export function useIsSignedIn(): State {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    supabase.auth.getUser().then(
      ({ data }: { data: { user: { id: string } | null } }) => {
        if (cancelled) return;
        setState(data.user ? "signed-in" : "signed-out");
      },
    );

    // Re-check on auth-state changes so the nav reflects sign-out without a refresh.
    const { data: sub } = supabase.auth.onAuthStateChange((event: string) => {
      if (cancelled) return;
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setState("signed-in");
      } else if (event === "SIGNED_OUT") {
        setState("signed-out");
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
