import { renderEmail } from "./shared";

/**
 * Sent when an admin suspends a user via /api/admin/users/[userId]/suspend.
 *
 * Tone: dry, restrained, no apology, no lecture. The user is told what
 * happened and what to do. The admin's `reason` text is rendered as-is —
 * admins must phrase it for direct user consumption (see project_admin
 * memory for the policy on this field's intended audience).
 *
 * `suspendedUntilIso`: when not null, the email shows a specific lift
 * date; when null, the suspension is "indefinite until resolved" and
 * the user is pointed at /contact to escalate.
 */
export function suspensionNoticeEmail({
  reason,
  suspendedUntilIso,
  appUrl,
}: {
  reason: string;
  suspendedUntilIso: string | null;
  appUrl: string;
}): { subject: string; html: string; text: string } {
  const safeReason = escapeHtml(reason).trim() || "No reason on file.";

  // Format the lift date for human eyes — keep it short.
  let durationLine: string;
  if (suspendedUntilIso) {
    const liftDate = new Date(suspendedUntilIso);
    const liftHuman = liftDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
    durationLine = `Access returns automatically on <strong style="color:#ece7dc;">${liftHuman}</strong>.`;
  } else {
    durationLine =
      "Duration is open-ended. To request a review, send a brief through the contact form below.";
  }

  const rendered = renderEmail({
    eyebrow: "Account restricted",
    category: "Restricted",
    headerTag: "Action required",
    preheader: "Your MenMade access is paused. Details below.",
    headline: "Account paused.",
    bodyHtml: `
      <p style="margin:0 0 14px 0;font-size:14.5px;line-height:1.6;color:#d6d3d1;">
        Your MenMade account has been suspended. You won&rsquo;t be able to
        sign in or interact with your squad until this is lifted.
      </p>
      <div style="margin:18px 0 0 0;padding:14px 16px;border-left:2px solid #ef7b35;background:rgba(239,123,53,0.06);">
        <p style="margin:0 0 6px 0;font-family:'SF Mono','Menlo','Consolas',monospace;font-size:10.5px;letter-spacing:0.22em;text-transform:uppercase;color:#ef7b35;">
          Reason
        </p>
        <p style="margin:0;font-size:14px;line-height:1.55;color:#ece7dc;">
          ${safeReason}
        </p>
      </div>
      <p style="margin:18px 0 0 0;font-size:13.5px;line-height:1.6;color:#a8a29e;">
        ${durationLine}
      </p>
    `,
    cta: { label: "Send a brief", href: `${appUrl}/contact` },
    footnote:
      "If you believe this is a mistake, the contact form above is the right place. We read every brief.",
  });

  return {
    subject: "Your MenMade account has been restricted",
    ...rendered,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
