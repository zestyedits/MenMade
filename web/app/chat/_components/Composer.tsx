"use client";

import { useEffect, useRef, useState } from "react";
import {
  PaperPlaneTilt,
  Warning,
  Smiley,
} from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "../../components/ui/Avatar";
import {
  classifyMessage,
  HARD_BLOCK_HINT,
  SOFT_WARN_HINT,
  type ModerationVerdict,
} from "../_data/moderation";
import { Picker } from "./Picker";
import type { Stamp } from "../_data/stamps";

type Props = {
  onSend: (body: string, verdict: ModerationVerdict) => void;
  onSendStamp: (stamp: Stamp) => void;
  recentByMe: { body: string; sentAtIso: string }[];
  squadName: string;
  callsign: string;
  onlineCount: number;
  myName: string;
};

const MAX_LEN = 1200;

export function Composer({
  onSend,
  onSendStamp,
  recentByMe,
  squadName,
  callsign,
  onlineCount,
  myName,
}: Props) {
  const [text, setText] = useState("");
  const [showWarn, setShowWarn] = useState<null | "soft" | "hard">(null);
  const [focused, setFocused] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [text]);

  useEffect(() => {
    if (!text.trim()) {
      setShowWarn(null);
      return;
    }
    const verdict = classifyMessage(text, { recentByAuthor: recentByMe });
    setShowWarn(
      verdict === "hard-block" ? "hard" : verdict === "soft-warn" ? "soft" : null,
    );
  }, [text, recentByMe]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const verdict = classifyMessage(trimmed, { recentByAuthor: recentByMe });
    if (verdict === "hard-block") return;
    onSend(trimmed, verdict);
    setText("");
    setShowWarn(null);
    taRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function handlePickStamp(stamp: Stamp) {
    onSendStamp(stamp);
  }

  function handlePickEmoji(glyph: string) {
    const el = taRef.current;
    if (!el) {
      setText((t) => t + glyph);
      return;
    }
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const next = text.slice(0, start) + glyph + text.slice(end);
    setText(next);
    // Restore caret position after the inserted glyph.
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + glyph.length;
      el.setSelectionRange(pos, pos);
    });
  }

  const overLimit = text.length > MAX_LEN;
  const canSend = text.trim().length > 0 && showWarn !== "hard" && !overLimit;
  const active = focused || text.length > 0;

  return (
    <form onSubmit={handleSubmit} className="chat-paper border-t border-white/[0.06]">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-4 md:px-8 md:py-5">
        <div className="mx-auto flex max-w-[860px] gap-4">
          <div className="w-[44px] shrink-0">
            <Avatar name={myName} size="md" />
          </div>

          <div className="relative min-w-0 flex-1">
            {/* Filing-line preview */}
            <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-sans text-[14px] font-extrabold uppercase leading-none tracking-tight text-ember-400">
                You
              </span>
              <span className="font-mono text-[10px] uppercase leading-none tracking-[0.22em] text-ink-300/65">
                Filing to{" "}
                <span className="text-bone">{squadName}</span>
                <span className="mx-1.5 text-ink-300/35">/</span>
                <span className="text-ink-200/80">{callsign}</span>
              </span>
              <span aria-hidden className="h-2.5 w-px bg-white/15" />
              <span className="font-mono text-[10px] uppercase leading-none tracking-[0.22em] text-ink-300/65">
                <span className="font-bold tabular-nums text-bone">
                  {onlineCount}
                </span>{" "}
                on channel
              </span>
            </div>

            {showWarn ? (
              <div
                role="status"
                className={`mb-2 flex items-start gap-2 border px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.18em] ${
                  showWarn === "hard"
                    ? "border-ember-400/60 bg-ember-400/[0.06] text-ember-400"
                    : "border-white/15 bg-[var(--chat-paper-raised)] text-ink-200/85"
                }`}
              >
                <Warning size={12} weight="fill" className="mt-0.5 shrink-0" />
                <span>
                  {showWarn === "hard" ? HARD_BLOCK_HINT : SOFT_WARN_HINT}
                </span>
              </div>
            ) : null}

            {/* Picker popover anchored to the input */}
            <Picker
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              onPickStamp={handlePickStamp}
              onPickEmoji={handlePickEmoji}
            />

            <div
              className={`relative flex items-end gap-2 border bg-[var(--chat-paper-raised)] px-3 py-2 transition ${
                active
                  ? "border-ember-400/60"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                aria-label="Open stamps and emoji"
                aria-expanded={pickerOpen}
                className={`tactile shrink-0 self-end border px-2 py-2 transition ${
                  pickerOpen
                    ? "border-ember-400/60 bg-ember-400/[0.08] text-ember-400"
                    : "border-white/10 text-bone/85 hover:border-white/25 hover:text-bone"
                }`}
              >
                <Smiley size={16} weight="bold" />
              </button>

              <textarea
                ref={taRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Drop a brief. Roast within reason. Show evidence."
                rows={1}
                maxLength={MAX_LEN + 50}
                className="emoji min-h-[24px] flex-1 resize-none bg-transparent text-[15px] leading-snug text-bone placeholder:text-ink-400 outline-none"
                aria-label="Message"
              />

              <button
                type="submit"
                disabled={!canSend}
                aria-label="Send"
                className="tactile inline-flex shrink-0 items-center justify-center gap-1.5 bg-bone px-3 py-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-ink-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-ink-400"
              >
                Send
                <PaperPlaneTilt size={12} weight="fill" />
              </button>
            </div>

            <div className="mt-1.5 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-300/55">
                Enter to file &middot; Shift+Enter for newline
              </span>
              {text.length > 0 ? (
                <span
                  className={`font-mono text-[10px] tabular-nums ${
                    overLimit ? "text-ember-400" : "text-ink-300/55"
                  }`}
                >
                  {text.length} / {MAX_LEN}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
