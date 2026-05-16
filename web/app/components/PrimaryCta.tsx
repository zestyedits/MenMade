"use client";

import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { MagneticButton } from "./MagneticButton";

type Size = "md" | "lg";

type Props = {
  href: string;
  children: ReactNode;
  /** Aria-label override; defaults to the visible children when string. */
  ariaLabel?: string;
  /** When true, drops the trailing arrow glyph. */
  hideArrow?: boolean;
  size?: Size;
  /** When true, uses a non-magnetic anchor (suitable for sticky navbar). */
  flat?: boolean;
  className?: string;
};

/**
 * The bone-filled, inset-highlight, ember-glow primary CTA the marketing
 * surfaces share. Built on top of MagneticButton when used in hero/final
 * placements; degrades to a plain anchor (flat=true) for Navbar where the
 * magnetic effect would compete with the sticky header.
 */
export function PrimaryCta({
  href,
  children,
  ariaLabel,
  hideArrow = false,
  size = "md",
  flat = false,
  className = "",
}: Props) {
  const sizeCls =
    size === "lg"
      ? "h-13 px-7 py-3.5 text-[15px]"
      : "h-12 px-6 text-[14px]";

  const base =
    "tactile group inline-flex items-center gap-2 rounded-full bg-bone font-medium text-ink-950 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.55),0_18px_38px_-18px_rgb(221_87_34_/_0.6)] ring-1 ring-inset ring-white/10";

  const arrow = hideArrow ? null : (
    <ArrowUpRight
      size={size === "lg" ? 15 : 14}
      weight="bold"
      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
    />
  );

  if (flat) {
    return (
      <a
        href={href}
        aria-label={ariaLabel}
        className={`${base} ${sizeCls} ${className}`}
      >
        <span className="inline-flex items-center gap-2">
          {children}
          {arrow}
        </span>
      </a>
    );
  }

  return (
    <MagneticButton
      href={href}
      aria-label={ariaLabel}
      className={`${base} ${sizeCls} ${className}`}
    >
      {children}
      {arrow}
    </MagneticButton>
  );
}
