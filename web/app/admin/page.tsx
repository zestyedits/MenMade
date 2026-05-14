import { requireAdmin } from "../lib/admin";
import { AdminShell } from "./AdminShell";
import { BuddyPanel } from "./BuddyPanel";
import { RefundButton } from "./RefundButton";
import { UserActionsMenu } from "./UserActionsMenu";
import {
  loadActiveSubscriptions,
  loadFounderSeats,
  loadOpenConcernSignals,
  loadRecentAdminActions,
  loadRecentEnlistees,
  loadVitals,
  loadWebhookEvents,
  type FounderSeat,
} from "./_data";

/**
 * /admin — single-page dashboard for the founder. Server-rendered. Six
 * sections numbered 00–05 to match the kicker pattern used across the
 * rest of the app (see /settings/billing).
 *
 * Design note (May 2026): admin is the one surface where the dry,
 * restrained brand register relaxes. Goal here is at-a-glance scanning
 * for an ADHD operator — color is information, not decoration:
 *
 *   - statuses get semantic dots (ember/bone/amber/red/ink)
 *   - vitals tiles use big display numbers + ember accents on the
 *     metrics that matter (founder seats, MRR)
 *   - founder grid is now a recency heatmap (new claims glow)
 *   - webhook events are color-keyed by type
 *
 * All data is fetched at request time via service-role queries.
 * Refund actions are client interactivity isolated to <RefundButton />.
 */

export const metadata = {
  title: "Admin — MenMade",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function fmtRelative(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  const diffMs = Date.now() - t;
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 48) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  "operator-monthly": "Operator · monthly",
  "operator-annual": "Operator · annual",
  founder: "Founder",
};

