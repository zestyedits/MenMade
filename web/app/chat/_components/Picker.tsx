"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { STAMPS, type Stamp } from "../_data/stamps";
import { EMOJI_CATEGORIES } from "../_data/emoji";

type Tab = "stamps" | "emoji";

type Props = {
  open: boolean;
  onClose: () => void;
  onPickStamp: (stamp: Stamp) => void;
  onPickEmoji: (glyph: string) => void;
};

export function Picker({ open, onClose, onPickStamp, onPickEmoji }: Props) {
  const [tab, setTab] = useState<Tab>("stamps");
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setTimeout(() => searchRef.current?.focus(), 60);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) onClose();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open, onClose]);

  const filteredStamps = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return STAMPS;
    return STAMPS.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.subtitle?.toLowerCase().includes(q) ||
        s.tags.some((t) => t.includes(q)),
    );
  })();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={wrapRef}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label="Stamps and emoji"
          className="absolute bottom-full left-0 right-0 z-30 mb-2 mx-auto max-w-[640px] border border-white/10 bg-[var(--chat-paper-raised)] shadow-[0_30px_60px_-25px_rgb(0_0_0/0.7)]"
        >
          {/* Header — tabs + search + close */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
            <div
              role="tablist"
              aria-label="Picker tabs"
              className="flex items-center gap-1"
            >
              {(["stamps", "emoji"] as Tab[]).map((t) => {
                const active = t === tab;
                return (
                  <button
                    key={t}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => setTab(t)}
                    className={`px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.22em] transition ${
                      active
                        ? "bg-white/[0.06] text-bone"
                        : "text-ink-200/70 hover:text-bone"
                    }`}
                  >
                    {t === "stamps" ? "Stamps" : "Emoji"}
                  </button>
                );
              })}
            </div>

            <div className="relative ml-2 flex-1">
              <MagnifyingGlass
                size={12}
                weight="bold"
                className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-300/65"
              />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tab === "stamps" ? "Search stamps" : "Search emoji"}
                className="block w-full bg-transparent border border-white/10 pl-7 pr-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-bone placeholder:text-ink-300/50 outline-none focus:border-ember-400/40"
                aria-label="Search"
              />
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close picker"
              className="border border-white/10 p-1 text-bone/85 transition hover:border-white/25 hover:text-bone"
            >
              <X size={14} weight="bold" />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[340px] overflow-y-auto p-3">
            {tab === "stamps" ? (
              <>
                {filteredStamps.length === 0 ? (
                  <p className="px-2 py-8 text-center font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/60">
                    No stamps match.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {filteredStamps.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          onPickStamp(s);
                          onClose();
                        }}
                        className={`group flex aspect-[4/3] flex-col items-center justify-center gap-1.5 border p-2 transition ${
                          s.tint === "ember"
                            ? "border-ember-400/25 hover:border-ember-400/55"
                            : "border-white/10 hover:border-white/30"
                        } bg-[var(--chat-paper)]`}
                      >
                        <s.Icon
                          size={26}
                          weight={s.iconWeight}
                          className={`${
                            s.tint === "ember"
                              ? "text-ember-400"
                              : "text-bone"
                          } stamp-anim-${s.anim}`}
                        />
                        <span
                          className={`font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] ${
                            s.tint === "ember" ? "text-ember-400/90" : "text-bone/85"
                          }`}
                        >
                          {s.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-3">
                {EMOJI_CATEGORIES.map((cat) => {
                  const filtered = query.trim()
                    ? cat.emojis.filter((e) =>
                        e.name.includes(query.trim().toLowerCase()),
                      )
                    : cat.emojis;
                  if (filtered.length === 0) return null;
                  return (
                    <div key={cat.id}>
                      <div className="px-1 pb-1 font-mono text-[9px] uppercase tracking-[0.28em] text-ink-300/55">
                        {cat.label}
                      </div>
                      <div className="grid grid-cols-8 gap-1 sm:grid-cols-10">
                        {filtered.map((e) => (
                          <button
                            key={e.glyph + e.name}
                            type="button"
                            onClick={() => onPickEmoji(e.glyph)}
                            aria-label={e.name}
                            className="grid h-9 w-9 place-items-center border border-transparent text-[20px] leading-none transition hover:border-white/15 hover:bg-white/[0.04]"
                          >
                            <span className="emoji">{e.glyph}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <footer className="flex items-center justify-between border-t border-white/[0.06] px-3 py-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-300/55">
              {tab === "stamps"
                ? "Tap to send. Stamps stand alone."
                : "Tap to insert into your message."}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-300/45">
              Esc to close
            </span>
          </footer>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
