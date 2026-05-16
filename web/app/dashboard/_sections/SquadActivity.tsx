"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "../../components/ui/Avatar";
import { LiveDot } from "../../components/ui/LiveDot";
import { MonoLabel } from "../../components/ui/MonoLabel";

export type ActivityEvent = {
  id: string;
  name: string;
  action: string;
  timeAgo: string;
  highlight?: boolean;
  fresh?: boolean;
};

type Props = {
  squadName: string;
  squadSlug: string | null;
  events: ActivityEvent[];
};

export function SquadActivity({ squadName, squadSlug, events }: Props) {
  const visible = events.slice(0, 8);
  const hasEvents = visible.length > 0;

  return (
    <section
      aria-labelledby="squad-activity-heading"
      className="flex flex-col border border-white/[0.06] bg-ink-900/40"
    >
      <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex flex-col gap-1">
          <MonoLabel>Squad / {squadName}</MonoLabel>
          <h2
            id="squad-activity-heading"
            className="text-[15px] font-semibold text-bone"
          >
            Field activity
          </h2>
        </div>
        {hasEvents ? <LiveDot label="Live" /> : null}
      </header>

      {visible.length === 0 ? (
        <div className="flex flex-col items-start gap-1 px-5 py-6">
          <p className="text-[13px] leading-snug text-ink-200/80">
            Quiet so far.
          </p>
          <p className="text-[12px] leading-snug text-ink-300/70">
            Your squad&apos;s field activity shows up here as men log work.
          </p>
        </div>
      ) : null}

      <ul
        className="divide-y divide-white/[0.05]"
        aria-live="polite"
        aria-relevant="additions"
      >
        <AnimatePresence initial={false}>
          {visible.map((e) => (
            <motion.li
              key={e.id}
              layout
              initial={
                e.fresh
                  ? { opacity: 0, y: -8, backgroundColor: "rgb(239 123 53 / 0.08)" }
                  : false
              }
              animate={{
                opacity: 1,
                y: 0,
                backgroundColor: "rgb(239 123 53 / 0)",
              }}
              transition={{
                opacity: { duration: 0.35 },
                y: { type: "spring", stiffness: 100, damping: 20 },
                backgroundColor: { duration: 1.6, delay: 0.4 },
              }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-3 px-5 py-3.5 transition hover:bg-white/[0.02]"
            >
              <Avatar name={e.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug text-bone">
                  <span className="font-medium">{e.name}</span>{" "}
                  <span
                    className={
                      e.highlight ? "text-ember-400/90" : "text-ink-200/75"
                    }
                  >
                    {e.action}
                  </span>
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/60">
                  {e.timeAgo}
                </p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <footer className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/60">
          {events.length} events &middot; today
        </span>
        <a
          href={squadSlug ? `/squads/${squadSlug}` : "/squad"}
          className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-200/70 transition hover:text-bone"
        >
          Open squad &rarr;
        </a>
      </footer>
    </section>
  );
}