export default async function AdminPage() {
  const adminUser = await requireAdmin();

  const [
    vitals,
    enlistees,
    subs,
    seats,
    events,
    signals,
    adminActions,
  ] = await Promise.all([
    loadVitals(),
    loadRecentEnlistees(),
    loadActiveSubscriptions(),
    loadFounderSeats(),
    loadWebhookEvents(),
    loadOpenConcernSignals(),
    loadRecentAdminActions(),
  ]);

  // Set of user_ids with a claimed founder seat — drives which actions
  // appear in the per-row menu (grant vs revoke). Built from subs since
  // founder_seats rows don't carry email; subs rows do.
  const userIdsWithSeat = new Set<string>(
    subs
      .filter((s) => s.founderSeatNumber != null)
      .map((s) => s.userId),
  );

  const paidPct =
    vitals.totalUsers > 0
      ? Math.round((vitals.paidUsers / vitals.totalUsers) * 100)
      : 0;
  const founderPct = Math.round(
    (vitals.founderClaimed / Math.max(1, vitals.founderCap)) * 100,
  );

  return (
    <AdminShell>
      {/* ---------- Buddy / Field comms ---------- */}
      <BuddyPanel signals={signals} />

      {/* ---------- 00 / Vitals ---------- */}
      <AdminSection kicker="00" title="Vitals" subtitle="By the numbers">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <BigTile
            label="Operatives"
            value={String(vitals.totalUsers)}
            tone="bone"
          />
          <BigTile
            label="Paid"
            value={String(vitals.paidUsers)}
            sub={vitals.totalUsers > 0 ? `${paidPct}% of base` : "—"}
            tone="bone"
            ratio={vitals.totalUsers > 0 ? paidPct / 100 : 0}
          />
          <BigTile
            label="Founder seats"
            value={
              vitals.founderClaimed === 0
                ? "—"
                : `${vitals.founderClaimed}/${vitals.founderCap}`
            }
            sub={
              vitals.founderClaimed === 0
                ? "Cap 500"
                : `${founderPct}% claimed`
            }
            tone="ember"
            ratio={vitals.founderClaimed / vitals.founderCap}
            ratioEmber
          />
          <BigTile
            label="Operator active"
            value={String(vitals.operatorActive)}
            tone="bone"
          />
          <BigTile
            label="Founder active"
            value={String(vitals.founderActive)}
            tone="bone"
          />
          <BigTile
            label="MRR · approx"
            value={
              vitals.mrrApproxUsd === 0
                ? "—"
                : `$${vitals.mrrApproxUsd.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}`
            }
            sub={
              vitals.mrrApproxUsd === 0
                ? "No paid subs"
                : `$${vitals.mrrApproxUsd.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} / mo`
            }
            tone="ember"
          />
        </div>
        <p className="mt-4 max-w-[60ch] text-[12.5px] text-ink-300/60">
          MRR extrapolates from list price; Founder&rsquo;s Pass excluded
          (one-time). For accountant-grade numbers, see Stripe.
        </p>
      </AdminSection>

      {/* ---------- 01 / Recent enlistees ---------- */}
      <AdminSection
        kicker="01"
        title="Recent enlistees"
        subtitle="Last twenty through the door"
      >
        <Table head={["Email", "Handle", "Plan", "Joined", ""]}>
          {enlistees.map((u, i) => (
            <TR key={u.userId} striped={i % 2 === 1}>
              <Cell>
                <span className="text-bone">{u.email}</span>
                {u.isAdmin ? (
                  <span className="ml-2 inline-flex items-center bg-ember-400/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-ember-400">
                    Admin
                  </span>
                ) : null}
                {u.suspended ? (
                  <span className="ml-2 inline-flex items-center bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-amber-300">
                    Suspended
                  </span>
                ) : null}
              </Cell>
              <Cell mono>{u.handle ?? "—"}</Cell>
              <Cell>
                <PlanChip plan={u.plan} />
              </Cell>
              <Cell mono>{fmtRelative(u.signedUpAtIso)}</Cell>
              <Cell>
                <UserActionsMenu
                  userId={u.userId}
                  email={u.email}
                  suspended={u.suspended}
                  hasFounderSeat={userIdsWithSeat.has(u.userId)}
                  isSelf={u.userId === adminUser.userId}
                />
              </Cell>
            </TR>
          ))}
          {enlistees.length === 0 ? <EmptyRow span={5} text="No enlistees yet." /> : null}
        </Table>
      </AdminSection>

      {/* ---------- 02 / Active subscriptions ---------- */}
      <AdminSection
        kicker="02"
        title="Active subscriptions"
        subtitle="Paying operatives"
        description="Refund button enforces the locked policy server-side. UI here only reflects eligibility."
      >
        <Table
          head={["Email", "Plan", "Status", "Renews / ends", "Seat", "Action"]}
        >
          {subs.map((s, i) => (
            <TR key={s.userId} striped={i % 2 === 1}>
              <Cell>{s.email}</Cell>
              <Cell>
                <PlanChip plan={s.plan} />
              </Cell>
              <Cell>
                <StatusChip status={s.status} />
              </Cell>
              <Cell mono>{fmtDate(s.currentPeriodEndIso)}</Cell>
              <Cell mono>
                {s.founderSeatNumber != null ? (
                  <span className="text-ember-400">
                    {String(s.founderSeatNumber).padStart(3, "0")}
                  </span>
                ) : (
                  "—"
                )}
              </Cell>
              <Cell>
                <RefundButton
                  userId={s.userId}
                  email={s.email}
                  refundable={s.refundable}
                  denyReason={s.refundDenyReason}
                />
              </Cell>
            </TR>
          ))}
          {subs.length === 0 ? (
            <EmptyRow span={6} text="No active subscriptions." />
          ) : null}
        </Table>
      </AdminSection>

      {/* ---------- 03 / Founder seats ---------- */}
      <AdminSection
        kicker="03"
        title="Founder seats"
        subtitle={`${vitals.founderClaimed} of ${vitals.founderCap} claimed`}
        description="Heatmap by claim recency. Hover any cell for seat number and claimant."
      >
        <FounderSeatGrid seats={seats} />
        <FounderLegend />
      </AdminSection>

      {/* ---------- 04 / Webhook activity ---------- */}
      <AdminSection
        kicker="04"
        title="Webhook activity"
        subtitle="Last twenty Stripe events"
        description="Flag means: a checkout.session.completed older than five minutes with no matching subscription.created in this window."
      >
        <Table head={["Type", "Event ID", "Received"]}>
          {events.map((e, i) => (
            <TR
              key={e.id}
              striped={i % 2 === 1}
              extraClass={e.flagged ? "bg-amber-500/[0.06]" : ""}
            >
              <Cell>
                {e.flagged ? (
                  <span className="mr-2 inline-flex items-center bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-amber-300">
                    Flag
                  </span>
                ) : null}
                <EventTypeChip type={e.type} />
              </Cell>
              <Cell mono>
                <span className="text-ink-300/70">{e.id}</span>
              </Cell>
              <Cell mono>{fmtRelative(e.receivedAtIso)}</Cell>
            </TR>
          ))}
          {events.length === 0 ? (
            <EmptyRow span={3} text="No webhook traffic recorded." />
          ) : null}
        </Table>
      </AdminSection>

      {/* ---------- 05 / Squad reports ---------- */}
      <AdminSection
        kicker="05"
        title="Squad reports"
        subtitle="Moderation queue"
        description="Empty until Phase 3 ships the reports + mod_actions tables."
      >
        <div className="border border-dashed border-white/[0.08] bg-ink-900/30 px-6 py-10 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-200/60">
            Mod queue arrives with Phase 3
          </p>
          <p className="mx-auto mt-3 max-w-[40ch] text-[13px] leading-relaxed text-ink-200/70">
            When chat goes live and reports start flowing, the queue lands here.
            Nothing to triage yet.
          </p>
        </div>
      </AdminSection>

      {/* ---------- 06 / Admin actions log ---------- */}
      <AdminSection
        kicker="06"
        title="Admin actions log"
        subtitle="Last twenty admin writes"
        description="Tamper-evident — service role writes only. Suspensions, deletes, refunds, seat grants. The audit trail you'd want at 3am."
      >
        <Table head={["Action", "Admin", "Target", "When"]}>
          {adminActions.map((a, i) => (
            <TR key={a.id} striped={i % 2 === 1}>
              <Cell>
                <ActionChip action={a.action} />
              </Cell>
              <Cell mono>{a.adminEmail}</Cell>
              <Cell mono>{a.targetEmail ?? "—"}</Cell>
              <Cell mono>{fmtRelative(a.createdAtIso)}</Cell>
            </TR>
          ))}
          {adminActions.length === 0 ? (
            <EmptyRow span={4} text="No admin actions yet." />
          ) : null}
        </Table>
      </AdminSection>
    </AdminShell>
  );
}

