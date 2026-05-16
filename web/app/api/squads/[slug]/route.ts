import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";

/**
 * GET /api/squads/[slug]
 *
 * Single-squad lookup gated on membership. Returns the squad row + the
 * caller's role + the full roster (joined to profiles). The detail page
 * adapter converts this shape into the `Squad` type the existing tab
 * components were built around.
 *
 *   404 → no such squad
 *   403 → caller isn't a member (deliberate; same shape as members route
 *         to avoid leaking the squad's existence to non-members)
 */

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;

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
  const { data: squad } = await admin
    .from("squads")
    .select(
      "id, handle, name, kind, blurb, focus, intensity, tz_band, cycle_code, cycle_day, total_days, created_at",
    )
    .eq("handle", slug)
    .maybeSingle();

  if (!squad) {
    return NextResponse.json(
      { ok: false, error: "Squad not found." },
      { status: 404 },
    );
  }

  const { data: ownMembership } = await admin
    .from("squad_members")
    .select("role")
    .eq("squad_id", squad.id)
    .eq("user_id", user.id)
    .is("left_at", null)
    .maybeSingle();

  if (!ownMembership) {
    return NextResponse.json(
      { ok: false, error: "Not a member." },
      { status: 403 },
    );
  }

  const { data: members, error: membersErr } = await admin
    .from("squad_members")
    .select("user_id, role, joined_at")
    .eq("squad_id", squad.id)
    .is("left_at", null)
    .order("joined_at", { ascending: true });

  if (membersErr) {
    console.error("[squads/[slug]] members query failed code=", membersErr.code);
    return NextResponse.json(
      { ok: false, error: "Couldn't load squad." },
      { status: 502 },
    );
  }

  const memberRows = members ?? [];
  const userIds = memberRows.map((m) => m.user_id);
  const profilesByUserId = new Map<
    string,
    { handle: string; display_name: string }
  >();
  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("user_id, handle, display_name")
      .in("user_id", userIds);
    for (const p of profiles ?? []) {
      profilesByUserId.set(p.user_id, {
        handle: p.handle,
        display_name: p.display_name,
      });
    }
  }

  const roster = memberRows
    .map((m) => {
      const p = profilesByUserId.get(m.user_id);
      if (!p) return null;
      return {
        userId: m.user_id,
        handle: p.handle,
        displayName: p.display_name,
        role: m.role as "member" | "lead" | "founder",
        joinedAt: m.joined_at,
        isYou: m.user_id === user.id,
      };
    })
    .filter(<T,>(v: T | null): v is T => v !== null);

  return NextResponse.json({
    ok: true,
    squad: {
      id: squad.id,
      handle: squad.handle,
      callsign: squad.handle.toUpperCase(),
      name: squad.name,
      kind: squad.kind,
      blurb: squad.blurb,
      focus: squad.focus,
      intensity: squad.intensity,
      tzBand: squad.tz_band,
      cycleCode: squad.cycle_code,
      cycleDay: squad.cycle_day,
      totalDays: squad.total_days,
      createdAt: squad.created_at,
    },
    role: ownMembership.role,
    members: roster,
  });
}
