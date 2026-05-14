"use client";

/**
 * Tiny client hook that pulls the signed-in user's current plan +
 * founder seat number from Supabase via the browser client. Reads are
 * authorized by RLS (owner-only on `subscriptions`), so no API route
 * is needed — the anon key + the user's cookie are sufficient.
 *
 * Cached for the lifetime of the tab: plan rarely changes mid-session,
 * and the few places it does (billing cancel, founder purchase) call
 * router.refresh() which remounts everything fed by the hook anyway.
 */

import { useEffect, useState } from "react";
import { createClient } from "./supabase/client";

export type Tier = {
  plan: "free" | "operator-monthly" | "operator-annual" | "founder";
  founderSeatNumber: number | null;
};

type State = Tier | "loading";

export function useTier(): State {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("subscriptions")
        .select("plan, founder_seat_number, status, current_period_end")
        .maybeSingle();
      if (cancelled) return;
      if (!data) {
        setState({ plan: "free", founderSeatNumber: null });
        return;
      }
      // Treat canceled + past-period subscriptions as free, mirroring the
      // server-side logic in lib/plan.ts.
      const stillActive =
        data.status !== "canceled" ||
        (data.current_period_end &&
          new Date(data.current_period_end).getTime() > Date.now());
      setState({
        plan: stillActive ? data.plan : "free",
        founderSeatNumber: data.founder_seat_number,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
