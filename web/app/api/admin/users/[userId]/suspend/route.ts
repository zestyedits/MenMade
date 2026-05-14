import type { NextRequest } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "../../../../../lib/supabase/admin";
import { recordAdminAction } from "../../../../../lib/admin-audit";
import { suspensionNoticeEmail } from "../../../../../lib/emails/suspension-notice";
import { adminGate, extractUserId, json } from "../../_shared";

/**
 * POST /api/admin/users/[userId]/suspend
 *
 * Body: { reason: string }   (1..500 chars)
 *
 * Marks the target user as suspended by setting profiles.suspended_at and
 * profiles.suspension_reason. The next time the user tries to sign in,
 * web/app/lib/auth.ts → signInWithPassword reads these columns and
 * immediately signs them back out with the reason in the error string.
 *
 * Active sessions: NOT killed here. We could call admin.auth.admin.signOut
 * to nuke their cookies but that doesn't invalidate the JWT itself, so it's
 * security theater. Phase 4 will add per-request suspension check in
 * proxy.ts; until then we rely on the sign-in block to keep the suspended
 * user from re-entering.
 *
 * Audit: writes admin_actions(action='user_suspended', metadata.reason).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REASON = 500;
const MAX_DURATION_HOURS = 24 * 365; // one year — sanity bound

const CONTACT_FROM =
  process.env.CONTACT_FROM ?? "MenMade <contact@menmade.app>";
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ userId: string }> },
) {
  const gate = await adminGate(request, "admin-suspend");
  if (gate instanceof Response) return gate;
  const { admin } = gate;

  const userIdOrErr = await extractUserId(ctx);
  if (userIdOrErr instanceof Response) return userIdOrErr;
  const userId = userIdOrErr;

  let body: {
    reason?: unknown;
    /** Optional duration in hours from now. Omit for indefinite. */
    durationHours?: unknown;
    /** Optional override: notify user via email. Defaults to true. */
    notify?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (reason.length < 1 || reason.length > MAX_REASON) {
    return json(
      { ok: false, error: "Reason is required (1–500 characters)." },
      400,
    );
  }

  // Optional duration. Null = indefinite. Bounded 1h..1yr.
  let suspendedUntilIso: string | null = null;
  if (body.durationHours != null) {
    const hours = Number(body.durationHours);
    if (!Number.isFinite(hours) || hours < 1 || hours > MAX_DURATION_HOURS) {
      return json(
        {
          ok: false,
          error: `Duration must be between 1 and ${MAX_DURATION_HOURS} hours.`,
        },
        400,
      );
    }
    suspendedUntilIso = new Date(
      Date.now() + hours * 60 * 60 * 1000,
    ).toISOString();
  }

  const shouldNotify = body.notify === false ? false : true;

  if (userId === admin.userId) {
    return json({ ok: false, error: "Can't suspend yourself." }, 400);
  }

  const db = createAdminClient();

  // Capture email for the audit trail + notification before any writes.
  const { data: userData } = await db.auth.admin.getUserById(userId);
  const targetEmail = userData.user?.email ?? null;
  if (!userData.user) {
    return json({ ok: false, error: "User not found." }, 404);
  }

  const nowIso = new Date().toISOString();
  const { error } = await db
    .from("profiles")
    .update({
      suspended_at: nowIso,
      suspension_reason: reason,
      suspended_until: suspendedUntilIso,
    })
    .eq("user_id", userId);

  if (error) {
    console.error("[admin/users/suspend] update failed:", error);
    return json(
      { ok: false, error: "Couldn't write the suspension." },
      500,
    );
  }

  // Email the user — non-fatal if it fails (suspension is already in the
  // DB; we'll surface a warning so the admin knows to follow up manually).
  let notifyWarning: string | null = null;
  if (shouldNotify && targetEmail) {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://menmade.app";
    const { subject, html, text } = suspensionNoticeEmail({
      reason,
      suspendedUntilIso,
      appUrl,
    });

    if (!RESEND_API_KEY) {
      console.warn(
        "[admin/users/suspend] RESEND_API_KEY not set — suspension email skipped.",
      );
      notifyWarning = "Suspension applied. Email skipped (Resend not configured in dev).";
    } else {
      try {
        const resend = new Resend(RESEND_API_KEY);
        const result = await resend.emails.send({
          from: CONTACT_FROM,
          to: targetEmail,
          subject,
          text,
          html,
        });
        if (result.error) {
          console.error(
            "[admin/users/suspend] Resend rejected:",
            result.error,
          );
          notifyWarning =
            "Suspension applied. Email failed to deliver — follow up manually.";
        } else {
          await db
            .from("profiles")
            .update({ suspension_notified_at: nowIso })
            .eq("user_id", userId);
        }
      } catch (err) {
        console.error("[admin/users/suspend] Resend threw:", err);
        notifyWarning =
          "Suspension applied. Email failed to deliver — follow up manually.";
      }
    }
  }

  await recordAdminAction(db, {
    adminUserId: admin.userId,
    action: "user_suspended",
    targetUserId: userId,
    targetEmail,
    metadata: {
      reason,
      at: nowIso,
      until: suspendedUntilIso,
      notified: shouldNotify && !notifyWarning,
    },
  });

  return json({ ok: true, warning: notifyWarning });
}
