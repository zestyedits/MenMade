"use client";

/**
 * Root-level page transition. `template.tsx` re-mounts on every route
 * change (unlike `layout.tsx` which persists), so wrapping children in
 * a Framer Motion fade is enough to get a subtle cross-fade between
 * pages without manual key juggling.
 *
 * Restrained on purpose: brief fade + 4px translate. Anything heavier
 * (slide, scale, blur) reads as a consumer app, not a tool.
 * Respects prefers-reduced-motion via Framer Motion's automatic guard.
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function RootTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
