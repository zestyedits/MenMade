import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";
import { createAdminClient } from "../supabase/admin";

/**
 * Server-side moderation pipeline. Three tiers, escalating severity:
 *
 *   "ok"         → insert clean
 *   "soft-warn"  → insert with soft_flagged = true (squad lead sees a badge)
 *   "hard-block" → refuse the insert; the composer surfaces a rephrase hint
 *
 * The client stub at app/chat/_data/moderation.ts runs the same regex checks
 * pre-send to spare a server roundtrip on obvious cases. The server is always
 * authoritative — anything that gets past the client still has to pass here.
 *
 * Every non-ok verdict writes a mod_actions row before returning, so the App
 * Store appeals trail captures every block, not just the ones a human reviewed.
 */

export type Verdict = "ok" | "soft-warn" | "hard-block";

export type ClassifyResult =
  | { verdict: "ok" }
  | { verdict: "soft-warn"; reason: string }
  | { verdict: "hard-block"; reason: string };

export type ClassifyContext = {
  userId: string;
  squadId: string;
  squadHandle: string | null;
};

const slurMatcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

// Roast register stays — these patterns are reserved for the things that get
// us delisted from the App Store, not for "you suck."
const THREAT_PATTERN =
  /\b(i('| wi)ll|imma|gonna)\s+(kill|hurt|find|come (for|after))\s+(you|him|her|them)\b/i;
const DOX_PATTERN =
  /\b\d{1,5}\s+\w+\s+(st|street|ave|avenue|rd|road|blvd|boulevard|ln|lane)\b/i;
const PERSONAL_ATTACK_PATTERN =
  /\b(you'?re|ur|u r)\s+(a\s+)?(loser|trash|garbage|pathetic|worthless)\b/i;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const PILE_ON_WINDOW_MS = 5 * 60_000;
const PILE_ON_THRESHOLD = 3;

const sendBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = sendBuckets.get(userId);
  if (!entry || entry.resetAt <= now) {
    sendBuckets.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { ok: true, retryAfter: 0 };
}

async function logModAction(opts: {
  action:
    | "hard_blocked"
    | "soft_flagged"
    | "reported"
    | "message_deleted"
    | "user_muted"
    | "user_kicked"
    | "graduated_from_circle";
  targetUserId: string | null;
  squadId: string | null;
  messageId?: string | null;
  bodyExcerpt?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const admin = createAdminClient();
  await admin.from("mod_actions").insert({
    action: opts.action,
    target_user_id: opts.targetUserId,
    squad_id: opts.squadId,
    message_id: opts.messageId ?? null,
    body_excerpt: opts.bodyExcerpt ?? null,
    metadata: opts.metadata ?? null,
  });
}

export async function classifyMessage(
  body: string,
  ctx: ClassifyContext,
): Promise<ClassifyResult> {
  const trimmed = body.trim();
  if (trimmed.length === 0) {
    return { verdict: "hard-block", reason: "empty" };
  }

  const rate = checkRateLimit(ctx.userId);
  if (!rate.ok) {
    await logModAction({
      action: "hard_blocked",
      targetUserId: ctx.userId,
      squadId: ctx.squadId,
      bodyExcerpt: trimmed.slice(0, 200),
      metadata: { rule: "rate_limit", retry_after: rate.retryAfter },
    });
    return {
      verdict: "hard-block",
      reason: `Slow down. You can send again in ${rate.retryAfter}s.`,
    };
  }

  if (THREAT_PATTERN.test(trimmed)) {
    await logModAction({
      action: "hard_blocked",
      targetUserId: ctx.userId,
      squadId: ctx.squadId,
      bodyExcerpt: trimmed.slice(0, 200),
      metadata: { rule: "threat" },
    });
    return { verdict: "hard-block", reason: "Threats aren't the register." };
  }

  if (DOX_PATTERN.test(trimmed)) {
    await logModAction({
      action: "hard_blocked",
      targetUserId: ctx.userId,
      squadId: ctx.squadId,
      bodyExcerpt: trimmed.slice(0, 200),
      metadata: { rule: "doxxing" },
    });
    return { verdict: "hard-block", reason: "No addresses or doxxing." };
  }

  if (slurMatcher.hasMatch(trimmed)) {
    await logModAction({
      action: "hard_blocked",
      targetUserId: ctx.userId,
      squadId: ctx.squadId,
      bodyExcerpt: trimmed.slice(0, 200),
      metadata: { rule: "slur" },
    });
    return { verdict: "hard-block", reason: "Rephrase the heat." };
  }

  if (PERSONAL_ATTACK_PATTERN.test(trimmed)) {
    const admin = createAdminClient();
    const since = new Date(Date.now() - PILE_ON_WINDOW_MS).toISOString();
    const { count } = await admin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("squad_id", ctx.squadId)
      .eq("author_user_id", ctx.userId)
      .eq("soft_flagged", true)
      .gte("sent_at", since);

    if ((count ?? 0) >= PILE_ON_THRESHOLD - 1) {
      await logModAction({
        action: "soft_flagged",
        targetUserId: ctx.userId,
        squadId: ctx.squadId,
        bodyExcerpt: trimmed.slice(0, 200),
        metadata: { rule: "pile_on" },
      });
      return {
        verdict: "soft-warn",
        reason: "Reads like a directed pile-on. Squad lead will see this one.",
      };
    }
  }

  return { verdict: "ok" };
}