/**
 * Admin-action chip — color-keyed by destructive vs constructive.
 * Suspensions and deletions read in amber/red so the log scans visually.
 */
function ActionChip({ action }: { action: string }) {
  const ACTION_LABEL: Record<string, string> = {
    user_suspended: "Suspended",
    user_unsuspended: "Unsuspended",
    user_deleted: "Deleted",
    user_updated: "Updated",
    password_reset_sent: "Reset sent",
    founder_seat_granted: "Seat granted",
    founder_seat_revoked: "Seat revoked",
    refund_issued: "Refund",
    admin_promoted: "Promoted",
    admin_demoted: "Demoted",
  };
  const TONE_MAP: Record<string, { dot: string; text: string }> = {
    user_suspended: { dot: "bg-amber-400", text: "text-amber-200" },
    user_deleted: { dot: "bg-red-400", text: "text-red-300" },
    founder_seat_revoked: { dot: "bg-red-400", text: "text-red-300" },
    refund_issued: { dot: "bg-red-400", text: "text-red-300" },
    founder_seat_granted: { dot: "bg-ember-400", text: "text-ember-400" },
    user_unsuspended: { dot: "bg-bone/80", text: "text-bone" },
    user_updated: { dot: "bg-bone/70", text: "text-bone/85" },
    password_reset_sent: { dot: "bg-bone/60", text: "text-bone/75" },
  };
  const cfg = TONE_MAP[action] ?? {
    dot: "bg-ink-300/40",
    text: "text-ink-300/70",
  };
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em]">
      <span
        aria-hidden
        className={`inline-block h-2 w-2 rounded-full ${cfg.dot}`}
      />
      <span className={cfg.text}>{ACTION_LABEL[action] ?? action}</span>
    </span>
  );
}

