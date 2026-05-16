"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

type ButtonProps = Omit<HTMLMotionProps<"button">, "children" | "ref"> & {
  children: ReactNode;
  intensity?: number;
  className?: string;
  href?: undefined;
};

type AnchorProps = Omit<HTMLMotionProps<"a">, "children" | "ref" | "href"> & {
  children: ReactNode;
  intensity?: number;
  className?: string;
  href: string;
};

type Props = ButtonProps | AnchorProps;

export function MagneticButton(props: Props) {
  const { children, intensity = 0.25, className = "", href, ...rest } = props;
  const ref = useRef<HTMLElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 22, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 220, damping: 22, mass: 0.6 });
  const innerX = useTransform(springX, (v) => v * 0.4);
  const innerY = useTransform(springY, (v) => v * 0.4);

  function onMove(e: React.MouseEvent<HTMLElement>) {
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

  const inner = (
    <motion.span
      style={{ x: innerX, y: innerY }}
      className="inline-flex items-center gap-2"
    >
      {children}
    </motion.span>
  );

  if (href !== undefined) {
    const anchorRest = rest as Omit<HTMLMotionProps<"a">, "children" | "ref" | "href">;
    return (
      <motion.a
        ref={(el) => {
          ref.current = el;
        }}
        href={href}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ x: springX, y: springY }}
        className={className}
        whileTap={{ scale: 0.98 }}
        {...anchorRest}
      >
        {inner}
      </motion.a>
    );
  }

  const buttonRest = rest as Omit<HTMLMotionProps<"button">, "children" | "ref">;
  return (
    <motion.button
      ref={(el) => {
        ref.current = el;
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: springX, y: springY }}
      className={className}
      whileTap={{ scale: 0.98 }}
      {...buttonRest}
    >
      {inner}
    </motion.button>
  );
}
