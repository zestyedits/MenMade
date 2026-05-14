import type { NextRequest } from "next/server";
import { createAdminClient } from "../../../../../lib/supabase/admin";
import {
  recordAdminAction,
  recordConcernSignal,
} from "../../../../../lib/admin-audit";
import { adminGate, extractUserId, json } from "../../_shared";

/**
 * POST /api/admin/users/[userId]/delete
 *
 * Admin-initiated account deletion. Calls supabase.auth.admin.deleteUser
 * which CASCADES through every user-owned table per the ON DELETE CASCADE
 * foreign keys defined in migration 0001.
 *
 * Capture target_email BEFORE the delete — once the auth.users row is
 * gone the email is too. The audit row stays; target_user_id flips to
 * null via ON DELETE SET NULL, but target_email survives.
 *
 * Also drops a concern_signal (kind=account_deleted, low) so Buddy can
 * surface "operator XYZ removed by admin" alongside self-serve deletions.
 *
 * Audit: writes admin_actions(action='user_deleted').
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ userId: string }> },
) {
  const gate = await adminGate(request, "admin-delete-user");
  if (gate instanceof Response) return gate;
  const { admin } = gate;

  const userIdOrErr = await extractUserId(ctx);
  if (userIdOrErr instanceof Response) return userIdOrErr;
  const userId = userIdOrErr;

  if (userId === admin.userId) {
    return json(
      { ok: false, error: "Can't delete yourself. Edit ADMIN_EMAILS first." },
      400,
    );
  }

  const db = createAdminClient();

  // Capture identity for the audit trail before deletion.
  const { data: userData } = await db.auth.admin.getUserById(userId);
  if (!userData.user) {
    return json({ ok: false, error: "User not found." }, 404);
  }
  const targetEmail = userData.user.email ?? null;

  const { error: deleteError } = await db.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error("[admin/users/delete] deleteUser failed:", deleteError);
    return json(
      { ok: false, error: "Couldn't complete deletion." },
      500,
    );
  }

  // Write audit + signal AFTER the delete so we don't log work that didn't
  // happen. target_user_id will already be NULL because the FK cascaded.
  await recordAdminAction(db, {
    adminUserId: admin.userId,
    action: "user_deleted",
    targetUserId: null,
    targetEmail,
    metadata: { originalUserId: userId },
  });

  await recordConcernSignal(db, {
    kind: "account_deleted",
    severity: "low",
    title: "Operator removed by admin",
    body: targetEmail
      ? `${targetEmail} deleted by ${admin.email}.`
      : `User ${userId} deleted by ${admin.email}.`,
    relatedUserId: null,
    relatedEmail: targetEmail,
    metadata: { byAdmin: true, originalUserId: userId },
  });

  return json({ ok: true });
}
