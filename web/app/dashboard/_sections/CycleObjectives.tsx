"use client";

import { useState } from "react";
import { Circle, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { MonoLabel } from "../../components/ui/MonoLabel";

export type Objective = {
  id: string;
  label: string;
  due: string;
  done: boolean;
};

type Props = {
  initial: Objective[];
  onToggle?: (objective: Objective, nowDone: boolean) => void;
};

export function CycleObjectives({ initial, onToggle }: Props) {
  const [items, setItems] = useState(initial);
  const completedCount = items.filter((o) => o.done).length;

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next = { ...o, done: !o.done };
        onToggle?.(next, next.done);
        return next;
      }),
    );
  }

  return (
    <section
      aria-labelledby="objectives-heading"
      className="flex flex-col border border-white/[0.06] bg-ink-900/40"
    >
      <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex flex-col gap-1">
          <MonoLabel>Cycle objectives</MonoLabel>
          <h2
            id="objectives-heading"
            className="text-[15px] font-semibold text-bone"
          >
            What &ldquo;done&rdquo; looks like
          </h2>
        </div>
        <div className="font-mono text-[12px] tabular-nums text-bone">
          <span className="font-bold">{completedCount}</span>
          <span className="text-ink-300/70"> / {items.length}</span>
        </div>
      </header>

      <ul className="divide-y divide-white/[0.05]">
        {items.map((o) => (
          <li key={o.id}>
            <button
              type="button"
              onClick={() => toggle(o.id)}
              aria-pressed={o.done}
              className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-white/[0.02]"
            >
              {o.done ? (
                <CheckCircle
                  size={22}
                  weight="fill"
                  className="text-ember-400 transition"
                />
              ) : (
                <Circle
                  size={22}
                  weight="regular"
                  className="text-ink-300/60 transition group-hover:text-bone"
                />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[14px] leading-snug ${
                    o.done
                      ? "text-ink-300/60 line-through decoration-ink-300/40"
                      : "text-bone"
                  }`}
                >
                  {o.label}
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/60">
                  Due {o.due}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
