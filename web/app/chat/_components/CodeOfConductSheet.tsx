"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "@phosphor-icons/react/dist/ssr";

const RULES = [
  {
    title: "Roast each other.",
    body: "Squad chat is for accountability — that includes calling each other out when someone ghosts or coasts. Dry, deadpan, mutual. The shtick is the point.",
  },
  {
    title: "Punch up, not down.",
    body: "Roasts target the dodge, not the human. No slurs, no harassment based on identity, no targeting one member repeatedly. We rate-limit pile-ons before banning anyone.",
  },
  {
    title: "Hard floors are non-negotiable.",
    body: "Threats of violence, doxxing, sexual content involving minors, illegal-activity coordination, and hate speech are auto-blocked at send and reported up.",
  },
  {
    title: "Receipts beat opinions.",
    body: "If you're going to call someone out, post the field log entry or the photo. The ledger is the squad's referee.",
  },
  {
    title: "Block & report are real.",
    body: "Block hides someone everywhere. Report routes to the squad lead first, then to MenMade staff. Both are anonymous to the person you reported.",
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  showAccept: boolean;
};

export function CodeOfConductSheet({
  open,
  onClose,
  onAccept,
  showAccept,
}: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Squad chat code of conduct"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 bottom-4 top-auto z-50 mx-auto max-h-[85dvh] max-w-[640px] overflow-y-auto border border-white/10 bg-ink-900 shadow-[0_30px_60px_-25px_rgb(0_0_0/0.8)] md:inset-x-0 md:top-1/2 md:bottom-auto md:-translate-y-1/2"
          >
            <div className="flex items-start justify-between border-b border-white/[0.06] p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 place-items-center border border-ember-400/60 text-ember-400">
                  <ShieldCheck size={18} weight="bold" />
                </span>
                <div>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ember-400/85">
                    Squad chat / code
                  </p>
                  <h2 className="mt-1 text-[20px] font-extrabold uppercase tracking-tight text-bone">
                    The bouncer rules.
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-ink-200/80 transition hover:text-bone"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <ol className="flex flex-col divide-y divide-white/[0.05] px-6">
              {RULES.map((r, i) => (
                <li key={r.title} className="flex gap-4 py-5">
                  <span className="font-mono text-[12px] font-bold tabular-nums text-bone">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-bold text-bone">
                      {r.title}
                    </h3>
                    <p className="mt-1 max-w-[60ch] text-[13.5px] leading-relaxed text-ink-200/80">
                      {r.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] p-6">
              <a
                href="/terms"
                className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-200/70 transition hover:text-bone"
              >
                Full terms
              </a>
              {showAccept ? (
                <button
                  type="button"
                  onClick={() => {
                    onAccept();
                    onClose();
                  }}
                  className="tactile inline-flex items-center gap-2 bg-bone px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-950 transition hover:bg-white"
                >
                  Got it. Open the channel.
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-bone/85 transition hover:border-white/25 hover:text-bone"
                >
                  Close
                </button>
              )}
            </footer>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
