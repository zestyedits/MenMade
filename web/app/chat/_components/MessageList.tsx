"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import type { ChatMessage, ChatReaction } from "../../lib/store";
import type { RosterMember } from "../_data/seed";
import { MessageItem } from "./MessageItem";
import { DayDivider } from "./DayDivider";

type Props = {
  messages: ChatMessage[];
  myHandle: string;
  reportedIds: string[];
  cycleDay?: number;
  roster: RosterMember[];
  onReact: (id: string, reaction: ChatReaction) => void;
  onReport: (id: string) => void;
  onBlock: (handle: string) => void;
};

const RUN_GAP_MS = 5 * 60 * 1000;

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(iso: string): { label: string; detail: string } {
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round(
    (startOfToday.getTime() - startOfDay.getTime()) / 86_400_000,
  );

  const label = (() => {
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) {
      return d.toLocaleDateString(undefined, { weekday: "long" });
    }
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  })();

  const detail = d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return { label, detail };
}

type Row =
  | { kind: "divider"; key: string; label: string; detail: string }
  | {
      kind: "message";
      key: string;
      message: ChatMessage;
      isRunLead: boolean;
    };

export function MessageList({
  messages,
  myHandle,
  reportedIds,
  cycleDay,
  roster,
  onReact,
  onReport,
  onBlock,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | null>(null);

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    let lastDay = "";
    let lastAuthor = "";
    let lastTime = 0;
    messages.forEach((m) => {
      const dKey = dayKey(m.sentAtIso);
      if (dKey !== lastDay) {
        const { label, detail } = dayLabel(m.sentAtIso);
        out.push({
          kind: "divider",
          key: `d-${dKey}`,
          label,
          detail,
        });
        lastDay = dKey;
        lastAuthor = ""; // force a new run after a day boundary
      }
      const t = new Date(m.sentAtIso).getTime();
      const isRunLead =
        m.authorHandle !== lastAuthor || t - lastTime > RUN_GAP_MS;
      out.push({ kind: "message", key: m.id, message: m, isRunLead });
      lastAuthor = m.authorHandle;
      lastTime = t;
    });
    return out;
  }, [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const last = messages[messages.length - 1];
    if (!last) return;
    if (last.id === lastIdRef.current) return;
    lastIdRef.current = last.id;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 240 || last.authorHandle === myHandle) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, myHandle]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="max-w-[40ch] text-center">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-ember-400/85">
            Nothing to print
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-200/80">
            Field channel quiet. Either the squad is heads-down or
            something&rsquo;s wrong. Open the column.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="chat-stream min-h-0 flex-1 overflow-y-auto"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      <ul className="flex w-full flex-col pb-12 pt-3">
        <AnimatePresence initial={false}>
          {rows.map((r) =>
            r.kind === "divider" ? (
              <DayDivider
                key={r.key}
                label={r.label}
                detail={r.detail}
                cycleDay={r.label === "Today" ? cycleDay : undefined}
              />
            ) : (
              <MessageItem
                key={r.key}
                message={r.message}
                isMe={r.message.authorHandle === myHandle}
                isRunLead={r.isRunLead}
                reportedAlready={reportedIds.includes(r.message.id)}
                roster={roster}
                onReact={onReact}
                onReport={onReport}
                onBlock={onBlock}
              />
            ),
          )}
        </AnimatePresence>
      </ul>
    </div>
  );
}
