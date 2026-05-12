"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatHeader } from "./_components/ChatHeader";
import { MessageList } from "./_components/MessageList";
import { Composer } from "./_components/Composer";
import { CodeOfConductSheet } from "./_components/CodeOfConductSheet";
import { Roster } from "./_components/Roster";
import { SquadList } from "./_components/SquadList";
import { mySquads, getSquad } from "./_data/seed";
import type { ModerationVerdict } from "./_data/moderation";
import type { Stamp } from "./_data/stamps";
import { store, type ChatMessage, type ChatReaction } from "../lib/store";
import { getSession } from "../lib/auth";

type SquadState = {
  messages: ChatMessage[];
  reportedIds: string[];
};

function ChatBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const squads = useMemo(() => mySquads(), []);
  const defaultCallsign = squads[0]?.callsign ?? "";
  const queryCallsign = searchParams.get("s");

  // Resolve the active squad. Falls back to the first if missing/invalid.
  const activeCallsign = useMemo(() => {
    if (queryCallsign && squads.some((s) => s.callsign === queryCallsign))
      return queryCallsign;
    return defaultCallsign;
  }, [queryCallsign, squads, defaultCallsign]);
  const activeSquad = getSquad(activeCallsign);

  // Per-squad state, keyed by callsign. Hydrated lazily as squads are visited.
  const [squadStates, setSquadStates] = useState<Record<string, SquadState>>({});
  const [myHandle, setMyHandle] = useState("you");
  const [myName, setMyName] = useState("You");
  const [blockedHandles, setBlockedHandles] = useState<string[]>([]);
  const [cocOpen, setCocOpen] = useState(false);
  const [cocAcked, setCocAcked] = useState(true);
  // Mobile drill-down: when no `?s=`, show the squad list. Tapping a squad
  // pushes ?s=callsign and the stream view appears.
  const showStream = Boolean(queryCallsign && activeSquad);

  // Mount: hydrate identity, blocks, COC, and seed all squad states from store.
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

    const initial: Record<string, SquadState> = {};
    squads.forEach((sq) => {
      const persisted = store.getChatMessages(sq.callsign);
      initial[sq.callsign] = {
        messages: persisted.length > 0 ? persisted : sq.seedMessages,
        reportedIds: store.getReportedMessageIds(sq.callsign),
      };
    });
    setSquadStates(initial);

    return () => {
      cancelled = true;
    };
  }, [squads]);

  // Persist active squad (purely for the dashboard widgets that may want it).
  useEffect(() => {
    if (activeCallsign) store.setActiveSquad(activeCallsign);
  }, [activeCallsign]);

  // Persist messages whenever they change.
  useEffect(() => {
    Object.entries(squadStates).forEach(([cs, st]) => {
      if (st.messages.length === 0) return;
      store.setChatMessages(cs, st.messages);
    });
  }, [squadStates]);

  // Drip simulated replies into ALL squads, not just the active one — so
  // when the user comes back to a quiet squad, it has new traffic.
  const tickRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  useEffect(() => {
    function scheduleFor(callsign: string) {
      const wait = 35_000 + Math.random() * 75_000;
      const t = setTimeout(() => {
        const sq = getSquad(callsign);
        if (!sq) return;
        const pick =
          sq.replyPool[Math.floor(Math.random() * sq.replyPool.length)];
        setSquadStates((prev) => {
          const cur = prev[callsign];
          if (!cur) return prev;
          return {
            ...prev,
            [callsign]: {
              ...cur,
              messages: [
                ...cur.messages,
                {
                  id: `sim-${callsign}-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 6)}`,
                  authorHandle: pick.authorHandle,
                  authorName: pick.authorName,
                  body: pick.body,
                  sentAtIso: new Date().toISOString(),
                },
              ],
            },
          };
        });
        scheduleFor(callsign);
      }, wait);
      tickRefs.current.set(callsign, t);
    }

    squads.forEach((s) => scheduleFor(s.callsign));
    return () => {
      tickRefs.current.forEach((t) => clearTimeout(t));
      tickRefs.current.clear();
    };
  }, [squads]);

  const visibleMessages = useMemo(() => {
    if (!activeSquad) return [];
    const all = squadStates[activeSquad.callsign]?.messages ?? [];
    return all.filter((m) => !blockedHandles.includes(m.authorHandle));
  }, [squadStates, activeSquad, blockedHandles]);

  const recentByMe = useMemo(() => {
    if (!activeSquad) return [];
    return (squadStates[activeSquad.callsign]?.messages ?? [])
      .filter((m) => m.authorHandle === myHandle)
      .slice(-6)
      .map((m) => ({ body: m.body, sentAtIso: m.sentAtIso }));
  }, [squadStates, activeSquad, myHandle]);

  const onlineCount = activeSquad
    ? activeSquad.roster.filter(
        (m) => m.online && !blockedHandles.includes(m.handle),
      ).length + 1
    : 0;
  const totalCount = activeSquad ? activeSquad.roster.length + 1 : 0;

  // Last-message + unread map for the squad rail.
  const railData = useMemo(() => {
    const lastBy: Record<string, { authorName: string; body: string; sentAtIso: string } | null> = {};
    const unreadBy: Record<string, number> = {};
    squads.forEach((s) => {
      const list = squadStates[s.callsign]?.messages ?? [];
      const visible = list.filter((m) => !blockedHandles.includes(m.authorHandle));
      const last = visible[visible.length - 1];
      lastBy[s.callsign] = last
        ? {
            authorName: last.authorHandle === myHandle ? "You" : last.authorName,
            body: last.body,
            sentAtIso: last.sentAtIso,
          }
        : null;
      // No real unread tracking yet — count messages from others in the
      // last 5 min if this is NOT the active squad. Cheap proxy.
      if (s.callsign === activeCallsign) {
        unreadBy[s.callsign] = 0;
      } else {
        const cutoff = Date.now() - 5 * 60_000;
        unreadBy[s.callsign] = visible.filter(
          (m) =>
            m.authorHandle !== myHandle &&
            new Date(m.sentAtIso).getTime() > cutoff,
        ).length;
      }
    });
    return { lastBy, unreadBy };
  }, [squads, squadStates, blockedHandles, activeCallsign, myHandle]);

  const handleSelectSquad = useCallback(
    (callsign: string) => {
      router.push(`/chat?s=${encodeURIComponent(callsign)}`);
    },
    [router],
  );

  const handleBackToList = useCallback(() => {
    router.push("/chat");
  }, [router]);

  const handleSend = useCallback(
    (body: string, verdict: ModerationVerdict) => {
      if (!activeSquad) return;
      const newMsg: ChatMessage = {
        id: `me-${activeSquad.callsign}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 6)}`,
        authorHandle: myHandle,
        authorName: myName,
        body,
        sentAtIso: new Date().toISOString(),
        softFlagged: verdict === "soft-warn",
      };
      setSquadStates((prev) => ({
        ...prev,
        [activeSquad.callsign]: {
          ...prev[activeSquad.callsign],
          messages: [...(prev[activeSquad.callsign]?.messages ?? []), newMsg],
        },
      }));
    },
    [activeSquad, myHandle, myName],
  );

  const handleSendStamp = useCallback(
    (stamp: Stamp) => {
      if (!activeSquad) return;
      const newMsg: ChatMessage = {
        id: `me-${activeSquad.callsign}-stamp-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 6)}`,
        authorHandle: myHandle,
        authorName: myName,
        body: "",
        stampId: stamp.id,
        sentAtIso: new Date().toISOString(),
      };
      setSquadStates((prev) => ({
        ...prev,
        [activeSquad.callsign]: {
          ...prev[activeSquad.callsign],
          messages: [...(prev[activeSquad.callsign]?.messages ?? []), newMsg],
        },
      }));
    },
    [activeSquad, myHandle, myName],
  );

  const handleReact = useCallback(
    (id: string, reaction: ChatReaction) => {
      if (!activeSquad) return;
      setSquadStates((prev) => {
        const cur = prev[activeSquad.callsign];
        if (!cur) return prev;
        return {
          ...prev,
          [activeSquad.callsign]: {
            ...cur,
            messages: cur.messages.map((m) => {
              if (m.id !== id) return m;
              const next = { ...m.reactions };
              next[reaction] = (next[reaction] ?? 0) + 1;
              return { ...m, reactions: next };
            }),
          },
        };
      });
    },
    [activeSquad],
  );

  const handleReport = useCallback(
    (id: string) => {
      if (!activeSquad) return;
      store.reportMessage(activeSquad.callsign, id);
      setSquadStates((prev) => ({
        ...prev,
        [activeSquad.callsign]: {
          ...prev[activeSquad.callsign],
          reportedIds: store.getReportedMessageIds(activeSquad.callsign),
        },
      }));
    },
    [activeSquad],
  );

  const handleBlock = useCallback((handle: string) => {
    store.blockHandle(handle);
    setBlockedHandles(store.getBlockedHandles());
  }, []);

  const handleAcceptCOC = useCallback(() => {
    store.acknowledgeChatCOC();
    setCocAcked(true);
  }, []);

  const reportedIds = activeSquad
    ? squadStates[activeSquad.callsign]?.reportedIds ?? []
    : [];

  // No squads at all — empty state.
  if (squads.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="max-w-[40ch] text-center">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-ember-400/85">
            No squads on file
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-200/80">
            You haven&rsquo;t enlisted yet. Pick a cycle to get matched.
          </p>
          <a
            href="/cycles"
            className="mt-6 inline-flex items-center gap-2 bg-bone px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-950 transition hover:bg-white"
          >
            Find a squad
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1">
        {/* SQUAD RAIL — always visible on lg+, only on mobile when no squad selected */}
        <div
          className={`${showStream ? "hidden" : "flex"} w-full lg:flex lg:w-auto`}
        >
          <SquadList
            squads={squads}
            activeCallsign={activeCallsign}
            onSelect={handleSelectSquad}
            lastMessageBy={railData.lastBy}
            unreadBy={railData.unreadBy}
            myHandle={myHandle}
          />
        </div>

        {/* STREAM + COMPOSER */}
        {activeSquad ? (
          <div
            className={`${
              showStream ? "flex" : "hidden lg:flex"
            } min-h-0 flex-1 flex-col`}
          >
            <ChatHeader
              squadName={activeSquad.name}
              callsign={activeSquad.callsign}
              cycleCode={activeSquad.cycleCode}
              cycleDay={activeSquad.cycleDay}
              totalDays={activeSquad.totalDays}
              intensity={activeSquad.intensity}
              onlineCount={onlineCount}
              totalCount={totalCount}
              onOpenCOC={() => setCocOpen(true)}
              onBack={showStream ? handleBackToList : undefined}
            />

            {!cocAcked ? (
              <div className="border-b border-ember-400/30 bg-ember-400/[0.05] px-5 py-2.5 md:px-10">
                <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ember-400/90">
                    Squad chat &mdash; roast within reason. Read the bouncer rules.
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

            <div className="flex min-h-0 flex-1">
              <div className="flex min-w-0 flex-1 flex-col">
                <MessageList
                  messages={visibleMessages}
                  myHandle={myHandle}
                  reportedIds={reportedIds}
                  cycleDay={activeSquad.cycleDay}
                  roster={activeSquad.roster}
                  onReact={handleReact}
                  onReport={handleReport}
                  onBlock={handleBlock}
                />

                <Composer
                  onSend={handleSend}
                  onSendStamp={handleSendStamp}
                  recentByMe={recentByMe}
                  squadName={activeSquad.name}
                  callsign={activeSquad.callsign}
                  onlineCount={onlineCount}
                  myName={myName}
                />
              </div>

              <Roster
                squadName={activeSquad.name}
                callsign={activeSquad.callsign}
                cycleCode={activeSquad.cycleCode}
                cycleDay={activeSquad.cycleDay}
                totalDays={activeSquad.totalDays}
                intensity={activeSquad.intensity}
                members={activeSquad.roster.filter(
                  (m) => !blockedHandles.includes(m.handle),
                )}
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
