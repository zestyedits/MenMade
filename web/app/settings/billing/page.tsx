import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { getSubscription } from "../../lib/plan";
import BillingClient, { type Subscription } from "./BillingClient";

/**
 * /settings/billing — Server Component shell.
 *
 * Source of truth is the `subscriptions` row, not localStorage.
 * Reads:
 *   - the user's plan + status via getSubscription() (lib/plan.ts)
 *   - the live Founder's Pass tally from the public view
 *
 * Then hands a typed snapshot to the interactive client component.
 * The client component's Stripe Checkout + Portal buttons round-trip
 * through /api/billing/* and rely on the server state being fresh on
 * page load; we mark the route dynamic so it never serves a cached
 * billing summary.
 */

export const metadata = {
  title: "Billing — MenMade",
};

export const dynamic = "force-dynamic";

async function fetchFounderCount(): Promise<{ claimed: number; cap: number }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("founder_seats_taken_count")
      .select("claimed,cap")
      .maybeSingle();
    if (error || !data) return { claimed: 0, cap: 500 };
    return { claimed: data.claimed, cap: data.cap };
  } catch {
    return { claimed: 0, cap: 500 };
  }
}

export default async function BillingPage() {
  // Protected route — proxy.ts already redirects unauthenticated
  // users hitting /settings/* to /auth/sign-in, but belt + braces.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/settings/billing");

  const [sub, { claimed, cap }] = await Promise.all([
    getSubscription(),
    fetchFounderCount(),
  ]);

  // Map DB row → the shape BillingClient expects.
  const initialSub: Subscription = sub
    ? {
        plan: sub.plan,
        startedAtIso: null, // The DB has started_at; column not in the projection. UI uses renewsAtIso.
        renewsAtIso: sub.current_period_end,
        founderSeatNumber: sub.founder_seat_number,
      }
    : {
        plan: "free",
        startedAtIso: null,
        renewsAtIso: null,
        founderSeatNumber: null,
      };

  return (
    <BillingClient
      initialSub={initialSub}
      founderClaimed={claimed}
      founderCap={cap}
    />
  );
}
