/**
 * Shared chrome for server-rendered Resend emails. Centralizes the
 * MenMade dark wrapper, header bar, footer, and the CTA button so each
 * template stays focused on its specific copy + URL.
 *
 * Mirrors the design language of the Supabase-dashboard-pasted templates
 * in /supabase/email-templates/ — same palette, header chip, fallback
 * URL block. Don't drift from that visual style without updating both.
 */

const INK_950 = "#0c0a09";
const INK_900 = "#14110f";
const BONE = "#ece7dc";
const INK_200 = "#d6d3d1";
const INK_300 = "#a8a29e";
const INK_500 = "#57534e";
const EMBER_400 = "#ef7b35";

type Section = {
  /** Top-of-card eyebrow ("Confirm enlistment", "Reset password", etc.) */
  eyebrow: string;
  /** Right-aligned mono badge in the header bar */
  headerTag: string;
  /** Hidden inbox-preview text (first line shown in inbox list) */
  preheader: string;
  /** Big uppercase headline. Use \n for a line break. */
  headline: string;
  /** Body paragraphs (light HTML allowed — keep it minimal). */
  bodyHtml: string;
  /** Primary CTA. Pass `null` for emails that don't need one (e.g. suspension notice with no link). */
  cta: { label: string; href: string } | null;
  /** Small dimmed note below the rule. */
  footnote: string;
  /** Header label after "MenMade /" — e.g. "Enlist" / "Recovery" / "Restricted". */
  category: string;
};

export function renderEmail(s: Section): { html: string; text: string } {
  const ctaBlock = s.cta
    ? `
      <tr>
        <td style="padding:24px 28px 8px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td bgcolor="${EMBER_400}" style="background:${EMBER_400};">
                <a href="${s.cta.href}"
                   style="display:inline-block;padding:14px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13.5px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${INK_950};text-decoration:none;">
                  ${s.cta.label} &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:24px 28px 8px 28px;">
          <p style="margin:0 0 6px 0;font-family:'SF Mono','Menlo','Consolas',monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_500};">
            Or paste this URL into a browser
          </p>
          <p style="margin:0;font-size:12px;line-height:1.5;word-break:break-all;color:${INK_300};">
            <a href="${s.cta.href}" style="color:${BONE};text-decoration:underline;text-decoration-color:rgba(236,231,220,0.35);">
              ${s.cta.href}
            </a>
          </p>
        </td>
      </tr>
    `
    : "";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="color-scheme" content="dark light" />
    <meta name="supported-color-schemes" content="dark light" />
    <title>${s.eyebrow} — MenMade</title>
  </head>
  <body style="margin:0;padding:0;background:${INK_950};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${BONE};-webkit-font-smoothing:antialiased;">
    <div style="display:none;font-size:1px;color:${INK_950};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${s.preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${INK_950};">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:${INK_900};border:1px solid rgba(236,231,220,0.08);">
            <tr>
              <td style="padding:20px 28px;border-bottom:1px solid rgba(236,231,220,0.08);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="left">
                      <span style="font-family:'SF Mono','Menlo','Consolas',monospace;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${INK_300};">
                        Men<span style="color:${EMBER_400};">Made</span> &nbsp;/&nbsp; ${s.category}
                      </span>
                    </td>
                    <td align="right">
                      <span style="font-family:'SF Mono','Menlo','Consolas',monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_500};">
                        ${s.headerTag}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 28px 8px 28px;">
                <span style="display:inline-block;font-family:'SF Mono','Menlo','Consolas',monospace;font-size:10.5px;letter-spacing:0.28em;text-transform:uppercase;color:${EMBER_400};padding-bottom:14px;">
                  ▍ ${s.eyebrow}
                </span>
                <h1 style="margin:0;font-size:30px;line-height:1;letter-spacing:-0.01em;text-transform:uppercase;font-weight:800;color:${BONE};">
                  ${s.headline.replace(/\n/g, "<br />")}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 8px 28px;">
                ${s.bodyHtml}
              </td>
            </tr>
            ${ctaBlock}
            <tr>
              <td style="padding:28px 28px 0 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td height="1" style="height:1px;line-height:1px;background:rgba(236,231,220,0.08);">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 32px 28px;">
                <p style="margin:0;font-size:12.5px;line-height:1.6;color:${INK_300};">
                  ${s.footnote}
                </p>
              </td>
            </tr>
          </table>
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
            <tr>
              <td style="padding:18px 28px 0 28px;">
                <p style="margin:0;font-family:'SF Mono','Menlo','Consolas',monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_500};text-align:center;">
                  MenMade &middot; Built for men who&rsquo;ve done enough thinking
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  // Plain-text fallback. Strip HTML from body, keep CTA + footnote.
  const stripTags = (h: string) =>
    h.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
  const text = [
    `MenMade — ${s.eyebrow}`,
    "",
    s.headline.replace(/\n/g, " "),
    "",
    stripTags(s.bodyHtml),
    "",
    s.cta ? `${s.cta.label}: ${s.cta.href}` : "",
    "",
    s.footnote,
  ]
    .filter(Boolean)
    .join("\n");

  return { html, text };
}