// ============================================================
// Presentational primitives (server, no client JS)
// ============================================================

/**
 * Section frame for the admin page. Bigger, louder kicker than the
 * customer-facing <Section/>: 2px ember rail on the left, oversized
 * mono section number, then the title. Built specifically to anchor
 * scanning on a data-dense page.
 */
function AdminSection({
  kicker,
  title,
  subtitle,
  description,
  children,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative pl-5 md:pl-6">
      <span
        aria-hidden
        className="absolute left-0 top-1 h-[calc(100%-4px)] w-[2px] bg-ember-400/70"
      />
      <header className="mb-5 flex flex-col gap-1.5">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[32px] font-extrabold leading-none tracking-tight text-ember-400 md:text-[40px]">
            {kicker}
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-ink-200/55">
            / {subtitle ?? title}
          </span>
        </div>
        <h2 className="text-balance text-[26px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[32px]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-[60ch] text-[13px] leading-relaxed text-ink-200/75">
            {description}
          </p>
        ) : null}
      </header>
      <div>{children}</div>
    </section>
  );
}

/**
 * Display tile for vitals. Big number, mono label, optional sub-line
 * and a tiny progress rail when `ratio` is provided. `ember` tone tints
 * the headline number ember; `bone` keeps it bone.
 */
function BigTile({
  label,
  value,
  sub,
  tone = "bone",
  ratio,
  ratioEmber = false,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "bone" | "ember";
  ratio?: number;
  ratioEmber?: boolean;
}) {
  const clamped = ratio != null ? Math.max(0, Math.min(1, ratio)) : null;
  return (
    <div className="relative border border-white/[0.06] bg-ink-900/40 px-4 py-4">
      {tone === "ember" ? (
        <span
          aria-hidden
          className="absolute left-0 top-0 h-full w-[2px] bg-ember-400/60"
        />
      ) : null}
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/65">
        {label}
      </div>
      <div
        className={`mt-2 font-extrabold leading-none tracking-tight tabular-nums ${
          tone === "ember" ? "text-ember-400" : "text-bone"
        } text-[40px] md:text-[44px]`}
      >
        {value}
      </div>
      {sub ? (
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/55">
          {sub}
        </div>
      ) : null}
      {clamped != null ? (
        <div className="mt-3 h-[3px] w-full overflow-hidden bg-white/[0.06]">
          <div
            className={`h-full ${
              ratioEmber ? "bg-ember-400" : "bg-bone/70"
            }`}
            style={{ width: `${clamped * 100}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Status chip — colored dot + uppercase mono label. Color carries
 * the semantic (good/warn/dead/money-out) without an accessibility
 * regression: the label is always present in text.
 */
function StatusChip({ status }: { status: string }) {
  const map: Record<
    string,
    { dot: string; text: string; ring?: boolean }
  > = {
    active: { dot: "bg-ember-400", text: "text-bone", ring: true },
    trialing: { dot: "bg-bone/80", text: "text-bone" },
    past_due: { dot: "bg-amber-400", text: "text-amber-200" },
    unpaid: { dot: "bg-amber-400", text: "text-amber-200" },
    incomplete: { dot: "bg-amber-400", text: "text-amber-200" },
    incomplete_expired: { dot: "bg-amber-400", text: "text-amber-200" },
    canceled: { dot: "bg-ink-300/50", text: "text-ink-300/60" },
    refunded: { dot: "bg-red-400", text: "text-red-300" },
  };
  const cfg = map[status] ?? {
    dot: "bg-ink-300/40",
    text: "text-ink-300/70",
  };
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em]">
      <span className="relative flex h-2 w-2 items-center justify-center">
        {cfg.ring ? (
          <span
            aria-hidden
            className="absolute inline-flex h-full w-full rounded-full bg-ember-400/50 pulse-ring"
          />
        ) : null}
        <span
          aria-hidden
          className={`relative inline-block h-2 w-2 rounded-full ${cfg.dot}`}
        />
      </span>
      <span className={cfg.text}>{status}</span>
    </span>
  );
}

/**
 * Plan chip — same shape as StatusChip but tone keyed to plan tier.
 * Founder lights up ember, Operator stays bone, free stays dim.
 */
function PlanChip({ plan }: { plan: string }) {
  const label = PLAN_LABEL[plan] ?? plan;
  let tone = "text-ink-300/60";
  let dot = "bg-ink-300/40";
  if (plan === "founder") {
    tone = "text-ember-400";
    dot = "bg-ember-400";
  } else if (plan === "operator-monthly" || plan === "operator-annual") {
    tone = "text-bone";
    dot = "bg-bone/80";
  }
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em]">
      <span
        aria-hidden
        className={`inline-block h-2 w-2 rounded-full ${dot}`}
      />
      <span className={tone}>{label}</span>
    </span>
  );
}

/**
 * Webhook event type chip — color carries the meaning at a glance.
 * Money-in events get ember, money-out gets red, lifecycle stays
 * bone-tone, failures get amber.
 */
function EventTypeChip({ type }: { type: string }) {
  let tone = "text-bone/85";
  let dot = "bg-bone/70";
  if (type === "checkout.session.completed") {
    tone = "text-ember-400";
    dot = "bg-ember-400";
  } else if (type === "customer.subscription.created") {
    tone = "text-bone";
    dot = "bg-bone";
  } else if (type === "customer.subscription.updated") {
    tone = "text-bone/70";
    dot = "bg-bone/60";
  } else if (type === "customer.subscription.deleted") {
    tone = "text-ink-300/70";
    dot = "bg-ink-300/55";
  } else if (type === "charge.refunded") {
    tone = "text-red-300";
    dot = "bg-red-400";
  } else if (
    type === "invoice.payment_failed" ||
    type === "invoice.payment_action_required"
  ) {
    tone = "text-amber-200";
    dot = "bg-amber-400";
  }
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em]">
      <span
        aria-hidden
        className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`}
      />
      <span className={tone}>{type}</span>
    </span>
  );
}

/**
 * Table primitives. Sticky header, mono-uppercase headings, rows are
 * striped via <TR striped/>. Horizontal scroll preserved for narrow
 * viewports.
 */
function Table({
  head,
  children,
}: {
  head: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto border border-white/[0.06] bg-ink-900/30">
      <table className="w-full min-w-[640px] text-left">
        <thead className="sticky top-0 z-10 bg-ink-900/95 backdrop-blur">
          <tr className="border-b border-white/[0.08]">
            {head.map((h) => (
              <th
                key={h}
                className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/70"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function TR({
  children,
  striped = false,
  extraClass = "",
}: {
  children: React.ReactNode;
  striped?: boolean;
  extraClass?: string;
}) {
  return (
    <tr
      className={`border-t border-white/[0.04] transition-colors hover:bg-ember-400/[0.03] ${
        striped ? "bg-ink-900/40" : "bg-transparent"
      } ${extraClass}`}
    >
      {children}
    </tr>
  );
}

function Cell({
  children,
  mono = false,
}: {
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <td
      className={`px-3 py-2.5 align-middle ${
        mono
          ? "font-mono text-[11px] uppercase tracking-[0.16em] tabular-nums text-ink-200/80"
          : "text-[13px] text-bone/90"
      }`}
    >
      {children}
    </td>
  );
}

function EmptyRow({ span, text }: { span: number; text: string }) {
  return (
    <tr>
      <td
        colSpan={span}
        className="px-3 py-6 text-center text-[13px] text-ink-300/60"
      >
        {text}
      </td>
    </tr>
  );
}

// ============================================================
// Founder seat grid — recency heatmap
// ============================================================

/**
 * 500-cell grid laid out 25 wide × 20 tall. Server-rendered.
 *
 * Buckets by claim age:
 *   - unclaimed             → bone/15 outline
 *   - within 24h            → ember-300 + glow (brightest, NEW)
 *   - within 7 days         → ember-500 solid + pulse
 *   - within 30 days        → ember-400/70
 *   - older than 30 days    → ember-400/30 (faded, historical)
 *
 * Title attribute carries seat number, claimant, and relative claim age
 * so hovering reveals identity without a tooltip library.
 */
function FounderSeatGrid({ seats }: { seats: FounderSeat[] }) {
  const byNumber = new Map<number, FounderSeat>();
  for (const s of seats) byNumber.set(s.seatNumber, s);

  const cells: FounderSeat[] = [];
  for (let i = 1; i <= 500; i++) {
    cells.push(
      byNumber.get(i) ?? { seatNumber: i, email: null, claimedAtIso: null },
    );
  }

  const now = Date.now();

  return (
    <div
      className="grid gap-[3px] border border-white/[0.05] bg-ink-900/30 p-3"
      style={{ gridTemplateColumns: "repeat(25, minmax(0, 1fr))" }}
    >
      {cells.map((s) => {
        const claimed = s.email !== null;
        const ageMs = s.claimedAtIso
          ? now - Date.parse(s.claimedAtIso)
          : Infinity;

        let cls = "border border-white/15 bg-transparent hover:border-white/35";
        let title = `Seat ${String(s.seatNumber).padStart(3, "0")} · open`;
        if (claimed) {
          let bucket = "older";
          if (ageMs < 1 * DAY_MS) bucket = "24h";
          else if (ageMs < 7 * DAY_MS) bucket = "7d";
          else if (ageMs < 30 * DAY_MS) bucket = "30d";

          if (bucket === "24h") {
            cls =
              "bg-ember-300 shadow-[0_0_10px_rgba(244,149,85,0.55)] hover:bg-ember-200";
          } else if (bucket === "7d") {
            cls = "bg-ember-500 hover:bg-ember-400";
          } else if (bucket === "30d") {
            cls = "bg-ember-400/70 hover:bg-ember-400";
          } else {
            cls = "bg-ember-400/30 hover:bg-ember-400/60";
          }
          const rel = s.claimedAtIso ? fmtRelative(s.claimedAtIso) : "—";
          title = `Seat ${String(s.seatNumber).padStart(3, "0")} · ${s.email} · ${rel}`;
        }
        return (
          <div
            key={s.seatNumber}
            title={title}
            aria-label={title}
            className={`aspect-square ${cls}`}
          />
        );
      })}
    </div>
  );
}

function FounderLegend() {
  const items: Array<{ swatch: string; label: string }> = [
    { swatch: "border border-white/15 bg-transparent", label: "Open" },
    { swatch: "bg-ember-400/30", label: "Claimed · 30d+" },
    { swatch: "bg-ember-400/70", label: "Claimed · this month" },
    { swatch: "bg-ember-500", label: "Claimed · this week" },
    {
      swatch: "bg-ember-300 shadow-[0_0_8px_rgba(244,149,85,0.55)]",
      label: "Claimed · last 24h",
    },
  ];
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
      {items.map((it) => (
        <span
          key={it.label}
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-200/65"
        >
          <span
            aria-hidden
            className={`inline-block h-3 w-3 ${it.swatch}`}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}
