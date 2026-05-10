"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

type Props = Omit<HTMLMotionProps<"button">, "children" | "ref"> & {
  children: ReactNode;
  intensity?: number;
  className?: string;
};

export function MagneticButton({
  children,
  intensity = 0.25,
  className = "",
  ...rest
}: Props) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 22, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 220, damping: 22, mass: 0.6 });
  const innerX = useTransform(springX, (v) => v * 0.4);
  const innerY = useTransform(springY, (v) => v * 0.4);

  function onMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * intensity);
    y.set((e.clientY - cy) * intensity);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: springX, y: springY }}
      className={className}
      whileTap={{ scale: 0.98 }}
      {...rest}
    >
      <motion.span
        style={{ x: innerX, y: innerY }}
        className="inline-flex items-center gap-2"
      >
        {children}
      </motion.span>
    </motion.button>
  );
}
