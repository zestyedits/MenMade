"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { MonoLabel } from "../../components/ui/MonoLabel";

type Props = {
  index: string;
  total: string;
  kicker: string;
  title: string;
  hint?: string;
  children: ReactNode;
};

export function StepShell({ index, total, kicker, title, hint, children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-7"
    >
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em]">
          <span className="text-ember-400/85">{index}</span>
          <span className="h-3 w-px bg-white/15" />
          <span className="text-ink-300/60">of {total}</span>
          <span className="h-3 w-px bg-white/15" />
          <MonoLabel>{kicker}</MonoLabel>
        </div>
        <h2 className="text-balance text-[34px] font-extrabold uppercase leading-[0.98] tracking-tight text-bone md:text-[44px]">
          {title}
        </h2>
        {hint ? (
          <p className="max-w-[55ch] text-[14px] leading-relaxed text-ink-200/75">
            {hint}
          </p>
        ) : null}
      </header>

      <div>{children}</div>
    </motion.div>
  );
}
