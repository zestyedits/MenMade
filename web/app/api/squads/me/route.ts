import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";

/**
 * GET /api/squads/me
 *
 * Returns the authenticated user's active squad memberships, with a
 * last-message timestamp per squad for the chat left-rail sort.
 *
 *   [{ handle, name, callsign, role, kind, lastMessageAt }, ...]
 */

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
  const { data: memberships, error } = await admin
    .from("squad_members")
    .select(
      "role, squad:squads (id, handle, name, kind, blurb, cycle_code, cycle_day, total_days)",
    )
    .eq("user_id", user.id)
    .is("left_at", null);

  if (error) {
    console.error("[squads/me] query failed:", error);
    return NextResponse.json(
      { ok: false, error: "Couldn't load squads." },
      { status: 502 },
    );
  }

  type Row = {
    role: string;
    squad: {
      id: string;
      handle: string;
      name: string;
      kind: string;
      blurb: string | null;
      cycle_code: string | null;
      cycle_day: number;
      total_days: number | null;
    } | null;
  };

  const rows = (memberships ?? []) as unknown as Row[];

  const squadIds = rows
    .map((r) => r.squad?.id)
    .filter((id): id is string => typeof id === "string");

  // Per-squad bounded lookup. The earlier version pulled the full
  // (squad_id, sent_at) list and dedup'd in Node — fine at 5 messages,
  // catastrophic at 50k. One LIMIT-1 query per squad is paginatable and
  // touches the messages_squad_sent_idx index directly.
  const lastMessageBySquad = new Map<string, string>();
  await Promise.all(
    squadIds.map(async (id) => {
      const { data: last } = await admin
        .from("messages")
        .select("sent_at")
        .eq("squad_id", id)
        .order("sent_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (last?.sent_at) lastMessageBySquad.set(id, last.sent_at);
    }),
  );

  const squads = rows
    .filter((r) => r.squad !== null)
    .map((r) => {
      const s = r.squad!;
      return {
        id: s.id,
        handle: s.handle,
        name: s.name,
        callsign: s.handle.toUpperCase(),
        kind: s.kind,
        blurb: s.blurb,
        cycleCode: s.cycle_code,
        cycleDay: s.cycle_day,
        totalDays: s.total_days,
        role: r.role,
        lastMessageAt: lastMessageBySquad.get(s.id) ?? null,
      };
    });

  return NextResponse.json({ ok: true, squads });
}
