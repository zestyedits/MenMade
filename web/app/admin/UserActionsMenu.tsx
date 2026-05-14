"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Per-row admin actions menu. Renders a kebab button; clicking opens a
 * popover with the available actions. Destructive actions (suspend,
 * delete, revoke seat) prompt for a reason via a tiny inline form
 * rather than a separate modal — keeps the bundle small and the flow
 * one click closer.
 *
 * State:
 *   - "closed"          | no menu visible
 *   - "menu"            | menu open, picking an action
 *   - "reason"          | promptVariant set, awaiting reason input
 *   - "confirming"      | promptVariant set, awaiting confirm (no reason)
 *   - "pending"         | request in flight
 *   - "done"            | success — flashes briefly then router.refresh()
 *   - "error"           | error — shows message + retry
 */

type Variant =
  | "suspend"
  | "unsuspend"
  | "reset-password"
  | "delete"
  | "grant-founder-seat"
  | "revoke-founder-seat"
  | "promote";

type Status = "closed" | "menu" | "pending" | "done" | "error";

type PromptKind = "reason" | "confirm" | null;

type Props = {
  userId: string;
  email: string;
  suspended: boolean;
  hasFounderSeat: boolean;
  isSelf: boolean;
};

const VARIANTS: Array<{
  key: Variant;
  label: string;
  promptKind: PromptKind;
  destructive: boolean;
  needsSeat?: boolean;
  needsNoSeat?: boolean;
  hideWhenSuspended?: boolean;
  hideWhenActive?: boolean;
  hideForSelf?: boolean;
}> = [
  {
    key: "suspend",
    label: "Suspend",
    promptKind: "reason",
    destructive: true,
    hideWhenSuspended: true,
    hideForSelf: true,
  },
  {
    key: "unsuspend",
    label: "Unsuspend",
    promptKind: "confirm",
    destructive: false,
    hideWhenActive: true,
  },
  {
    key: "reset-password",
    label: "Reset password",
    promptKind: "confirm",
    destructive: false,
  },
  {
    key: "grant-founder-seat",
    label: "Grant founder seat",
    promptKind: "confirm",
    destructive: false,
    needsNoSeat: true,
  },
  {
    key: "revoke-founder-seat",
    label: "Revoke founder seat",
    promptKind: "reason",
    destructive: true,
    needsSeat: true,
  },
  {
    key: "promote",
    label: "Promote to admin",
    promptKind: "confirm",
    destructive: false,
    hideForSelf: true,
  },
  {
    key: "delete",
    label: "Delete account",
    promptKind: "reason",
    destructive: true,
    hideForSelf: true,
  },
];

