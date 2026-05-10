"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  DotsThreeVertical,
  Flag,
  Prohibit,
  Warning,
  Crown,
} from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "../../components/ui/Avatar";
import type { ChatMessage, ChatReaction } from "../../lib/store";
import { REACTIONS, type RosterMember } from "../_data/seed";
import { MessageStamp } from "./MessageStamp";

type Props = {
  message: ChatMessage;
  isMe: boolean;
  isRunLead: boolean;
  reportedAlready: boolean;
  roster: RosterMember[];
  onReact: (id: string, reaction: ChatReaction) => void;
  onReport: (id: string) => void;
  onBlock: (handle: string) => void;
};

function formatHHMM(iso: string) {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

const AVATAR_COL = "w-[44px] shrink-0";

export function MessageItem({
  message,
  isMe,
  isRunLead,
  reportedAlready,
  roster,
  onReact,
  onReport,
  onBlock,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen && !showReactions) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
        setShowReactions(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen, showReactions]);

  const reactionEntries = Object.entries(message.reactions ?? {}).filter(
    ([, n]) => (n ?? 0) > 0,
  ) as [ChatReaction, number][];

  const isLead =
    roster.find((r) => r.handle === message.authorHandle)?.role === "lead";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        y: { type: "spring", stiffness: 120, damping: 18 },
      }}
      className={`group relative ${isRunLead ? "mt-3 first:mt-1" : ""} ${
        isMe ? "chat-paper-mine" : ""
      }`}
    >
      {/* Ember left edge for own messages */}
      {isMe ? (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[2px] bg-ember-400/55"
        />
      ) : null}

      <div className="px-5 md:px-8">
        <div className="mx-auto flex w-full max-w-[860px] gap-4 py-1.5">
          {/* Avatar gutter — only filled on run lead, otherwise reserved for alignment */}
          <div className={AVATAR_COL}>
            {isRunLead ? (
              <Avatar name={message.authorName} size="md" />
            ) : (
              <span
                aria-hidden
                className="block h-1 w-full opacity-0"
              />
            )}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            {/* Run-lead byline */}
            {isRunLead ? (
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <span
                    className={`font-sans text-[15px] font-extrabold uppercase leading-none tracking-tight ${
                      isMe ? "text-ember-400" : "text-bone"
                    }`}
                  >
                    {isMe ? "You" : message.authorName}
                  </span>
                  {isLead ? (
                    <span
                      aria-label="Squad lead"
                      className="inline-flex items-center gap-0.5 border border-white/20 px-1.5 py-px font-mono text-[8.5px] font-bold uppercase tracking-[0.22em] leading-none text-bone/85"
                    >
                      <Crown size={9} weight="regular" />
                      Lead
                    </span>
                  ) : null}
                  <span className="font-mono text-[10.5px] uppercase leading-none tracking-[0.18em] text-ink-300/55">
                    @{message.authorHandle}
                  </span>
                </div>
                <span
                  className="font-mono text-[10.5px] uppercase leading-none tracking-[0.18em] tabular-nums text-ink-300/55"
                  suppressHydrationWarning
                >
                  {formatHHMM(message.sentAtIso)}
                </span>
              </div>
            ) : null}

            {/* Body — stamp attachment, body text, or both */}
            {message.stampId ? (
              <div className="mt-0.5">
                <MessageStamp stampId={message.stampId} />
                {message.body ? (
                  <p className="emoji mt-2 whitespace-pre-wrap break-words text-[15px] leading-[1.6] text-bone/92">
                    {message.body}
                  </p>
                ) : null}
                {message.softFlagged ? (
                  <p className="mt-1 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.22em] text-ember-400/80">
                    <Warning size={9} weight="fill" />
                    Flagged
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="emoji whitespace-pre-wrap break-words text-[15px] leading-[1.6] text-bone/92">
                {message.body}
                {message.softFlagged ? (
                  <span className="ml-2 inline-flex items-center gap-1 align-middle font-mono text-[9px] uppercase tracking-[0.22em] text-ember-400/80">
                    <Warning size={9} weight="fill" />
                    Flagged
                  </span>
                ) : null}
              </p>
            )}

            {/* Reactions */}
            {reactionEntries.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {reactionEntries.map(([id, n]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onReact(message.id, id)}
                    className="inline-flex items-center gap-1.5 border border-white/10 bg-[var(--chat-paper-raised)] px-2 py-0.5 font-mono text-[10.5px] tabular-nums tracking-[0.05em] text-bone/90 transition hover:border-white/25"
                  >
                    <span className="text-bone">{id}</span>
                    <span className="h-2.5 w-px bg-white/15" aria-hidden />
                    <span className="text-ink-300/75">{n}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {/* Continuation timestamp on hover */}
            {!isRunLead ? (
              <span
                className="absolute right-5 top-2 hidden font-mono text-[9.5px] uppercase tracking-[0.18em] tabular-nums text-ink-300/45 group-hover:block md:right-8"
                suppressHydrationWarning
              >
                {formatHHMM(message.sentAtIso)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Hover actions */}
      <div
        ref={wrapRef}
        className="absolute right-3 top-2 flex items-center gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 md:right-6"
      >
        <div className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={showReactions}
            aria-label="Add reaction"
            onClick={() => {
              setShowReactions((v) => !v);
              setMenuOpen(false);
            }}
            className="border border-white/10 bg-[var(--chat-paper-raised)] px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-bone/85 transition hover:border-ember-400/40 hover:text-bone"
          >
            +
          </button>
          {showReactions ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-10 mt-1 flex border border-white/10 bg-[var(--chat-paper-raised)] shadow-[0_20px_40px_-15px_rgb(0_0_0/0.7)]"
            >
              {REACTIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onReact(message.id, r.id);
                    setShowReactions(false);
                  }}
                  className="px-3 py-1.5 font-mono text-[11px] tracking-[0.05em] text-bone/85 transition hover:bg-white/[0.04] hover:text-ember-400"
                >
                  {r.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {!isMe ? (
          <div className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Message actions"
              onClick={() => {
                setMenuOpen((v) => !v);
                setShowReactions(false);
              }}
              className="border border-white/10 bg-[var(--chat-paper-raised)] p-1 text-bone/85 transition hover:border-ember-400/40 hover:text-bone"
            >
              <DotsThreeVertical size={14} weight="bold" />
            </button>
            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-10 mt-1 w-48 border border-white/10 bg-[var(--chat-paper-raised)] shadow-[0_20px_40px_-15px_rgb(0_0_0/0.7)]"
              >
                <button
                  role="menuitem"
                  type="button"
                  disabled={reportedAlready}
                  onClick={() => {
                    onReport(message.id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-bone/85 transition hover:bg-white/[0.04] hover:text-bone disabled:cursor-not-allowed disabled:text-ink-300/50"
                >
                  {reportedAlready ? "Reported" : "Report"}
                  <Flag
                    size={12}
                    weight={reportedAlready ? "fill" : "regular"}
                  />
                </button>
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    onBlock(message.authorHandle);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between border-t border-white/[0.06] px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-bone/85 transition hover:bg-white/[0.04] hover:text-ember-400"
                >
                  Block @{message.authorHandle}
                  <Prohibit size={12} weight="bold" />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </motion.li>
  );
}
