"use client";

/**
 * Tier chip rendered next to a user's handle. Visual rules:
 *
 *   - free    → nothing (no badge, just the handle)
 *   - operator → thin bone outline, mono "OPERATOR" label, no fill
 *   - founder  → ember-bordered chip, mono "FOUNDER · 087" with the
 *                user's seat number (the unique flex — only 500 exist)
 *
 * Stays restrained on purpose: no crowns, no "PRO" / "ELITE" / "VIP"
 * shouting. Reads as service insignia, not a SaaS upsell.
 */

import { Crown } from "@phosphor-icons/react/dist/ssr";
import type { Tier } from "../../lib/use-tier";

type Size = "sm" | "md";

export function TierBadge({
  tier,
  size = "sm",
  className = "",
}: {
  tier: Tier | "loading";
  size?: Size;
  className?: string;
}) {
  if (tier === "loading") return null;
  if (tier.plan === "free") return null;

  const isFounder = tier.plan === "founder";
  const text = size === "sm" ? "text-[9.5px]" : "text-[10.5px]";
  const padding = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1";

  if (isFounder) {
    const seat = tier.founderSeatNumber
      ? String(tier.founderSeatNumber).padStart(3, "0")
      : null;
    return (
      <span
        className={`inline-flex items-center gap-1 border border-ember-400/55 bg-ember-400/[0.08] font-mono ${text} font-bold uppercase tracking-[0.22em] text-ember-400 ${padding} ${className}`}
        aria-label={
          seat ? `Founder, seat ${seat} of 500` : "Founder's Pass holder"
        }
        title={seat ? `Founder · seat ${seat} of 500` : "Founder's Pass"}
      >
        <Crown size={size === "sm" ? 9 : 10} weight="fill" />
        {seat ? `Founder · ${seat}` : "Founder"}
      </span>
    );
  }

  // Operator (monthly or annual). One badge, no need to distinguish
  // cycle length at the avatar — it's the same access level.
  return (
    <span
      className={`inline-flex items-center font-mono ${text} font-bold uppercase tracking-[0.22em] text-bone border border-bone/30 ${padding} ${className}`}
      aria-label="Operator subscriber"
      title="Operator"
    >
      Operator
    </span>
  );
}
