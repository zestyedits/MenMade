"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatHeader } from "./_components/ChatHeader";
import { MessageList } from "./_components/MessageList";
import { Composer } from "./_components/Composer";
import { CodeOfConductSheet } from "./_components/CodeOfConductSheet";
import { Roster } from "./_components/Roster";
import { SquadList } from "./_components/SquadList";
import type { Squad, RosterMember } from "./_data/seed";
import type { ModerationVerdict } from "./_data/moderation";
import type { Stamp } from "./_data/stamps";
import { store, type ChatMessage, type ChatReaction } from "../lib/store";
import { getSession } from "../lib/auth";
import {
  useMySquads,
  useMessages,
  useRoster,
  useChatTail,
  sendMessage,
  reportMessage,
  type MySquadRow,
  type RosterRow,
} from "../lib/use-chat";
import { MonoLabel } from "../components/ui/MonoLabel";

// MySquadRow → Squad adapter so the existing SquadList component keeps working
// without a signature change. Roster / replyPool / seedMessages are unused
// downstream of SquadList; we stub them.
function toSquad(row: MySquadRow): Squad {
  return {
    callsign: row.handle,
    name: row.name,
    blurb: row.blurb ?? "",
    cycleCode: row.cycleCode ?? "",
    cycleDay: row.cycleDay ?? 1,
    totalDays: row.totalDays ?? 0,
    intensity: "STEADY",
    focus: "",
    roster: [],
    seedMessages: [],
    replyPool: [],
  };
}

function toRosterMember(r: RosterRow): RosterMember {
  return {
    handle: r.handle,
    name: r.displayName,
    role: r.role === "lead" ? "lead" : "op",
    online: false,
    lastSeenMin: 0,
    streak: 0,
    tz: "",
  };
}

function ChatBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { squads: rawSquads, loading: squadsLoading } = useMySquads();
  const squads = useMemo(() => rawSquads.map(toSquad), [rawSquads]);
  const defaultHandle = rawSquads[0]?.handle ?? "";
  const queryCallsign = searchParams.get("s");

  const activeHandle = useMemo(() => {
    if (queryCallsign && rawSquads.some((s) => s.handle === queryCallsign))
      return queryCallsign;
    return defaultHandle;
  }, [queryCallsign, rawSquads, defaultHandle]);

  const activeRow = rawSquads.find((s) => s.handle === activeHandle) ?? null;
  const showStream = Boolean(queryCallsign && activeRow);

  const {
    messages: liveMessages,
    appendOptimistic,
    replaceOptimistic,
    removeOptimistic,
    upsertFromRealtime,
    reactLocally,
  } = useMessages(activeHandle || null);

  const { members: roster } = useRoster(activeHandle || null);

  // Drive incremental fetch off the latest message we already have. The
  // server only returns rows with sent_at > cursor, so we don't re-pull
  // history on every tick.
  const latestSentAt =
    liveMessages.length > 0
      ? liveMessages[liveMessages.length - 1].sentAtIso
      : null;
  useChatTail(activeHandle || null, latestSentAt, (incoming) => {
    for (const msg of incoming) upsertFromRealtime(msg);
  });

  const [myHandle, setMyHandle] = useState("you");
  const [myName, setMyName] = useState("You");
  const [blockedHandles, setBlockedHandles] = useState<string[]>([]);
  const [cocOpen, setCocOpen] = useState(false);
  const [cocAcked, setCocAcked] = useState(true);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await getSession();
      if (cancelled) return;
      const id = store.getIdentity();
      if (id?.handle) {
        setMyHandle(id.handle);
        setMyName(id.displayName || s?.name || "You");
      } else if (s) {
        setMyHandle(s.handle || "you");
        setMyName(s.name || "You");
      }
    })();
    setBlockedHandles(store.getBlockedHandles());
    const acked = store.hasAcknowledgedChatCOC();
    setCocAcked(acked);
    if (!acked) setCocOpen(true);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeHandle) store.setActiveSquad(activeHandle);
  }, [activeHandle]);

  const visibleMessages = useMemo(
    () => liveMessages.filter((m) => !blockedHandles.includes(m.authorHandle)),
    [liveMessages, blockedHandles],
  );

  const recentByMe = useMemo(
    () =>
      liveMessages
        .filter((m) => m.authorHandle === myHandle)
        .slice(-6)
        .map((m) => ({ body: m.body, sentAtIso: m.sentAtIso })),
    [liveMessages, myHandle],
  );

  const onlineCount = Math.max(roster.length, 1);
  const totalCount = roster.length;

  const railData = useMemo(() => {
    const lastBy: Record<
      string,
      { authorName: string; body: string; sentAtIso: string } | null
    > = {};
    const unreadBy: Record<string, number> = {};
    rawSquads.forEach((s) => {
      lastBy[s.handle] = s.lastMessageAt
        ? { authorName: "—", body: "", sentAtIso: s.lastMessageAt }
        : null;
      unreadBy[s.handle] = 0;
    });
    return { lastBy, unreadBy };
  }, [rawSquads]);

  const handleSelectSquad = useCallback(
    (handle: string) => {
      router.push(`/chat?s=${encodeURIComponent(handle)}`);
    },
    [router],
  );

  const handleBackToList = useCallback(() => {
    router.push("/chat");
  }, [router]);

  const handleSend = useCallback(
    async (body: string, _clientVerdict: ModerationVerdict) => {
      if (!activeHandle) return;
      const optimisticId = `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const optimistic: ChatMessage = {
        id: optimisticId,
        authorHandle: myHandle,
        authorName: myName,
        body,
        sentAtIso: new Date().toISOString(),
      };
      appendOptimistic(optimistic);
      setSendError(null);

      const res = await sendMessage({ squad: activeHandle, body });
      if (res.ok) {
        replaceOptimistic(optimisticId, res.message);
      } else {
        removeOptimistic(optimisticId);
        setSendError(
          res.reason ?? res.error ?? "Couldn't send. Try again shortly.",
        );
      }
    },
    [
      activeHandle,
      myHandle,
      myName,
      appendOptimistic,
      replaceOptimistic,
      removeOptimistic,
    ],
  );

  const handleSendStamp = useCallback(
    async (stamp: Stamp) => {
      if (!activeHandle) return;
      const optimisticId = `opt-stamp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const optimistic: ChatMessage = {
        id: optimisticId,
        authorHandle: myHandle,
        authorName: myName,
        body: "",
        stampId: stamp.id,
        sentAtIso: new Date().toISOString(),
      };
      appendOptimistic(optimistic);
      const res = await sendMessage({
        squad: activeHandle,
        body: ` `,
        stampId: stamp.id,
      });
      if (res.ok) replaceOptimistic(optimisticId, res.message);
      else removeOptimistic(optimisticId);
    },
    [
      activeHandle,
      myHandle,
      myName,
      appendOptimistic,
      replaceOptimistic,
      removeOptimistic,
    ],
  );

  const handleReact = useCallback(
    (id: string, reaction: ChatReaction) => {
      reactLocally(id, reaction);
      // Server-side reaction persistence is Phase 3b — this is local-only.
    },
    [reactLocally],
  );

  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const handleReport = useCallback(
    async (id: string) => {
      setReportedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      const res = await reportMessage(id);
      if (!res.ok) {
        setReportedIds((prev) => prev.filter((x) => x !== id));
      }
    },
    [],
  );

  const handleBlock = useCallback((handle: string) => {
    store.blockHandle(handle);
    setBlockedHandles(store.getBlockedHandles());
  }, []);

  const handleAcceptCOC = useCallback(() => {
    store.acknowledgeChatCOC();
    setCocAcked(true);
  }, []);

  if (!squadsLoading && squads.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="flex max-w-[44ch] flex-col items-center gap-3 text-center">
          <MonoLabel ember>Chat / Channels</MonoLabel>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-ember-400/85">
            Awaiting match
          </p>
          <h1 className="text-[22px] font-semibold text-bone">
            You&rsquo;re between squads.
          </h1>
          <p className="text-[15px] leading-relaxed text-ink-200/80">
            We pair operatives at your intensity and time zone into squads of
            five. Yours isn&rsquo;t formed yet. Until then, you&rsquo;ll land
            in the Founders Circle — every man enlisted so far.
          </p>
          <a
            href="/squads/founders-circle"
            className="mt-3 inline-flex items-center gap-2 border border-white/15 bg-white/[0.03] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-bone transition hover:border-white/30 hover:bg-white/[0.06]"
          >
            Enter Founders Circle
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1">
        <div
          className={`${showStream ? "hidden" : "flex"} w-full lg:flex lg:w-auto`}
        >
          <SquadList
            squads={squads}
            activeCallsign={activeHandle}
            onSelect={handleSelectSquad}
            lastMessageBy={railData.lastBy}
            unreadBy={railData.unreadBy}
            myHandle={myHandle}
          />
        </div>

        {activeRow ? (
          <div
            className={`${
              showStream ? "flex" : "hidden lg:flex"
            } min-h-0 flex-1 flex-col`}
          >
            <ChatHeader
              squadName={activeRow.name}
              callsign={activeRow.handle.toUpperCase()}
              cycleCode={activeRow.cycleCode ?? ""}
              cycleDay={activeRow.cycleDay ?? 1}
              totalDays={activeRow.totalDays ?? 0}
              intensity="STEADY"
              onlineCount={onlineCount}
              totalCount={totalCount}
              onOpenCOC={() => setCocOpen(true)}
              onBack={showStream ? handleBackToList : undefined}
            />

            {!cocAcked ? (
              <div className="border-b border-white/[0.06] bg-white/[0.04] px-5 py-2.5 md:px-10">
                <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3">
                  <p className="text-[12.5px] leading-snug text-bone/85">
                    Squad chat &mdash; roast within reason. Read the bouncer
                    rules.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCocOpen(true)}
                    className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-bone underline underline-offset-4 decoration-bone/50 transition hover:decoration-bone"
                  >
                    View code
                  </button>
                </div>
              </div>
            ) : null}

            {sendError ? (
              <div className="border-b border-red-500/30 bg-red-500/[0.06] px-5 py-2.5 md:px-10">
                <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-red-300/90">
                    {sendError}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSendError(null)}
                    className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-bone/80 transition hover:text-bone"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex min-h-0 flex-1">
              <div className="flex min-w-0 flex-1 flex-col">
                <MessageList
                  messages={visibleMessages}
                  myHandle={myHandle}
                  reportedIds={reportedIds}
                  cycleDay={activeRow.cycleDay ?? 1}
                  roster={roster.map(toRosterMember)}
                  onReact={handleReact}
                  onReport={handleReport}
                  onBlock={handleBlock}
                />

                <Composer
                  onSend={handleSend}
                  onSendStamp={handleSendStamp}
                  recentByMe={recentByMe}
                  squadName={activeRow.name}
                  callsign={activeRow.handle.toUpperCase()}
                  onlineCount={onlineCount}
                  myName={myName}
                />
              </div>

              <Roster
                squadName={activeRow.name}
                callsign={activeRow.handle.toUpperCase()}
                cycleCode={activeRow.cycleCode ?? ""}
                cycleDay={activeRow.cycleDay ?? 1}
                totalDays={activeRow.totalDays ?? 0}
                intensity="STEADY"
                members={roster
                  .filter((m) => !blockedHandles.includes(m.handle))
                  .map(toRosterMember)}
                myHandle={myHandle}
                myName={myName}
              />
            </div>
          </div>
        ) : null}
      </div>

      <CodeOfConductSheet
        open={cocOpen}
        onClose={() => setCocOpen(false)}
        onAccept={handleAcceptCOC}
        showAccept={!cocAcked}
      />
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/60">
            Loading channels...
          </span>
        </div>
      }
    >
      <ChatBody />
    </Suspense>
  );
}
