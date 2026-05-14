"use client";

/**
 * Avatar with a tier-specific outer ring and (for founders) a tiny
 * 3-digit seat-number tag tucked into the bottom-right corner — the
 * seat # is the unique flex, only 500 ever exist.
 *
 *   - free     → bare avatar, no ring
 *   - operator → thin bone ring (1.5px) — earned, restrained
 *   - founder  → ember ring + seat tag like "087" in the corner
 *
 * Wraps Avatar instead of replacing it, so the initials/size logic
 * stays in one place.
 */

import { Avatar } from "./Avatar";
import type { Tier } from "../../lib/use-tier";

type Size = "sm" | "md" | "lg";

const RING_SIZES: Record<Size, string> = {
  sm: "p-[2px]",
  md: "p-[2.5px]",
  lg: "p-[3px]",
};

const SEAT_SIZES: Record<Size, string> = {
  sm: "text-[7px] px-[3px] py-px -bottom-1 -right-1.5",
  md: "text-[7.5px] px-1 py-px -bottom-1 -right-2",
  lg: "text-[9px] px-1.5 py-0.5 -bottom-1 -right-2.5",
};

export function TieredAvatar({
  name,
  tier,
  size = "sm",
  className = "",
}: {
  name: string;
  tier: Tier | "loading";
  size?: Size;
  className?: string;
}) {
  // Loading state: render the plain avatar so the layout doesn't shift
  // when the tier query lands.
  if (tier === "loading" || tier.plan === "free") {
    return <Avatar name={name} size={size} className={className} />;
  }

  const isFounder = tier.plan === "founder";
  // Operator ring is bone, founder ring is an ember gradient. Both
  // sit on a 2-tone border so the ring reads as deliberate even on
  // a dark backdrop, not just "background bleeding through."
  const ringClass = isFounder
    ? "bg-gradient-to-br from-ember-400 via-ember-500 to-ember-300 shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_0_12px_-2px_rgba(239,123,53,0.45)]"
    : "bg-bone shadow-[0_0_0_1px_rgba(0,0,0,0.4)]";

  return (
    <span className={`relative inline-flex ${className}`}>
      <span
        className={`inline-flex rounded-full ${ringClass} ${RING_SIZES[size]}`}
        aria-hidden
      >
        <Avatar name={name} size={size} />
      </span>
      {isFounder && tier.founderSeatNumber ? (
        <span
          className={`absolute ${SEAT_SIZES[size]} inline-flex items-center justify-center rounded-sm border border-ember-400 bg-ink-950 font-mono font-bold uppercase tracking-tight text-ember-400 tabular-nums`}
          aria-label={`Founder seat ${tier.founderSeatNumber}`}
          title={`Seat ${tier.founderSeatNumber} of 500`}
        >
          {String(tier.founderSeatNumber).padStart(3, "0")}
        </span>
      ) : null}
    </span>
  );
}
