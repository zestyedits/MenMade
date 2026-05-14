import "server-only";
import { createAdminClient } from "../lib/supabase/admin";
import { isAdminEmail } from "../lib/admin";

/**
 * Server-only data loaders for the admin dashboard. All reads use the
 * service-role client (bypasses RLS). Returned shapes are intentionally
 * narrow — only the fields the UI renders — so we don't leak more PII
 * than necessary into the HTML.
 *
 * Callers must already have passed requireAdmin().
 */

const FOUNDER_CAP = 500;
const ROW_LIMIT = 20;

const OPERATOR_PLANS = new Set(["operator-monthly", "operator-annual"]);

export type Vitals = {
  totalUsers: number;
  paidUsers: number;
  founderClaimed: number;
  founderCap: number;
  operatorActive: number;
  founderActive: number;
  mrrApproxUsd: number;
};

type SubscriptionRow = {
  user_id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
  founder_seat_number: number | null;
  started_at: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  stripe_session_id: string | null;
  cancel_at_period_end: boolean | null;
};

export type RecentEnlistee = {
  userId: string;
  email: string;
  handle: string | null;
  signedUpAtIso: string;
  plan: string;
  isAdmin: boolean;
  suspended: boolean;
};

export type ConcernSignalRow = {
  id: string;
  kind: string;
  severity: "low" | "medium" | "high";
  title: string;
  body: string | null;
  relatedEmail: string | null;
  createdAtIso: string;
};

export type AdminActionRow = {
  id: string;
  action: string;
  adminEmail: string;
  targetEmail: string | null;
  createdAtIso: string;
  metadata: Record<string, unknown> | null;
};

export type ActiveSubscription = {
  userId: string;
  email: string;
  plan: string;
  status: string;
  currentPeriodEndIso: string | null;
  founderSeatNumber: number | null;
  startedAtIso: string | null;
  /** True when the locked refund policy permits a refund right now. */
  refundable: boolean;
  refundDenyReason: string | null;
};

export type FounderSeat = {
  seatNumber: number;
  email: string | null;
  claimedAtIso: string | null;
};

export type WebhookEvent = {
  id: string;
  type: string;
  receivedAtIso: string;
  /** True when this event is the lonely first-leg of a pair (e.g.
   *  checkout.session.completed without a follow-up subscription.created). */
  flagged: boolean;
};

/**
 * Vitals tiles. MRR is an APPROXIMATION — we don't store the per-row
 * amount on subscriptions, so we extrapolate from active counts at list
 * price (Operator monthly $14, annual $129/12 ≈ $10.75). Founder's Pass
 * is one-time, excluded from MRR.
 */
export async function loadVitals(): Promise<Vitals> {
  const admin = createAdminClient();

  const [{ count: totalUsers }, subsRes, seatsRes] = await Promise.all([
    admin.from("profiles").select("user_id", { count: "exact", head: true }),
    admin
      .from("subscriptions")
      .select("plan,status")
      .neq("plan", "free"),
    admin
      .from("founder_seats")
      .select("seat_number", { count: "exact", head: true })
      .not("user_id", "is", null),
  ]);

  const subs = (subsRes.data ?? []) as Array<{ plan: string; status: string }>;
  const operatorMonthly = subs.filter(
    (s) => s.plan === "operator-monthly" && s.status === "active",
  ).length;
  const operatorAnnual = subs.filter(
    (s) => s.plan === "operator-annual" && s.status === "active",
  ).length;
  const founderActive = subs.filter(
    (s) => s.plan === "founder" && s.status === "active",
  ).length;
  const operatorActive = operatorMonthly + operatorAnnual;

  // List-price extrapolation. Documented above.
  const mrrApproxUsd =
    operatorMonthly * 14 + operatorAnnual * (129 / 12);

  return {
    totalUsers: totalUsers ?? 0,
    paidUsers: operatorActive + founderActive,
    founderClaimed: seatsRes.count ?? 0,
    founderCap: FOUNDER_CAP,
    operatorActive,
    founderActive,
    mrrApproxUsd: Math.round(mrrApproxUsd * 100) / 100,
  };
}

/**
 * Last 20 sign-ups. Joins auth.users (via the admin API) with profiles
 * and subscriptions in-memory because auth.users isn't queryable from
 * PostgREST directly.
 */
