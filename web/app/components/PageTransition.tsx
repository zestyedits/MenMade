"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Root-level page transition wrapper.
 *
 * Keys off the first path segment so navigations between top-level routes
 * (/, /pricing, /contact, /chat, /settings) animate, but nested
 * navigations within the same section (e.g. /settings/account →
 * /settings/profile) don't re-animate the entire page chrome on every
 * tab click.
 *
 * Respects prefers-reduced-motion: returns children unwrapped if the user
 * has the OS-level setting on.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const segments = pathname.split("/").filter(Boolean);
  const topSegment = segments[0] ?? "home";

  if (reduce) return <>{children}</>;

  return (
    <motion.div
      key={topSegment}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
