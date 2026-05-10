"use client";

type Props = {
  label: string;
  detail?: string;
  cycleDay?: number;
};

export function DayDivider({ label, detail, cycleDay }: Props) {
  return (
    <li
      className="px-5 pt-7 md:px-8"
      role="separator"
      aria-label={`${label}${detail ? `, ${detail}` : ""}`}
    >
      <div className="mx-auto flex max-w-[860px] items-center gap-3">
        <span className="chat-rule-strong h-px flex-1" aria-hidden />
        <span className="inline-flex items-center gap-2.5 px-1 font-mono text-[10.5px] uppercase tracking-[0.28em]">
          <span className="text-bone">{label}</span>
          {cycleDay !== undefined ? (
            <>
              <span aria-hidden className="h-2.5 w-px bg-white/15" />
              <span className="text-ink-200/80">
                Day {String(cycleDay).padStart(2, "0")}
              </span>
            </>
          ) : null}
          {detail ? (
            <>
              <span aria-hidden className="h-2.5 w-px bg-white/15" />
              <span className="text-ink-300/65">{detail}</span>
            </>
          ) : null}
        </span>
        <span className="chat-rule h-px flex-1" aria-hidden />
      </div>
    </li>
  );
}
