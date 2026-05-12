"use client";

import { useEffect } from "react";
import { hydrateStoreFromServer, startStoreSync } from "../lib/store-sync";
import { createClient } from "../lib/supabase/client";

/**
 * Tiny no-render client component that boots the store sync layer on
 * page load. Renders nothing visible.
 *
 * Responsibilities:
 *   1. Start the local→server write listener (idempotent — only attaches once)
 *   2. Hydrate localStorage from Supabase on initial load if user is signed in
 *   3. Re-hydrate when auth state changes (sign-in from another tab, etc.)
 *
 * Mounted from the root layout so every route gets it for free.
 */
export function StoreSyncBoot() {
  useEffect(() => {
    const stopSync = startStoreSync();
    const supabase = createClient();

    // Initial hydration if we land on a page already signed in.
    void hydrateStoreFromServer();

    // Re-hydrate on auth changes (sign-in / refresh / sign-out).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          void hydrateStoreFromServer();
        }
      },
    );

    return () => {
      stopSync();
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
