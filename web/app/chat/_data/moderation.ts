// Tiered moderation classifier. UI-first stub — the real implementation
// will live server-side and use a maintained list / classifier service.
//
// Tiers:
//   "ok"        → ship the message
//   "soft-warn" → ship, but mark softFlagged so the squad lead sees it
//   "hard-block"→ refuse to send; show in-composer rephrase hint
//
// The roast register stays — banned-words filtering is intentionally
// permissive. Hard blocks are reserved for slurs, threats of physical
// violence, doxxing patterns, and obviously illegal content. Soft warns
// are for personal attacks repeated against the same user.
//
// This stub deliberately does NOT enumerate slurs in source. Replace
// `containsHardPattern` with a call to a maintained list (e.g.
// https://github.com/dsojevic/profanity-list) before public launch.

export type ModerationVerdict = "ok" | "soft-warn" | "hard-block";

export type ModerationContext = {
  /** Recent messages from the same author, newest-first, used to detect repeated targeting. */
  recentByAuthor?: { body: string; sentAtIso: string }[];
};

const PERSONAL_ATTACK_PATTERN = /\b(you'?re|ur|u r)\s+(a\s+)?(loser|trash|garbage|pathetic|worthless)\b/i;
const THREAT_PATTERN = /\b(i('| wi)ll|imma|gonna)\s+(kill|hurt|find|come (for|after))\s+(you|him|her|them)\b/i;
const DOX_PATTERN = /\b\d{1,5}\s+\w+\s+(st|street|ave|avenue|rd|road|blvd|boulevard|ln|lane)\b/i;

function containsHardPattern(text: string): boolean {
  // TODO: swap for maintained slur/threat list before launch.
  if (THREAT_PATTERN.test(text)) return true;
  if (DOX_PATTERN.test(text)) return true;
  return false;
}

export function classifyMessage(
  text: string,
  ctx: ModerationContext = {},
): ModerationVerdict {
  const trimmed = text.trim();
  if (trimmed.length === 0) return "ok";
  if (containsHardPattern(trimmed)) return "hard-block";

  // Personal attack repeated within 5 minutes against same target → soft warn.
  if (PERSONAL_ATTACK_PATTERN.test(trimmed)) {
    const recent = ctx.recentByAuthor ?? [];
    const recentAttacks = recent.filter(
      (m) =>
        PERSONAL_ATTACK_PATTERN.test(m.body) &&
        Date.now() - new Date(m.sentAtIso).getTime() < 5 * 60_000,
    );
    if (recentAttacks.length >= 1) return "soft-warn";
  }

  return "ok";
}

export const HARD_BLOCK_HINT =
  "That one trips a hard rule (threats, doxxing, or slurs). Rephrase the heat.";

export const SOFT_WARN_HINT =
  "Heads up — that reads like a directed pile-on. The squad lead will see this one.";
