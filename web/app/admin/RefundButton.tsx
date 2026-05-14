"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/Button";

/**
 * One-row refund control. The server has already decided whether this
 * subscription is refundable; we just show the button in the right state
 * and POST when clicked.
 *
 * Two-step confirm: first click arms, second click fires. This is the
 * cheapest possible "are you sure" without a modal library. The button
 * disarms after 5 seconds.
 *
 * On success: router.refresh() pulls fresh server data so the row
 * updates in place (status → 'refunded', refundable flips to false).
 */
type Props = {
  userId: string;
  email: string;
  refundable: boolean;
  denyReason: string | null;
};

type State =
  | { kind: "idle" }
  | { kind: "armed" }
  | { kind: "pending" }
  | { kind: "done"; amount: number | null; refundId: string }
  | { kind: "error"; message: string };

export function RefundButton({ userId, email, refundable, denyReason }: Props) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "idle" });
  const [, startTransition] = useTransition();

  if (!refundable) {
    return (
      <span
        title={denyReason ?? undefined}
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/55"
      >
        {denyReason ? "n/a" : "—"}
      </span>
    );
  }

  if (state.kind === "done") {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ember-400">
        Refunded
        {state.amount != null
          ? ` · $${(state.amount / 100).toFixed(2)}`
          : null}
      </span>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ember-400">
          {state.message}
        </span>
        <button
          onClick={() => setState({ kind: "idle" })}
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-200/70 hover:text-bone"
        >
          Retry
        </button>
      </div>
    );
  }

  async function fire() {
    setState({ kind: "pending" });
    try {
      const res = await fetch("/api/admin/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: true; refundId: string; amount: number | null }
        | { ok: false; error: string }
        | null;
      if (!res.ok || !data || !("ok" in data) || !data.ok) {
        const msg =
          data && "error" in data ? data.error : "Refund failed.";
        setState({ kind: "error", message: msg });
        return;
      }
      setState({
        kind: "done",
        refundId: data.refundId,
        amount: data.amount,
      });
      startTransition(() => router.refresh());
    } catch {
      setState({ kind: "error", message: "Network failure." });
    }
  }

  if (state.kind === "armed") {
    // 5-second window to actually fire.
    setTimeout(() => {
      setState((s) => (s.kind === "armed" ? { kind: "idle" } : s));
    }, 5000);

    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={fire}
        aria-label={`Confirm refund for ${email}`}
      >
        Confirm refund
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="tertiary"
      disabled={state.kind === "pending"}
      onClick={() => setState({ kind: "armed" })}
    >
      {state.kind === "pending" ? "Working…" : "Issue refund"}
    </Button>
  );
}
