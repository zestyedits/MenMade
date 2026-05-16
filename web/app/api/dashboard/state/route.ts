import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";

/**
 * GET /api/dashboard/state
 *
 * Hydrates everything the dashboard chrome reads:
 *   - cycle:          metadata for the user's current cycle (code, name,
 *                     day, totalDays, startedAt). May be null if the user
 *                     hasn't started a cycle yet (brand-new account).
 *   - streak:         consecutive-day check-in streak from `progress`.
 *   - weeklyCadence:  the last 14 days of state ("complete" | "missed" |
 *                     "today" | "future"), derived from field_log_entries.
 *   - activityEvents: recent chat messages from the user's squads,
 *                     rendered as squad-feed events. Empty list is fine —
 *                     the section's empty state handles it.
 *
 * Defaults that look intentional matter: a new user with no progress row
 * and no squad should see "Day 0", "Streak 0", and a clean empty squad
 * feed — never a fake name with a fake action.
 */

const CADENCE_WINDOW_DAYS = 14;
const ACTIVITY_LOOKBACK_HOURS = 48;
const ACTIVITY_LIMIT = 16;

type CycleState = {
  code: string;
  name: string;
  day: number;
  totalDays: number;
  startedAt: string;
} | null;

type CadenceDay = {
  date: string;
  state: "complete" | "missed" | "today" | "future";
};

type ActivityEvent = {
  id: string;
  name: string;
  action: string;
  timeAgo: string;
  highlight?: boolean;
};

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function timeAgo(fromIso: string, now: Date): string {
  const then = new Date(fromIso).getTime();
  const diffSec = Math.max(0, Math.floor((now.getTime() - then) / 1000));
  if (diffSec < 45) return "just now";
  if (diffSec < 90) return "1 min ago";
  const min = Math.floor(diffSec / 60);
  if (min < 55) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 22) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Sign in first." },
      { status: 401 },
    );
  }

  const admin = createAdminClient();
  const now = new Date();

  // ---------- Cycle + streak (progress + cycle_templates) ----------
  const { data: progress } = await admin
    .from("progress")
    .select(
      "current_cycle_code, current_cycle_day, current_cycle_started_at, streak, last_check_in",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  let cycle: CycleState = null;
  if (progress?.current_cycle_code) {
    const { data: tmpl } = await admin
      .from("cycle_templates")
      .select("code, name, total_days")
      .eq("code", progress.current_cycle_code)
      .maybeSingle();
    if (tmpl) {
      cycle = {
        code: tmpl.code,
        name: tmpl.name,
        day: progress.current_cycle_day ?? 0,
        totalDays: tmpl.total_days,
        startedAt:
          progress.current_cycle_started_at ?? new Date().toISOString(),
      };
    }
  }

  const streak = progress?.streak ?? 0;

  // ---------- Weekly cadence (last 14 days from field_log) ----------
  const since = new Date(now);
  since.setDate(since.getDate() - CADENCE_WINDOW_DAYS + 1);
  since.setHours(0, 0, 0, 0);

  const { data: entries } = await admin
    .from("field_log_entries")
    .select("logged_at")
    .eq("user_id", user.id)
    .gte("logged_at", since.toISOString());

  const completedDays = new Set<string>();
  for (const row of entries ?? []) {
    completedDays.add(isoDay(new Date(row.logged_at)));
  }
  const todayIso = isoDay(now);

  const weeklyCadence: CadenceDay[] = [];
  for (let offset = -(CADENCE_WINDOW_DAYS - 1); offset <= 0; offset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    const dayIso = isoDay(d);
    let state: CadenceDay["state"];
    if (dayIso === todayIso) {
      state = completedDays.has(dayIso) ? "complete" : "today";
    } else if (completedDays.has(dayIso)) {
      state = "complete";
    } else {
      state = "missed";
    }
    weeklyCadence.push({ date: dayIso, state });
  }

  // ---------- Squad activity (chat messages from member squads) ----------
  let activityEvents: ActivityEvent[] = [];
  let squadName: string | null = null;
  let squadSlug: string | null = null;

  const { data: memberships } = await admin
    .from("squad_members")
    .select("squad_id, squads(handle, name)")
    .eq("user_id", user.id)
    .is("left_at", null)
    .limit(8);

  type SquadJoin = {
    squad_id: string;
    squads: { handle: string; name: string } | null;
  };
  const myMemberships = (memberships ?? []) as unknown as SquadJoin[];

  if (myMemberships.length > 0) {
    squadName = myMemberships[0].squads?.name ?? null;
    squadSlug = myMemberships[0].squads?.handle ?? null;
    const squadIds = myMemberships.map((m) => m.squad_id);
    const cutoff = new Date(
      now.getTime() - ACTIVITY_LOOKBACK_HOURS * 3600 * 1000,
    ).toISOString();

    const { data: msgs } = await admin
      .from("messages")
      .select(
        "id, author_user_id, author_name, author_handle, body, sent_at, soft_flagged",
      )
      .in("squad_id", squadIds)
      .eq("hard_blocked", false)
      .gte("sent_at", cutoff)
      .order("sent_at", { ascending: false })
      .limit(ACTIVITY_LIMIT);

    activityEvents = (msgs ?? []).map((m) => {
      const isYou = m.author_user_id === user.id;
      const snippet =
        m.body.length > 80 ? m.body.slice(0, 78).trimEnd() + "…" : m.body;
      return {
        id: m.id,
        name: isYou ? "You" : (m.author_name || m.author_handle || "Operator"),
        action: `said: "${snippet}"`,
        timeAgo: timeAgo(m.sent_at, now),
      };
    });
  }

  return NextResponse.json({
    ok: true,
    cycle,
    streak,
    weeklyCadence,
    activityEvents,
    squadName,
    squadSlug,
  });
}
