import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  rule?: boolean;
  ember?: boolean;
  className?: string;
};

export function MonoLabel({
  children,
  rule = false,
  ember = false,
  className = "",
}: Props) {
  return (
    <div
      className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] ${
        ember ? "text-ember-400/80" : "text-ink-200/60"
      } ${className}`}
    >
      {rule ? (
        <span aria-hidden className="h-px w-8 bg-ink-200/40" />
      ) : null}
      <span>{children}</span>
    </div>
  );
}
