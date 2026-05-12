"use client";

import { motion } from "framer-motion";
import {
  Notebook,
  UsersThree,
  ListBullets,
  GearSix,
} from "@phosphor-icons/react/dist/ssr";

export type TabId = "brief" | "roster" | "field-log" | "settings";

const TABS: { id: TabId; label: string; Icon: typeof Notebook }[] = [
  { id: "brief", label: "Brief", Icon: Notebook },
  { id: "roster", label: "Roster", Icon: UsersThree },
  { id: "field-log", label: "Field log", Icon: ListBullets },
  { id: "settings", label: "Settings", Icon: GearSix },
];

type Props = {
  active: TabId;
  onChange: (id: TabId) => void;
};

export function SquadTabs({ active, onChange }: Props) {
  return (
    <nav
      aria-label="Squad sections"
      className="sticky top-16 z-20 border-b border-white/[0.06] bg-ink-950/85 backdrop-blur-md"
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
        <ul
          role="tablist"
          className="flex gap-1 overflow-x-auto"
        >
          {TABS.map(({ id, label, Icon }) => {
            const on = id === active;
            return (
              <li key={id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => onChange(id)}
                  className={`group relative inline-flex items-center gap-2 whitespace-nowrap px-3 py-4 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors duration-200 md:px-4 md:py-5 ${
                    on
                      ? "text-bone"
                      : "text-ink-200/65 hover:text-bone"
                  }`}
                >
                  <Icon
                    size={13}
                    weight={on ? "fill" : "regular"}
                    className={
                      on ? "text-ember-400" : "text-ink-300/65 group-hover:text-bone"
                    }
                  />
                  {label}
                  {on ? (
                    <motion.span
                      layoutId="squad-tab-underline"
                      aria-hidden
                      className="absolute inset-x-3 -bottom-px h-[2px] bg-ember-400 md:inset-x-4"
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 28,
                      }}
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
