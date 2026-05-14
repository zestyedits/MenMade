import { renderEmail } from "./shared";

/**
 * Admin-issued password reset email. The user receives this when an admin
 * triggers /api/admin/users/[userId]/reset-password — distinct from the
 * Supabase-dashboard-templated self-serve reset (which lives in
 * /supabase/email-templates/reset-password.html). Both should look the
 * same; this module is the source of truth for the admin path.
 */
export function passwordResetEmail({
  recoveryUrl,
}: {
  recoveryUrl: string;
}): { subject: string; html: string; text: string } {
  const rendered = renderEmail({
    eyebrow: "Reset password",
    category: "Recovery",
    headerTag: "Secure link",
    preheader: "A new password. One link. Then back to work.",
    headline: "Forgot it.\nHappens.",
    bodyHtml: `
      <p style="margin:0 0 14px 0;font-size:14.5px;line-height:1.6;color:#d6d3d1;">
        An admin issued a password reset for your MenMade account. Tap the
        button to set a new password. The link works once and expires in
        one hour.
      </p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#a8a29e;">
        Pick something a stranger can&rsquo;t guess. Pet names are not
        passwords.
      </p>
    `,
    cta: { label: "Set new password", href: recoveryUrl },
    footnote:
      "Didn&rsquo;t ask for this? Ignore it. Your current password still works.",
  });
  return {
    subject: "Reset your MenMade password",
    ...rendered,
  };
}
