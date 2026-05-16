import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";

/**
 * GET /api/squads/members?squad=<handle>
 *
 * Roster lookup. The caller must be an active member of the target squad —
 * we verify with a service-role join so RLS doesn't leak the existence of
 * private squads to non-members.
 *
 *   [{ userId, handle, displayName, role, joinedAt }, ...]
 */

export async function GET(request: NextRequest) {
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

  const handle = request.nextUrl.searchParams.get("squad");
  if (!handle) {
    return NextResponse.json(
      { ok: false, error: "Missing squad handle." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: squad } = await admin
    .from("squads")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();

  if (!squad) {
    return NextResponse.json(
      { ok: false, error: "Squad not found." },
      { status: 404 },
    );
  }

  const { data: ownMembership } = await admin
    .from("squad_members")
    .select("user_id")
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

  // squad_members.user_id FKs to auth.users; profiles.user_id also FKs to
  // auth.users — there's no direct FK between the two so PostgREST can't
  // auto-join. Two queries + manual join is cheaper than adding a FK that
  // mirrors information we already have.
  const { data: members, error } = await admin
    .from("squad_members")
    .select("user_id, role, joined_at")
    .eq("squad_id", squad.id)
    .is("left_at", null)
    .order("joined_at", { ascending: true });

  if (error) {
    console.error("[squads/members] members query failed code=", error.code);
    return NextResponse.json(
      { ok: false, error: "Couldn't load roster." },
      { status: 502 },
    );
  }

  const memberRows = members ?? [];
  const userIds = memberRows.map((m) => m.user_id);
  const profilesByUserId = new Map<string, { handle: string; display_name: string }>();
  if (userIds.length > 0) {
    const { data: profiles, error: profErr } = await admin
      .from("profiles")
      .select("user_id, handle, display_name")
      .in("user_id", userIds);
    if (profErr) {
      console.error("[squads/members] profiles query failed code=", profErr.code);
      return NextResponse.json(
        { ok: false, error: "Couldn't load roster." },
        { status: 502 },
      );
    }
    for (const p of profiles ?? []) {
      profilesByUserId.set(p.user_id, { handle: p.handle, display_name: p.display_name });
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
        role: m.role,
        joinedAt: m.joined_at,
      };
    })
    .filter(<T,>(v: T | null): v is T => v !== null);

  return NextResponse.json({ ok: true, members: roster });
}
