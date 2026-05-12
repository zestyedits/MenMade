"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * A thin ember bar pinned to the top of the viewport that fills as the
 * user scrolls the page. Sits above the navbar (z-50). Uses a spring on
 * the raw scroll progress so the bar feels alive rather than mechanical.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 22,
    mass: 0.4,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-ember-400"
    />
  );
}
