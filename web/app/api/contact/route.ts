import { Resend } from "resend";
import { getClientIp, rateLimit } from "../../lib/rate-limit";

// Server-only. None of these values reach the client bundle.
const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "help@menmade.app";
const CONTACT_FROM =
  process.env.CONTACT_FROM ?? "MenMade Contact <contact@menmade.app>";
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";

const MAX_NAME = 80;
const MAX_SUBJECT = 140;
const MAX_BODY = 2000;
const MAX_URLS_IN_BODY = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /\bhttps?:\/\//gi;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  body?: unknown;
  /** Honeypot — should always be empty when submitted by a human. */
  website?: unknown;
};

/** String sanitizer. Rejects CRLF (email-header injection). */
function asString(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  if (/[\r\n]/.test(v)) return null;
  const trimmed = v.trim();
  if (trimmed.length === 0 || trimmed.length > max) return null;
  return trimmed;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  // ---------- Rate limiting (5 req / hour per IP) ----------
  const ip = getClientIp(request);
  const verdict = rateLimit({
    bucketKey: "contact",
    ip,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!verdict.ok) {
    return Response.json(
      { ok: false, error: "Too many submissions. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(verdict.retryAfterSeconds) },
      },
    );
  }

  // ---------- Parse ----------
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return Response.json(
      { ok: false, error: "Invalid JSON." },
      { status: 400 },
    );
  }

  // ---------- Honeypot: silently succeed for bots ----------
  // Real form leaves `website` empty. Bots that fill every field will
  // populate it. We return 200 so the bot thinks it worked.
  if (
    typeof payload.website === "string" &&
    payload.website.trim().length > 0
  ) {
    console.warn("[contact] honeypot triggered from ip=%s", ip);
    return Response.json({ ok: true, mode: "honeypot-discard" });
  }

  // ---------- Validate ----------
  const name = asString(payload.name, MAX_NAME);
  const email = asString(payload.email, MAX_NAME);
  const subject = asString(payload.subject, MAX_SUBJECT);
  const body = asString(payload.body, MAX_BODY);

  if (!name || !email || !subject || !body) {
    return Response.json(
      { ok: false, error: "Missing or invalid fields." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json(
      { ok: false, error: "Invalid email." },
      { status: 400 },
    );
  }
  // Spam heuristic: drop messages with too many URLs.
  const urlCount = (body.match(URL_RE) ?? []).length;
  if (urlCount > MAX_URLS_IN_BODY) {
    console.warn("[contact] spam: %d URLs from ip=%s", urlCount, ip);
    return Response.json(
      { ok: false, error: "Too many links — looks like spam." },
      { status: 400 },
    );
  }

  const finalSubject = `[MenMade] ${subject}`;
  const textBody = `From: ${name} <${email}>\n\n${body}`;
  const htmlBody = `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#111">
    <p style="margin:0 0 16px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.18em">New contact submission</p>
    <p style="margin:0 0 8px"><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
    <p style="margin:0 0 16px"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
    <pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;margin:0">${escapeHtml(body)}</pre>
  </div>`;

  // Dev fallback: log instead of sending when key isn't set.
  if (!RESEND_API_KEY) {
    console.warn(
      "[contact] RESEND_API_KEY not set — logging submission instead of sending.",
    );
    console.log("[contact] submission", {
      to: CONTACT_EMAIL,
      from: { name, email },
      subject: finalSubject,
      bodySnippet: body.slice(0, 200),
      ip,
      receivedAt: new Date().toISOString(),
    });
    return Response.json({ ok: true, mode: "dev-log" });
  }

  // ---------- Real delivery via Resend ----------
  const resend = new Resend(RESEND_API_KEY);
  try {
    const result = await resend.emails.send({
      from: CONTACT_FROM,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: finalSubject,
      text: textBody,
      html: htmlBody,
    });

    if (result.error) {
      console.error("[contact] Resend rejected:", result.error);
      return Response.json(
        { ok: false, error: "Couldn't deliver right now. Try again shortly." },
        { status: 502 },
      );
    }

    return Response.json({ ok: true, id: result.data?.id });
  } catch (err) {
    console.error("[contact] Resend threw:", err);
    return Response.json(
      { ok: false, error: "Couldn't deliver right now. Try again shortly." },
      { status: 502 },
    );
  }
}
