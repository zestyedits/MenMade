"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useTransform, animate } from "framer-motion";

type Props = {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  /** Use locale-formatted commas. Default true. */
  format?: boolean;
};

/**
 * Numeric tick-up that runs once when the element enters the viewport.
 * Respects prefers-reduced-motion by snapping to the final value.
 */
export function CountUp({
  value,
  suffix = "",
  prefix = "",
  duration = 1.8,
  className = "",
  format = true,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);

  // Track formatted output as the motion value changes.
  const rounded = useTransform(mv, (latest) => Math.round(latest));

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      const formatted = format ? v.toLocaleString() : String(v);
      setDisplay(`${prefix}${formatted}${suffix}`);
    });
    return () => unsubscribe();
  }, [rounded, prefix, suffix, format]);

  useEffect(() => {
    if (!inView) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [inView, mv, value, duration]);

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${value}${suffix}`}>
      {display}
    </span>
  );
}
