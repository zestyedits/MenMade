import type { NextRequest } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { recordAdminAction } from "../../../../lib/admin-audit";
import { adminGate, extractUserId, json } from "../_shared";

/**
 * PATCH /api/admin/users/[userId]
 *
 * Body: { handle?, displayName?, email? }   (any subset, at least one)
 *
 * Updates profiles columns. If `email` changes, also flips the auth email
 * via supabase.auth.admin.updateUserById so the user can sign in with the
 * new address. Auth + profiles are not transactionally linked here — if
 * the auth flip fails after the profiles update succeeds, we'll have a
 * temporary drift that the admin can re-attempt. Acceptable for an
 * audited, manually-triggered action.
 *
 * Validation mirrors the constraints from migration 0001:
 *   handle:       ^[a-z0-9_-]{2,32}$  — unique
 *   displayName:  1..80
 *   email:        simple regex; Supabase will reject invalid addresses
 *
 * Audit: writes admin_actions(action='user_updated', metadata.diff).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HANDLE_RE = /^[a-z0-9_-]{2,32}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_DISPLAY = 80;

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ userId: string }> },
) {
  const gate = await adminGate(request, "admin-update-user");
  if (gate instanceof Response) return gate;
  const { admin } = gate;

  const userIdOrErr = await extractUserId(ctx);
  if (userIdOrErr instanceof Response) return userIdOrErr;
  const userId = userIdOrErr;

  let body: { handle?: unknown; displayName?: unknown; email?: unknown };
  try {
    body = (await request.json()) as {
      handle?: unknown;
      displayName?: unknown;
      email?: unknown;
    };
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const patch: { handle?: string; display_name?: string } = {};
  if (body.handle !== undefined) {
    if (typeof body.handle !== "string" || !HANDLE_RE.test(body.handle)) {
      return json(
        {
          ok: false,
          error:
            "Handle must be 2–32 chars, lowercase letters/digits/underscore/dash.",
        },
        400,
      );
    }
    patch.handle = body.handle;
  }
  if (body.displayName !== undefined) {
    if (
      typeof body.displayName !== "string" ||
      body.displayName.trim().length < 1 ||
      body.displayName.length > MAX_DISPLAY
    ) {
      return json(
        { ok: false, error: "Display name must be 1–80 characters." },
        400,
      );
    }
    patch.display_name = body.displayName.trim();
  }

  let newEmail: string | null = null;
  if (body.email !== undefined) {
    if (typeof body.email !== "string" || !EMAIL_RE.test(body.email)) {
      return json({ ok: false, error: "Invalid email." }, 400);
    }
    newEmail = body.email.toLowerCase();
  }

  if (Object.keys(patch).length === 0 && newEmail === null) {
    return json({ ok: false, error: "Nothing to update." }, 400);
  }

  const db = createAdminClient();

  // Capture before-state for the audit diff.
  const [{ data: userData }, { data: profile }] = await Promise.all([
    db.auth.admin.getUserById(userId),
    db
      .from("profiles")
      .select("handle,display_name")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  if (!userData.user) {
    return json({ ok: false, error: "User not found." }, 404);
  }
  const before = {
    handle: profile?.handle ?? null,
    displayName: profile?.display_name ?? null,
    email: userData.user.email ?? null,
  };

  // Profiles patch (if any).
  if (Object.keys(patch).length > 0) {
    const { error } = await db
      .from("profiles")
      .update(patch)
      .eq("user_id", userId);
    if (error) {
      // 23505 is a unique-violation on `handle`. Surface a friendlier message.
      if (error.code === "23505") {
        return json(
          { ok: false, error: "That handle is already taken." },
          409,
        );
      }
      console.error("[admin/users/PATCH] profile update failed:", error);
      return json({ ok: false, error: "Couldn't update profile." }, 500);
    }
  }

  // Email flip (if any). Done AFTER the profile update so a handle conflict
  // doesn't leave us with a renamed auth email and a stale handle.
  if (newEmail && newEmail !== before.email) {
    const { error } = await db.auth.admin.updateUserById(userId, {
      email: newEmail,
    });
    if (error) {
      console.error("[admin/users/PATCH] auth email update failed:", error);
      return json(
        { ok: false, error: error.message || "Couldn't update email." },
        500,
      );
    }
  }

  const after = {
    handle: patch.handle ?? before.handle,
    displayName: patch.display_name ?? before.displayName,
    email: newEmail ?? before.email,
  };

  await recordAdminAction(db, {
    adminUserId: admin.userId,
    action: "user_updated",
    targetUserId: userId,
    targetEmail: after.email,
    metadata: { before, after },
  });

  return json({ ok: true });
}
