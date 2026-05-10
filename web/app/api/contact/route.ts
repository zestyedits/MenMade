// Server-only. The email address never reaches the client bundle.
// Real delivery is not wired yet — see TODO at the bottom of this file.

const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "keith@sa-software.com";

const MAX_NAME = 80;
const MAX_SUBJECT = 140;
const MAX_BODY = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  body?: unknown;
};

function asString(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (trimmed.length === 0 || trimmed.length > max) return null;
  return trimmed;
}

export async function POST(request: Request) {
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return Response.json(
      { ok: false, error: "Invalid JSON." },
      { status: 400 },
    );
  }

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

  // For now we only log. The destination is server-side and never exposed
  // to the client. When real email delivery is wired, swap this for a
  // call to your provider's SDK (see TODO below).
  console.log("[contact] new submission", {
    to: CONTACT_EMAIL,
    from: { name, email },
    subject: `[MenMade] ${subject}`,
    body,
    receivedAt: new Date().toISOString(),
  });

  return Response.json({ ok: true });
}

// TODO: wire real email delivery before public launch.
//   Recommended: Resend (https://resend.com) — 3,000 free emails/month, 1
//   line install (`npm i resend`), no SMTP plumbing.
//   Replace the console.log above with:
//     import { Resend } from "resend";
//     const resend = new Resend(process.env.RESEND_API_KEY);
//     await resend.emails.send({
//       from: "MenMade <noreply@your-domain.com>",
//       to: CONTACT_EMAIL,
//       replyTo: email,
//       subject: `[MenMade] ${subject}`,
//       text: `From: ${name} <${email}>\n\n${body}`,
//     });
//   Then add RESEND_API_KEY to .env.local and .env.example.