export function UserActionsMenu({
  userId,
  email,
  suspended,
  hasFounderSeat,
  isSelf,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>("closed");
  const [active, setActive] = useState<Variant | null>(null);
  const [reason, setReason] = useState("");
  // Duration in hours for suspensions. null = indefinite. Presets shown
  // in the confirm panel; admin can pick any of them or leave indefinite.
  const [durationHours, setDurationHours] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // Click outside closes the menu.
  useEffect(() => {
    if (status === "closed") return;
    function onDown(e: MouseEvent) {
      if (!popRef.current?.contains(e.target as Node)) {
        if (status !== "pending") closeAll();
      }
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function closeAll() {
    setStatus("closed");
    setActive(null);
    setReason("");
    setDurationHours(null);
    setErrorMessage(null);
  }

  function pick(v: Variant) {
    const cfg = VARIANTS.find((x) => x.key === v);
    if (!cfg) return;
    setActive(v);
    setErrorMessage(null);
    setReason("");
    setDurationHours(null);
    // Both prompt kinds keep the menu open in a follow-up state;
    // we re-use `status === "menu"` to mean "showing the prompt".
    setStatus("menu");
  }

  async function execute() {
    if (!active) return;
    const cfg = VARIANTS.find((x) => x.key === active);
    if (!cfg) return;

    if (cfg.promptKind === "reason" && reason.trim().length < 1) {
      setErrorMessage("Reason is required.");
      return;
    }

    setStatus("pending");
    setErrorMessage(null);

    const path = buildPath(active, userId);
    const method = active === "promote" ? "POST" : "POST";
    const body = buildBody(active, reason, durationHours);

    try {
      const res = await fetch(path, {
        method,
        headers: { "content-type": "application/json" },
        body: body ? JSON.stringify(body) : null,
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: boolean; error?: string }
        | null;
      if (!res.ok || !data || !data.ok) {
        const msg =
          (data && data.error) || `Failed (${res.status}).`;
        setStatus("error");
        setErrorMessage(msg);
        return;
      }
      setStatus("done");
      setTimeout(() => {
        closeAll();
        startTransition(() => router.refresh());
      }, 600);
    } catch {
      setStatus("error");
      setErrorMessage("Network failure.");
    }
  }

  const filteredVariants = VARIANTS.filter((v) => {
    if (v.hideForSelf && isSelf) return false;
    if (v.hideWhenSuspended && suspended) return false;
    if (v.hideWhenActive && !suspended) return false;
    if (v.needsSeat && !hasFounderSeat) return false;
    if (v.needsNoSeat && hasFounderSeat) return false;
    return true;
  });

  if (status === "closed") {
    return (
      <button
        type="button"
        onClick={() => setStatus("menu")}
        aria-label={`Actions for ${email}`}
        className="inline-flex h-6 w-6 items-center justify-center font-mono text-[16px] leading-none text-ink-300/65 hover:bg-white/[0.04] hover:text-bone"
      >
        ⋮
      </button>
    );
  }

  return (
    <div className="relative" ref={popRef}>
      <button
        type="button"
        onClick={() => (status === "pending" ? null : closeAll())}
        aria-label="Close actions"
        className="inline-flex h-6 w-6 items-center justify-center font-mono text-[16px] leading-none text-ember-400 hover:bg-white/[0.04]"
      >
        ⋮
      </button>
      <div className="absolute right-0 z-30 mt-1 w-[260px] border border-white/[0.08] bg-ink-900 p-2 shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
        <p className="px-2 pb-2 pt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
          {active ? "Confirm" : "Actions"}
        </p>

        {/* Variant picker */}
        {!active ? (
          <ul className="flex flex-col">
            {filteredVariants.length === 0 ? (
              <li className="px-2 py-3 text-center text-[12px] text-ink-300/60">
                No actions available.
              </li>
            ) : (
              filteredVariants.map((v) => (
                <li key={v.key}>
                  <button
                    type="button"
                    onClick={() => pick(v.key)}
                    className={`block w-full px-2 py-2 text-left text-[12.5px] hover:bg-white/[0.05] ${
                      v.destructive ? "text-red-300" : "text-bone"
                    }`}
                  >
                    {v.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : (
          <ConfirmPanel
            email={email}
            variant={active}
            reason={reason}
            setReason={setReason}
            durationHours={durationHours}
            setDurationHours={setDurationHours}
            errorMessage={errorMessage}
            status={status}
            onCancel={closeAll}
            onConfirm={execute}
          />
        )}
      </div>
    </div>
  );
}

function ConfirmPanel({
  email,
  variant,
  reason,
  setReason,
  durationHours,
  setDurationHours,
  errorMessage,
  status,
  onCancel,
  onConfirm,
}: {
  email: string;
  variant: Variant;
  reason: string;
  setReason: (s: string) => void;
  durationHours: number | null;
  setDurationHours: (n: number | null) => void;
  errorMessage: string | null;
  status: Status;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cfg = VARIANTS.find((v) => v.key === variant)!;
  const needsReason = cfg.promptKind === "reason";
  const isSuspend = variant === "suspend";

  if (status === "done") {
    return (
      <div className="px-2 py-3 text-[12.5px] text-ember-400">
        Done. Email queued to the user.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-1">
      <p className="px-1 text-[12px] leading-snug text-ink-200/85">
        <span className="font-semibold text-bone">{cfg.label}</span> for{" "}
        <span className="font-mono">{email}</span>?
      </p>
      {needsReason ? (
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder={
            isSuspend
              ? "Reason (shown to the user via email and on sign-in)"
              : "Reason (required, 1–500 chars)"
          }
          maxLength={500}
          className="border border-white/[0.1] bg-ink-900/60 px-2 py-1.5 text-[12px] text-bone placeholder:text-ink-300/40 focus:border-ember-400 focus:outline-none"
        />
      ) : null}
      {isSuspend ? (
        <div className="flex flex-col gap-1 px-1">
          <label
            htmlFor="suspend-duration"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/70"
          >
            Duration
          </label>
          <select
            id="suspend-duration"
            value={durationHours == null ? "indefinite" : String(durationHours)}
            onChange={(e) => {
              const v = e.target.value;
              setDurationHours(v === "indefinite" ? null : Number(v));
            }}
            className="border border-white/[0.1] bg-ink-900/60 px-2 py-1.5 text-[12px] text-bone focus:border-ember-400 focus:outline-none"
          >
            <option value="indefinite">Indefinite (until lifted)</option>
            <option value="24">24 hours</option>
            <option value="72">3 days</option>
            <option value="168">7 days</option>
            <option value="720">30 days</option>
            <option value="2160">90 days</option>
          </select>
        </div>
      ) : null}
      {errorMessage ? (
        <p className="px-1 text-[11px] text-red-300">{errorMessage}</p>
      ) : null}
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={status === "pending"}
          className="px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/70 hover:text-bone disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={status === "pending"}
          className={`px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] ${
            cfg.destructive
              ? "bg-red-500/15 text-red-300 hover:bg-red-500/25"
              : "bg-ember-400/15 text-ember-400 hover:bg-ember-400/25"
          } disabled:opacity-50`}
        >
          {status === "pending" ? "Working…" : "Confirm"}
        </button>
      </div>
    </div>
  );
}

function buildPath(variant: Variant, userId: string): string {
  const base = `/api/admin/users/${userId}`;
  switch (variant) {
    case "suspend":
      return `${base}/suspend`;
    case "unsuspend":
      return `${base}/unsuspend`;
    case "reset-password":
      return `${base}/reset-password`;
    case "delete":
      return `${base}/delete`;
    case "grant-founder-seat":
      return `${base}/grant-founder-seat`;
    case "revoke-founder-seat":
      return `${base}/revoke-founder-seat`;
    case "promote":
      return `${base}/promote`;
  }
}

function buildBody(
  variant: Variant,
  reason: string,
  durationHours: number | null,
): Record<string, unknown> | null {
  if (variant === "suspend") {
    return durationHours == null
      ? { reason }
      : { reason, durationHours };
  }
  if (variant === "revoke-founder-seat" || variant === "delete") {
    return { reason };
  }
  return null;
}
