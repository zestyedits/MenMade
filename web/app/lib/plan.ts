import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/**
 * Server-side plan-gating. Source of truth is the `subscriptions`
 * table — the user's localStorage `subscription` key is informational
 * only and can lie. Anything that grants paid features must call
 * one of the helpers below.
 */

export type Plan =
  | "free"
  | "operator-monthly"
  | "operator-annual"
  | "founder";

export type SubscriptionRow = {
  plan: Plan;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  founder_seat_number: number | null;
  stripe_customer_id: string | null;
};

/**
 * Locked pricing memory: Free / Operator $14·mo or $129·yr / Founder's
 * Pass $299 capped at 500. Feature flags below reflect the comparison
 * matrix on /pricing.
 */
export const PLAN_FEATURES: Record<
  Plan,
  {
    label: string;
    activeSquadsCap: number;
    concurrentCycles: number | "unlimited";
    customCycles: boolean;
    leadTools: boolean;
    fieldLogRetentionDays: number | "forever";
    crossSquadFeed: boolean;
    operatorBadge: boolean;
    founderMark: boolean;
    priorityModeration: boolean;
    directSupport: boolean;
  }
> = {
  free: {
    label: "Free",
    activeSquadsCap: 3,
    concurrentCycles: 1,
    customCycles: false,
    leadTools: false,
    fieldLogRetentionDays: 30,
    crossSquadFeed: false,
    operatorBadge: false,
    founderMark: false,
    priorityModeration: false,
    directSupport: false,
  },
  "operator-monthly": {
    label: "Operator (Monthly)",
    activeSquadsCap: 6,
    concurrentCycles: "unlimited",
    customCycles: true,
    leadTools: true,
    fieldLogRetentionDays: "forever",
    crossSquadFeed: true,
    operatorBadge: true,
    founderMark: false,
    priorityModeration: true,
    directSupport: true,
  },
  "operator-annual": {
    label: "Operator (Annual)",
    activeSquadsCap: 6,
    concurrentCycles: "unlimited",
    customCycles: true,
    leadTools: true,
    fieldLogRetentionDays: "forever",
    crossSquadFeed: true,
    operatorBadge: true,
    founderMark: false,
    priorityModeration: true,
    directSupport: true,
  },
  founder: {
    label: "Founder's Pass",
    activeSquadsCap: 6,
    concurrentCycles: "unlimited",
    customCycles: true,
    leadTools: true,
    fieldLogRetentionDays: "forever",
    crossSquadFeed: true,
    operatorBadge: true,
    founderMark: true,
    priorityModeration: true,
    directSupport: true,
  },
};

/**
 * Returns the active plan for the current request's user.
 *
 * Falls back to "free" when:
 *   - no user (unauthenticated)
 *   - no subscriptions row
 *   - subscription canceled AND current_period_end has passed
 *
 * A canceled subscription whose period hasn't ended yet still
 * returns its paid plan — the user paid through that date.
 */
export async function getPlan(): Promise<Plan> {
  const sub = await getSubscription();
  if (!sub) return "free";

  // Free row in DB → free.
  if (sub.plan === "free") return "free";

  // Active or past_due (still in grace) → honor the plan.
  if (sub.status === "active" || sub.status === "trialing") {
    return sub.plan;
  }

  // Canceled but period hasn't expired yet → still paid.
  if (
    sub.status === "canceled" &&
    sub.current_period_end &&
    new Date(sub.current_period_end).getTime() > Date.now()
  ) {
    return sub.plan;
  }

  // Founder's Pass is one-time; once active it stays granted.
  // The webhook sets status='active' on completion and never
  // moves it to canceled, so the active branch above covers it.
  // Defensive: if we see a founder row with no status, honor it.
  if (sub.plan === "founder" && sub.founder_seat_number != null) {
    return "founder";
  }

  return "free";
}

/**
 * Returns the raw subscription row for the current user, or null
 * if unauthenticated / no row exists.
 */
export async function getSubscription(): Promise<SubscriptionRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "plan,status,current_period_end,cancel_at_period_end,founder_seat_number,stripe_customer_id",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as SubscriptionRow;
}

/** True if the current user has any paid plan active. */
export async function isOperator(): Promise<boolean> {
  const plan = await getPlan();
  return plan !== "free";
}

/**
 * Server-Component / route-handler guard. Redirects free users to
 * /pricing with a brief query flag the UI can use to nudge them.
 */
export async function requireOperator(returnTo?: string): Promise<void> {
  const plan = await getPlan();
  if (plan === "free") {
    const url = new URL(
      "/pricing",
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    );
    url.searchParams.set("gate", "operator");
    if (returnTo) url.searchParams.set("next", returnTo);
    redirect(url.pathname + url.search);
  }
}
