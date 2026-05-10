import type { ReactNode } from "react";
import { MonoLabel } from "./MonoLabel";

type Props = {
  kicker?: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  destructive?: boolean;
};

export function Section({
  kicker,
  title,
  description,
  children,
  destructive = false,
}: Props) {
  return (
    <section
      className={`border-t pt-8 ${
        destructive ? "border-ember-400/30" : "border-white/[0.06]"
      } first:border-t-0 first:pt-0`}
    >
      <header className="mb-4 flex flex-col gap-2">
        {kicker ? (
          <MonoLabel ember={destructive}>{kicker}</MonoLabel>
        ) : null}
        <h2 className="text-balance text-[22px] font-extrabold uppercase leading-tight tracking-tight text-bone md:text-[26px]">
          {title}
        </h2>
        {description ? (
          <div className="max-w-[60ch] text-[13.5px] leading-relaxed text-ink-200/80">
            {description}
          </div>
        ) : null}
      </header>
      <div>{children}</div>
    </section>
  );
}

export function SettingsRow({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="border-b border-white/[0.04] last:border-b-0">
      {children}
    </div>
  );
}

export function SettingsGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-col">{children}</div>;
}
