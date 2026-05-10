"use client";

import { getStamp } from "../_data/stamps";

type Props = {
  stampId: string;
};

export function MessageStamp({ stampId }: Props) {
  const stamp = getStamp(stampId);
  if (!stamp) {
    return (
      <div className="border border-dashed border-white/15 bg-[var(--chat-paper-raised)] px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/65">
        Unknown stamp
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center gap-4 border px-5 py-4 ${
        stamp.tint === "ember"
          ? "border-ember-400/35"
          : "border-white/15"
      } bg-[var(--chat-paper-raised)]`}
      style={{ minWidth: 240 }}
    >
      <stamp.Icon
        size={36}
        weight={stamp.iconWeight}
        className={`${
          stamp.tint === "ember" ? "text-ember-400" : "text-bone"
        } stamp-anim-${stamp.anim}`}
      />
      <div className="flex flex-col gap-0.5">
        <span
          className={`font-sans text-[15px] font-extrabold uppercase tracking-tight leading-none ${
            stamp.tint === "ember" ? "text-ember-400" : "text-bone"
          }`}
        >
          {stamp.label}
        </span>
        {stamp.subtitle ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/65">
            {stamp.subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
}
