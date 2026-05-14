import type { NextRequest } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "../../../../../lib/supabase/admin";
import { recordAdminAction } from "../../../../../lib/admin-audit";
import { passwordResetEmail } from "../../../../../lib/emails/password-reset";
import { adminGate, extractUserId, json } from "../../_shared";

/**
 * POST /api/admin/users/[userId]/reset-password
 *
 * Generates a Supabase recovery link (type='recovery') and emails it to
 * the user via Resend. Uses the same Resend + CONTACT_FROM identity the
 * /api/contact route uses to keep the sender domain consistent.
 *
 * Dev fallback (no RESEND_API_KEY): logs the recovery link to the server
 * console so the admin can copy it manually.
 *
 * Audit: writes admin_actions(action='password_reset_sent').
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTACT_FROM =
  process.env.CONTACT_FROM ?? "MenMade <contact@menmade.app>";
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ userId: string }> },
) {
  const gate = await adminGate(request, "admin-reset-password");
  if (gate instanceof Response) return gate;
  const { admin } = gate;

  const userIdOrErr = await extractUserId(ctx);
  if (userIdOrErr instanceof Response) return userIdOrErr;
  const userId = userIdOrErr;

  const db = createAdminClient();

  const { data: userData } = await db.auth.admin.getUserById(userId);
  if (!userData.user?.email) {
    return json(
      { ok: false, error: "User has no email on file." },
      404,
    );
  }
  const targetEmail = userData.user.email;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://menmade.app";
  const redirectTo = `${appUrl}/auth/reset-password`;

  const { data: linkData, error: linkErr } =
    await db.auth.admin.generateLink({
      type: "recovery",
      email: targetEmail,
      options: { redirectTo },
    });

  if (linkErr || !linkData) {
    console.error(
      "[admin/users/reset-password] generateLink failed:",
      linkErr,
    );
    return json(
      { ok: false, error: "Couldn't generate a recovery link." },
      500,
    );
  }

  const recoveryUrl = linkData.properties?.action_link ?? null;
  if (!recoveryUrl) {
    return json(
      { ok: false, error: "No recovery link returned by Supabase." },
      500,
    );
  }

  // Dev fallback — log to console so the admin can copy the link.
  if (!RESEND_API_KEY) {
    console.warn(
      "[admin/users/reset-password] RESEND_API_KEY not set — link below.",
    );
    console.log(
      "[admin/users/reset-password] recovery link for %s: %s",
      targetEmail,
      recoveryUrl,
    );
    await recordAdminAction(db, {
      adminUserId: admin.userId,
      action: "password_reset_sent",
      targetUserId: userId,
      targetEmail,
      metadata: { mode: "dev-log" },
    });
    return json({ ok: true, mode: "dev-log" });
  }

  // Real send via Resend — use the branded MenMade template.
  const { subject, html, text } = passwordResetEmail({ recoveryUrl });
  const resend = new Resend(RESEND_API_KEY);
  try {
    const result = await resend.emails.send({
      from: CONTACT_FROM,
      to: targetEmail,
      subject,
      text,
      html,
    });

    if (result.error) {
      console.error(
        "[admin/users/reset-password] Resend rejected:",
        result.error,
      );
      return json(
        { ok: false, error: "Couldn't deliver the reset email." },
        502,
      );
    }
  } catch (err) {
    console.error("[admin/users/reset-password] Resend threw:", err);
    return json(
      { ok: false, error: "Couldn't deliver the reset email." },
      502,
    );
  }

  await recordAdminAction(db, {
    adminUserId: admin.userId,
    action: "password_reset_sent",
    targetUserId: userId,
    targetEmail,
    metadata: { mode: "email" },
  });

  return json({ ok: true });
}
