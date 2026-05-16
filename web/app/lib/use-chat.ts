"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatReaction } from "./store";

/**
 * Chat data hooks. Each one wraps a single fetch + a single source of truth,
 * so the chat page can compose them without juggling state shapes.
 *
 *   useMySquads()           — list of squads the signed-in user belongs to
 *   useMessages(handle)     — paginated history for one squad, oldest-first
 *   useChatTail()           — short-poll incremental tail (since=<iso>)
 *
 * NOTE: We deliberately do NOT use Supabase Realtime postgres_changes here.
 * The 2026-05 security audit found that legacy postgres_changes mode delivers
 * full row payloads to any authenticated subscriber, bypassing RLS. Until
 * Phase 3b wires Realtime Authorization (private channels + realtime.messages
 * RLS), we short-poll the RLS-gated /api/chat/messages?since=... endpoint
 * every 4s. Acceptable for the founder cohort; revisit at scale.
 */

export type MySquadRow = {
  id: string;
  handle: string;
  name: string;
  callsign: string;
  kind: "private" | "founders_circle";
  blurb: string | null;
  cycleCode: string | null;
  cycleDay: number;
  totalDays: number | null;
  role: "member" | "lead" | "founder";
  lastMessageAt: string | null;
};

export type RosterRow = {
  userId: string;
  handle: string;
  displayName: string;
  role: "member" | "lead" | "founder";
  joinedAt: string;
};

type ApiOk<T> = { ok: true } & T;
type ApiErr = { ok: false; error: string };

async function fetchJson<T>(url: string, init?: RequestInit): Promise<ApiOk<T> | ApiErr> {
  try {
    const res = await fetch(url, { credentials: "same-origin", ...init });
    return (await res.json()) as ApiOk<T> | ApiErr;
  } catch (err) {
    console.warn("[use-chat] fetch failed:", url, err);
    return { ok: false, error: "Network error." };
  }
}

export function useMySquads(): {
  squads: MySquadRow[];
  loading: boolean;
  reload: () => void;
} {
  const [squads, setSquads] = useState<MySquadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchJson<{ squads: MySquadRow[] }>("/api/squads/me").then((res) => {
      if (cancelled) return;
      if (res.ok) setSquads(res.squads);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { squads, loading, reload };
}

export function useRoster(handle: string | null): {
  members: RosterRow[];
  loading: boolean;
} {
  const [members, setMembers] = useState<RosterRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!handle) {
      setMembers([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchJson<{ members: RosterRow[] }>(
      `/api/squads/members?squad=${encodeURIComponent(handle)}`,
    ).then((res) => {
      if (cancelled) return;
      if (res.ok) setMembers(res.members);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  return { members, loading };
}

export function useMessages(handle: string | null): {
  messages: ChatMessage[];
  loading: boolean;
  appendOptimistic: (msg: ChatMessage) => void;
  replaceOptimistic: (optimisticId: string, real: ChatMessage) => void;
  removeOptimistic: (optimisticId: string) => void;
  upsertFromRealtime: (msg: ChatMessage) => void;
  reactLocally: (id: string, reaction: ChatReaction) => void;
} {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!handle) {
      setMessages([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchJson<{ messages: ChatMessage[] }>(
      `/api/chat/messages?squad=${encodeURIComponent(handle)}&limit=50`,
    ).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        // Server returns newest-first; we render oldest-first.
        setMessages([...res.messages].reverse());
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  const appendOptimistic = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const replaceOptimistic = useCallback(
    (optimisticId: string, real: ChatMessage) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === real.id);
        if (exists) return prev.filter((m) => m.id !== optimisticId);
        return prev.map((m) => (m.id === optimisticId ? real : m));
      });
    },
    [],
  );

  const removeOptimistic = useCallback((optimisticId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
  }, []);

  const upsertFromRealtime = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const reactLocally = useCallback((id: string, reaction: ChatReaction) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const next = { ...(m.reactions ?? {}) };
        next[reaction] = (next[reaction] ?? 0) + 1;
        return { ...m, reactions: next };
      }),
    );
  }, []);

  return {
    messages,
    loading,
    appendOptimistic,
    replaceOptimistic,
    removeOptimistic,
    upsertFromRealtime,
    reactLocally,
  };
}

const TAIL_INTERVAL_MS = 4_000;

export function useChatTail(
  squadHandle: string | null,
  latestSentAt: string | null,
  onTail: (msgs: ChatMessage[]) => void,
) {
  const onTailRef = useRef(onTail);
  onTailRef.current = onTail;
  const cursorRef = useRef<string | null>(latestSentAt);
  cursorRef.current = latestSentAt;

  useEffect(() => {
    if (!squadHandle) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      if (cancelled) return;
      const cursor = cursorRef.current;
      const qs = new URLSearchParams({ squad: squadHandle!, limit: "50" });
      if (cursor) qs.set("since", cursor);
      const res = await fetchJson<{ messages: ChatMessage[] }>(
        `/api/chat/messages?${qs.toString()}`,
      );
      if (!cancelled && res.ok && res.messages.length > 0) {
        // API returns newest-first; flip to oldest-first for append semantics.
        const ordered = [...res.messages].reverse();
        onTailRef.current(ordered);
      }
      if (!cancelled) timer = setTimeout(tick, TAIL_INTERVAL_MS);
    }

    timer = setTimeout(tick, TAIL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [squadHandle]);
}

export async function sendMessage(opts: {
  squad: string;
  body: string;
  stampId?: string;
}): Promise<
  | { ok: true; verdict: "ok" | "soft-warn"; message: ChatMessage }
  | { ok: false; verdict?: "hard-block"; reason?: string; error?: string }
> {
  const res = await fetch("/api/chat/messages", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(opts),
  });
  return (await res.json()) as Awaited<ReturnType<typeof sendMessage>>;
}

export async function reportMessage(messageId: string, reason?: string) {
  const res = await fetch("/api/chat/report", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messageId, reason }),
  });
  return (await res.json()) as { ok: boolean; error?: string };
}