export async function loadRecentEnlistees(): Promise<RecentEnlistee[]> {
  const admin = createAdminClient();

  // listUsers returns paginated results sorted by created_at DESC.
  // perPage = ROW_LIMIT keeps the payload small.
  const { data: list } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: ROW_LIMIT,
  });
  const users = list?.users ?? [];
  if (users.length === 0) return [];

  const userIds = users.map((u) => u.id);
  const [profilesRes, subsRes] = await Promise.all([
    admin
      .from("profiles")
      .select("user_id,handle,suspended_at")
      .in("user_id", userIds),
    admin
      .from("subscriptions")
      .select("user_id,plan,status")
      .in("user_id", userIds),
  ]);

  const handles = new Map<string, string>();
  const suspended = new Set<string>();
  for (const p of (profilesRes.data ?? []) as Array<{
    user_id: string;
    handle: string;
    suspended_at: string | null;
  }>) {
    handles.set(p.user_id, p.handle);
    if (p.suspended_at) suspended.add(p.user_id);
  }
  const plans = new Map<string, string>();
  for (const s of subsRes.data ?? []) {
    plans.set(s.user_id, s.status === "active" ? s.plan : "free");
  }

  return users.map((u) => ({
    userId: u.id,
    email: u.email ?? "(no email)",
    handle: handles.get(u.id) ?? null,
    signedUpAtIso: u.created_at ?? new Date().toISOString(),
    plan: plans.get(u.id) ?? "free",
    isAdmin: isAdminEmail(u.email),
    suspended: suspended.has(u.id),
  }));
}

/**
 * Open concern_signals (not yet dismissed), sorted high → low severity then
 * newest first. Capped at 50; Buddy only renders 8 at a time but the rest
 * are reachable via "X more". Service-role read; UI is admin-gated.
 */
export async function loadOpenConcernSignals(): Promise<ConcernSignalRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("concern_signals")
    .select("id,kind,severity,title,body,related_email,created_at")
    .is("dismissed_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[admin/_data] loadOpenConcernSignals failed:", error);
    return [];
  }

  const rows = (data ?? []) as Array<{
    id: string;
    kind: string;
    severity: "low" | "medium" | "high";
    title: string;
    body: string | null;
    related_email: string | null;
    created_at: string;
  }>;

  // Sort by severity (high → low), then by created_at desc (within tie).
  const sevRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
  rows.sort((a, b) => {
    const s = sevRank[a.severity] - sevRank[b.severity];
    if (s !== 0) return s;
    return Date.parse(b.created_at) - Date.parse(a.created_at);
  });

  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    severity: r.severity,
    title: r.title,
    body: r.body,
    relatedEmail: r.related_email,
    createdAtIso: r.created_at,
  }));
}

/**
 * Last 20 admin_actions rows for the on-page audit feed. Joins
 * admin_user_id and target_user_id back to emails (one auth.admin call
 * per distinct id, capped by the row limit).
 */
export async function loadRecentAdminActions(): Promise<AdminActionRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admin_actions")
    .select(
      "id,action,admin_user_id,target_user_id,target_email,metadata,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(ROW_LIMIT);

  if (error) {
    console.error("[admin/_data] loadRecentAdminActions failed:", error);
    return [];
  }

  const rows = (data ?? []) as Array<{
    id: string;
    action: string;
    admin_user_id: string;
    target_user_id: string | null;
    target_email: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
  }>;

  // Resolve admin emails (small set, dedupe).
  const distinctAdminIds = Array.from(
    new Set(rows.map((r) => r.admin_user_id)),
  );
  const adminEmails = new Map<string, string>();
  await Promise.all(
    distinctAdminIds.map(async (id) => {
      const { data: u } = await admin.auth.admin.getUserById(id);
      adminEmails.set(id, u.user?.email ?? "(deleted)");
    }),
  );

  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    adminEmail: adminEmails.get(r.admin_user_id) ?? "(unknown)",
    targetEmail: r.target_email,
    createdAtIso: r.created_at,
    metadata: r.metadata,
  }));
}

function refundEligibility(sub: SubscriptionRow): {
  refundable: boolean;
  reason: string | null;
} {
  if (sub.status !== "active" && sub.status !== "trialing") {
    return { refundable: false, reason: "Subscription is not active." };
  }
  if (sub.plan === "operator-monthly") {
    return {
      refundable: false,
      reason: "Monthly tier — no refund on current period.",
    };
  }
  const start = sub.started_at ? Date.parse(sub.started_at) : NaN;
  if (Number.isNaN(start)) {
    return { refundable: false, reason: "No start date on record." };
  }
  const days = (Date.now() - start) / (1000 * 60 * 60 * 24);
  if (days > 14) {
    return { refundable: false, reason: "Past 14-day window." };
  }
  return { refundable: true, reason: null };
}

