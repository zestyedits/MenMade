import type { NextRequest } from "next/server";
import { createAdminClient } from "../../../../../lib/supabase/admin";
import { recordAdminAction } from "../../../../../lib/admin-audit";
import { adminGate, extractUserId, json } from "../../_shared";

/**
 * POST /api/admin/users/[userId]/unsuspend
 *
 * Clears profiles.suspended_at and profiles.suspension_reason. Idempotent —
 * unsuspending an already-active user is a no-op.
 *
 * Audit: writes admin_actions(action='user_unsuspended', metadata.priorReason).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ userId: string }> },
) {
  const gate = await adminGate(request, "admin-unsuspend");
  if (gate instanceof Response) return gate;
  const { admin } = gate;

  const userIdOrErr = await extractUserId(ctx);
  if (userIdOrErr instanceof Response) return userIdOrErr;
  const userId = userIdOrErr;

  const db = createAdminClient();

  const [{ data: userData }, { data: prior }] = await Promise.all([
    db.auth.admin.getUserById(userId),
    db
      .from("profiles")
      .select("suspension_reason,suspended_at")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  const targetEmail = userData.user?.email ?? null;
  if (!userData.user) {
    return json({ ok: false, error: "User not found." }, 404);
  }

  const { error } = await db
    .from("profiles")
    .update({
      suspended_at: null,
      suspension_reason: null,
    })
    .eq("user_id", userId);

  if (error) {
    console.error("[admin/users/unsuspend] update failed:", error);
    return json({ ok: false, error: "Couldn't lift the suspension." }, 500);
  }

  await recordAdminAction(db, {
    adminUserId: admin.userId,
    action: "user_unsuspended",
    targetUserId: userId,
    targetEmail,
    metadata: {
      priorReason: prior?.suspension_reason ?? null,
      priorSuspendedAt: prior?.suspended_at ?? null,
    },
  });

  return json({ ok: true });
}
