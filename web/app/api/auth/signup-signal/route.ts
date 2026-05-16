import { NextResponse, type NextRequest } from "next/server";
import { getClientIp } from "../../../lib/rate-limit";
import { recordConcernSignal } from "../../../lib/admin-audit";
import { createAdminClient } from "../../../lib/supabase/admin";

/**
 * POST /api/auth/signup-signal
 *
 * Fire-and-forget ping from the sign-up form *after* a successful
 * supabase.auth.signUp. We can't observe Supabase Auth from the server
 * directly (no webhook configured), so the client pings here so we can
 * detect signup bursts (one IP creating many accounts in a short window)
 * and surface them on Buddy.
 *
 * No auth required — the user isn't fully authenticated until they
 * confirm email. The IP is the only useful key.
 */

const WINDOW_MS = 5 * 60 * 1000;
const BURST_THRESHOLD = 5;

type Bucket = { count: number; resetAt: number; signaled: boolean };
const burstBuckets = new Map<string, Bucket>();

function bump(ip: string): { count: number; firstBurst: boolean } {
  const now = Date.now();
  const existing = burstBuckets.get(ip);
  if (!existing || existing.resetAt <= now) {
    burstBuckets.set(ip, { count: 1, resetAt: now + WINDOW_MS, signaled: false });
    return { count: 1, firstBurst: false };
  }
  existing.count += 1;
  const firstBurst =
    existing.count >= BURST_THRESHOLD && !existing.signaled;
  if (firstBurst) existing.signaled = true;
  return { count: existing.count, firstBurst };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { count, firstBurst } = bump(ip);

  if (firstBurst) {
    try {
      await recordConcernSignal(createAdminClient(), {
        kind: "signup_burst",
        severity: "high",
        title: "Signup burst from a single IP",
        body: `IP ${ip} created ${count} accounts in the last 5 min.`,
        metadata: { ip, count, windowMs: WINDOW_MS },
      });
    } catch (err) {
      console.warn("[signup-signal] burst signal write failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