/**
 * Active subscription rows (not 'none', not 'refunded'). Joined with
 * auth.users by user_id for the email column. Capped at ROW_LIMIT.
 */
export async function loadActiveSubscriptions(): Promise<ActiveSubscription[]> {
  const admin = createAdminClient();

  const { data: rows } = await admin
    .from("subscriptions")
    .select(
      "user_id,plan,status,current_period_end,founder_seat_number,started_at,stripe_subscription_id,stripe_customer_id,stripe_session_id,cancel_at_period_end",
    )
    .neq("plan", "free")
    .neq("status", "none")
    .order("started_at", { ascending: false })
    .limit(ROW_LIMIT);

  const subs = (rows ?? []) as SubscriptionRow[];
  if (subs.length === 0) return [];

  // Fetch emails for these users from auth via the admin getUserById API.
  // listUsers can't filter to a specific id set, so we issue one call per
  // user. 20 calls max, well below any rate limit.
  const emails = new Map<string, string>();
  await Promise.all(
    subs.map(async (s) => {
      const { data } = await admin.auth.admin.getUserById(s.user_id);
      emails.set(s.user_id, data.user?.email ?? "(no email)");
    }),
  );

  return subs.map((s) => {
    const { refundable, reason } = refundEligibility(s);
    return {
      userId: s.user_id,
      email: emails.get(s.user_id) ?? "(no email)",
      plan: s.plan,
      status: s.status,
      currentPeriodEndIso: s.current_period_end,
      founderSeatNumber: s.founder_seat_number,
      startedAtIso: s.started_at,
      refundable,
      refundDenyReason: reason,
    };
  });
}

/**
 * All 500 founder seats. Returned in seat-number order so the UI can
 * render the grid by index without re-sorting.
 */
export async function loadFounderSeats(): Promise<FounderSeat[]> {
  const admin = createAdminClient();

  const { data: rows } = await admin
    .from("founder_seats")
    .select("seat_number,user_id,claimed_at")
    .order("seat_number", { ascending: true });

  const seats = (rows ?? []) as Array<{
    seat_number: number;
    user_id: string | null;
    claimed_at: string | null;
  }>;

  const claimedUserIds = seats
    .map((s) => s.user_id)
    .filter((id): id is string => id !== null);

  const emails = new Map<string, string>();
  if (claimedUserIds.length > 0) {
    await Promise.all(
      Array.from(new Set(claimedUserIds)).map(async (id) => {
        const { data } = await admin.auth.admin.getUserById(id);
        emails.set(id, data.user?.email ?? "(no email)");
      }),
    );
  }

  return seats.map((s) => ({
    seatNumber: s.seat_number,
    email: s.user_id ? (emails.get(s.user_id) ?? "(claimed)") : null,
    claimedAtIso: s.claimed_at,
  }));
}

/**
 * Last 20 stripe_events rows. Flags any checkout.session.completed
 * older than 5 minutes that has no matching customer.subscription.created
 * recorded — that's a signal a webhook half-fired.
 */
export async function loadWebhookEvents(): Promise<WebhookEvent[]> {
  const admin = createAdminClient();

  const { data: rows } = await admin
    .from("stripe_events")
    .select("id,type,received_at")
    .order("received_at", { ascending: false })
    .limit(ROW_LIMIT);

  const events = (rows ?? []) as Array<{
    id: string;
    type: string;
    received_at: string;
  }>;

  // Build a set of types seen in this window for the cheap cross-check.
  // A real correlation would key off subscription_id; the per-event
  // type-only check is conservative and surfaces "we saw the start but
  // never the completion" patterns without joining other tables.
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const seenTypes = new Set(events.map((e) => e.type));

  return events.map((e) => {
    const t = Date.parse(e.received_at);
    const old = Number.isFinite(t) && t < fiveMinAgo;
    const flagged =
      old &&
      e.type === "checkout.session.completed" &&
      !seenTypes.has("customer.subscription.created");
    return {
      id: e.id,
      type: e.type,
      receivedAtIso: e.received_at,
      flagged,
    };
  });
}
