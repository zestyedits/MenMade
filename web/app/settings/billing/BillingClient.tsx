"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  AppleLogo,
  AndroidLogo,
  Lock,
  ArrowRight,
  Crown,
  Lightning,
  Receipt,
  Warning,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Section } from "../../components/ui/Section";
import { Button } from "../../components/ui/Button";
import { EmbeddedCheckoutDrawer } from "./EmbeddedCheckoutDrawer";

// Plan + Subscription shape kept local to this client file now that
// settings/billing is server-fed. The store.ts types still exist for
// non-billing surfaces.
export type Plan =
  | "free"
  | "operator-monthly"
  | "operator-annual"
  | "founder";

export type Subscription = {
  plan: Plan;
  startedAtIso: string | null;
  renewsAtIso: string | null;
  founderSeatNumber: number | null;
  cancelAtPeriodEnd: boolean;
};

type BillingClientProps = {
  initialSub: Subscription;
  founderClaimed: number;
  founderCap: number;
};

const PLAN_LABEL: Record<Plan, string> = {
  free: "Free Operative",
  "operator-monthly": "Operator (Monthly)",
  "operator-annual": "Operator (Annual)",
  founder: "Founder's Pass",
};

const PLAN_PRICE: Record<Plan, string> = {
  free: "$0",
  "operator-monthly": "$14 / mo",
  "operator-annual": "$129 / yr",
  founder: "$299 one-time",
};

export default function BillingClient({
  initialSub,
  founderClaimed,
  founderCap,
}: BillingClientProps) {
  const router = useRouter();
  // Read the subscription directly from the prop, not from local state.
  // The server component re-fetches on router.refresh() after cancel/resume,
  // pushing fresh data down as a new prop. useState would freeze the
  // initial value at mount and ignore the update.
  const sub = initialSub;
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [busyPlan, setBusyPlan] = useState<Plan | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [resumeBusy, setResumeBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutSecret, setCheckoutSecret] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Local alias preserves the original variable name throughout the
  // JSX below without forcing a rename of every reference.
  const FOUNDER_PASS_CAP = founderCap;

  /**
   * Opens the Stripe Embedded Checkout drawer for the chosen plan.
   * Response is `{ ok, clientSecret, sessionId, error? }`. The drawer
   * mounts as soon as we have a clientSecret; Stripe.js renders inside
   * an iframe sandboxed by Stripe. Errors surface as inline copy.
   */
  async function startCheckout(plan: Plan) {
    setError(null);
    setBusyPlan(plan);
    try {
      const priceKey =
        plan === "founder" ? "founders-pass" : plan;
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ price: priceKey }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        clientSecret?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.clientSecret) {
        if (data.error === "sold-out") {
          setError("Founder's Pass is sold out. 500 seats, all claimed.");
        } else {
          setError(data.error ?? "Couldn't start checkout. Try again.");
        }
        return;
      }
      setCheckoutSecret(data.clientSecret);
    } catch {
      setError("Network hiccup. Try again.");
    } finally {
      setBusyPlan(null);
    }
  }

  function closeCheckout() {
    setCheckoutSecret(null);
  }

  /** Opens Stripe-hosted billing portal for plan + card management. */
  async function openPortal() {
    setError(null);
    setPortalBusy(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json()) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.url) {
        setError(data.error ?? "Couldn't open billing portal.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network hiccup. Try again.");
    } finally {
      setPortalBusy(false);
    }
  }

  function applyPlan(plan: Plan) {
    // Defer to checkout for paid plans. Cancel is handled in the
    // Stripe portal — there's no longer a local "free" path.
    startTransition(() => {
      if (plan !== "free") startCheckout(plan);
    });
  }

  /**
   * Schedules cancellation at the end of the current period via
   * /api/billing/cancel. The user keeps access until then. We refresh
   * the page so the Section copy + button labels flip to the
   * "cancel pending" state without a manual reload.
   */
  async function cancel() {
    setError(null);
    setCancelBusy(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Couldn't cancel. Try again.");
        return;
      }
      setShowCancelConfirm(false);
      router.refresh();
    } catch {
      setError("Network hiccup. Try again.");
    } finally {
      setCancelBusy(false);
    }
  }

  /** Reverses a pending cancellation while still in the grace period. */
  async function resume() {
    setError(null);
    setResumeBusy(true);
    try {
      const res = await fetch("/api/billing/resume", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Couldn't resume. Try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network hiccup. Try again.");
    } finally {
      setResumeBusy(false);
    }
  }

  const isFree = sub.plan === "free";
  const isFounder = sub.plan === "founder";
  const isOperator =
    sub.plan === "operator-monthly" || sub.plan === "operator-annual";
  const founderRemaining = founderCap - founderClaimed;

  return (
    <>
      <EmbeddedCheckoutDrawer
        clientSecret={checkoutSecret}
        onClose={closeCheckout}
      />
      <Section
        kicker="01 / Active plan"
        title={PLAN_LABEL[sub.plan]}
        description={
          isFounder ? (
            <>
              Founder&rsquo;s Pass holder &mdash; seat #
              <span className="text-bone">{sub.founderSeatNumber}</span> of{" "}
              {FOUNDER_PASS_CAP}. All current and future Operator features
              locked in at the founding price. No renewal.
            </>
          ) : isOperator && sub.cancelAtPeriodEnd ? (
            <>
              Scheduled to end{" "}
              <span className="text-bone">
                {sub.renewsAtIso
                  ? new Date(sub.renewsAtIso).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "soon"}
              </span>
              . You keep Operator features until then. Resume any time below.
            </>
          ) : isOperator ? (
            <>
              Renews{" "}
              <span className="text-bone">
                {sub.renewsAtIso
                  ? new Date(sub.renewsAtIso).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </span>
              . Cancel any time below.
            </>
          ) : (
            <>
              You&rsquo;re on the permanent free tier. The product works
              without paying &mdash; upgrade when you need capacity.
            </>
          )
        }
      >
        <div
          className={`border ${
            isFree
              ? "border-white/10 bg-ink-900/40"
              : "border-ember-400/40 bg-ember-400/[0.04]"
          } p-6`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-ember-400/85">
                {isFounder ? "Founder" : isOperator ? "Operator" : "Free"}
              </p>
              <h3 className="mt-2 font-sans text-[28px] font-extrabold uppercase leading-none tracking-tight text-bone">
                {PLAN_LABEL[sub.plan]}
              </h3>
              <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.18em] text-ink-200/80">
                {PLAN_PRICE[sub.plan]}
              </p>
            </div>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/65">
              {isFounder
                ? "No renewal"
                : isOperator
                  ? "Active"
                  : "Active forever"}
            </span>
          </div>
        </div>
      </Section>

      {!isFounder ? (
        <Section
          kicker="02 / Upgrade"
          title={isFree ? "Step up to Operator" : "Switch tier"}
          description={
            isFree
              ? "More squads, custom cycles, lead tools. Cancel any time."
              : "Switch billing cycle, or claim a Founder's Pass while seats remain."
          }
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Operator Monthly */}
            {sub.plan !== "operator-monthly" ? (
              <article className="flex flex-col border border-white/10 bg-ink-900/40 p-5">
                <header className="border-b border-white/[0.06] pb-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/65">
                    Operator
                  </p>
                  <h4 className="mt-1.5 font-sans text-[20px] font-extrabold uppercase tracking-tight text-bone">
                    Monthly
                  </h4>
                </header>
                <div className="py-4">
                  <span className="font-sans text-[28px] font-extrabold leading-none tracking-tight text-bone">
                    $14
                  </span>
                  <span className="ml-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300/65">
                    / mo
                  </span>
                </div>
                <p className="text-[12.5px] leading-relaxed text-ink-200/80">
                  Test the waters. Cancel any time, no questions.
                </p>
                <ul className="mt-3 flex flex-col gap-1.5 border-t border-white/[0.06] pt-3 text-[12px] text-ink-200/80">
                  <li>+ 6-squad cap, custom cycles, lead tools</li>
                  <li>+ Cross-squad feed, forever retention</li>
                </ul>
                <div className="mt-auto pt-4">
                  <Button
                    fullWidth
                    disabled={busyPlan !== null}
                    onClick={() => applyPlan("operator-monthly")}
                  >
                    {busyPlan === "operator-monthly"
                      ? "Opening checkout…"
                      : "Start monthly"}
                    <ArrowRight size={13} weight="bold" />
                  </Button>
                </div>
              </article>
            ) : null}

            {/* Operator Annual */}
            {sub.plan !== "operator-annual" ? (
              <article className="relative flex flex-col border border-ember-400/40 bg-ink-900/60 p-5">
                <span
                  aria-hidden
                  className="absolute -top-px left-5 right-5 h-px bg-ember-400"
                />
                <header className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember-400/85">
                      Operator
                    </p>
                    <h4 className="mt-1.5 font-sans text-[20px] font-extrabold uppercase tracking-tight text-bone">
                      Annual
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 border border-ember-400/40 bg-ember-400/[0.06] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-ember-400">
                    <Lightning size={9} weight="fill" />
                    Save 23%
                  </span>
                </header>
                <div className="py-4">
                  <span className="font-sans text-[28px] font-extrabold leading-none tracking-tight text-bone">
                    $129
                  </span>
                  <span className="ml-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300/65">
                    / yr
                  </span>
                </div>
                <p className="text-[12.5px] leading-relaxed text-ink-200/80">
                  About $10.75/mo. 14-day no-questions refund.
                </p>
                <ul className="mt-3 flex flex-col gap-1.5 border-t border-white/[0.06] pt-3 text-[12px] text-ink-200/80">
                  <li>+ Everything in monthly</li>
                  <li>+ Save 23% vs paying monthly</li>
                </ul>
                <div className="mt-auto pt-4">
                  <Button
                    fullWidth
                    disabled={busyPlan !== null}
                    onClick={() => applyPlan("operator-annual")}
                  >
                    {busyPlan === "operator-annual"
                      ? "Opening checkout…"
                      : "Start annual"}
                    <ArrowRight size={13} weight="bold" />
                  </Button>
                </div>
              </article>
            ) : null}

            {/* Founder's Pass */}
            <article className="flex flex-col border border-white/[0.10] bg-ink-900/40 p-5">
              <header className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/65">
                    One-time
                  </p>
                  <h4 className="mt-1.5 font-sans text-[20px] font-extrabold uppercase tracking-tight text-bone">
                    Founder&rsquo;s Pass
                  </h4>
                </div>
                <span className="inline-flex items-center gap-1 border border-white/20 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-bone/85">
                  <Crown size={9} weight="fill" />
                  Limited
                </span>
              </header>
              <div className="py-4">
                <span className="font-sans text-[28px] font-extrabold leading-none tracking-tight text-bone">
                  $299
                </span>
                <span className="ml-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300/65">
                  one-time
                </span>
              </div>
              <div className="border border-white/[0.06] bg-ink-950/50 p-3">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-300/65">
                    Seats claimed
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-bone">
                    <span className="font-bold">{founderClaimed}</span>
                    <span className="text-ink-300/45"> / {FOUNDER_PASS_CAP}</span>
                  </span>
                </div>
                <div
                  className="mt-1.5 h-[3px] overflow-hidden bg-white/10"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={FOUNDER_PASS_CAP}
                  aria-valuenow={founderClaimed}
                >
                  <span
                    className="block h-full bg-ember-400"
                    style={{
                      width: `${(founderClaimed / FOUNDER_PASS_CAP) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-300/55">
                  {founderRemaining} left &middot; real cap
                </p>
              </div>
              <p className="mt-3 text-[12.5px] leading-relaxed text-ink-200/80">
                All current and future Operator features, locked at the
                founding price.
              </p>
              <ul className="mt-3 flex flex-col gap-1.5 border-t border-white/[0.06] pt-3 text-[12px] text-ink-200/80">
                <li>+ Founder&rsquo;s mark on profile</li>
                <li>+ Direct line for product input</li>
                <li>+ Early access to new templates</li>
              </ul>
              <div className="mt-auto pt-4">
                <Button
                  variant="secondary"
                  fullWidth
                  disabled={busyPlan !== null || founderRemaining <= 0}
                  onClick={() => applyPlan("founder")}
                >
                  {founderRemaining <= 0
                    ? "Sold out"
                    : busyPlan === "founder"
                      ? "Opening checkout…"
                      : "Claim a Pass"}
                  <ArrowRight size={13} weight="bold" />
                </Button>
              </div>
            </article>
          </div>

          {error ? (
            <p className="mt-4 border border-ember-400/40 bg-ember-400/[0.04] px-4 py-2 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-ember-400">
              {error}
            </p>
          ) : (
            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
              Secure checkout by Stripe, embedded. Apple/Google IAP arrives with the native app.
            </p>
          )}
        </Section>
      ) : null}

      {isOperator ? (
        <Section
          kicker="03 / Manage"
          title={sub.cancelAtPeriodEnd ? "Pending cancel" : "Cancel or change"}
          description={
            sub.cancelAtPeriodEnd
              ? "Cancellation is queued for the end of your current period. Change your mind any time before then."
              : "Cancel takes effect at the end of your current period. No retention agent, no surveys."
          }
        >
          {sub.cancelAtPeriodEnd ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled={resumeBusy} onClick={resume}>
                {resumeBusy ? "Resuming…" : "Resume subscription"}
              </Button>
              <Button
                variant="secondary"
                disabled={portalBusy}
                onClick={openPortal}
              >
                {portalBusy ? "Opening…" : "Manage billing"}
              </Button>
            </div>
          ) : !showCancelConfirm ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                disabled={portalBusy}
                onClick={openPortal}
              >
                {portalBusy ? "Opening…" : "Manage billing"}
              </Button>
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-200/80 underline-offset-4 transition hover:text-bone hover:underline"
              >
                Cancel subscription
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 border border-ember-400/40 bg-ember-400/[0.04] p-5">
              <div className="flex items-start gap-3">
                <Warning
                  size={20}
                  weight="fill"
                  className="mt-0.5 shrink-0 text-ember-400"
                />
                <p className="text-[13.5px] leading-relaxed text-bone">
                  Cancel will end your Operator features at the end of the
                  current billing period. Your squads stay live; above-cap
                  squads go read-only after a 30-day grace period.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={cancel}
                  disabled={cancelBusy}
                  className="tactile inline-flex items-center gap-2 bg-ember-400 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-950 transition hover:bg-ember-300 disabled:opacity-60"
                >
                  {cancelBusy ? "Canceling…" : "Confirm cancel"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelBusy}
                  className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-200/80 transition hover:text-bone disabled:opacity-60"
                >
                  Keep my plan
                </button>
              </div>
            </div>
          )}
        </Section>
      ) : null}

      <Section
        kicker="04 / Receipts"
        title="Billing history"
        description="Receipts download as PDF. App Store / Play Store purchases live in Apple's or Google's account history, not here."
      >
        <ul className="flex flex-col divide-y divide-white/[0.05] border border-white/10 bg-ink-900/40">
          {isFree ? (
            <li className="px-5 py-6 text-center text-[13px] text-ink-300/75">
              No charges yet. Nothing to receipt.
            </li>
          ) : (
            <li className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-3">
                <Receipt size={14} weight="fill" className="text-bone" />
                <div>
                  <div className="text-[13.5px] text-bone">
                    {PLAN_LABEL[sub.plan]} &middot; {PLAN_PRICE[sub.plan]}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/60">
                    {sub.startedAtIso
                      ? new Date(sub.startedAtIso).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )
                      : "—"}
                  </div>
                </div>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
                Demo
              </span>
            </li>
          )}
        </ul>
      </Section>

      <Section
        kicker="05 / External billing"
        title="Apple & Google subscriptions"
        description="If you bought through an app store, manage and cancel there — per Apple/Google policy."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <a
            href="https://apps.apple.com/account/subscriptions"
            target="_blank"
            rel="noreferrer"
            className="tactile flex items-center justify-between gap-3 border border-white/10 bg-ink-900/40 px-4 py-3.5 transition hover:border-white/25"
          >
            <div className="flex items-center gap-3">
              <AppleLogo size={18} weight="fill" className="text-bone" />
              <div>
                <div className="text-[13.5px] font-medium text-bone">
                  Apple subscriptions
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/60">
                  Opens Apple ID
                </div>
              </div>
            </div>
            <ArrowRight size={13} weight="bold" className="text-ink-300/60" />
          </a>
          <a
            href="https://play.google.com/store/account/subscriptions"
            target="_blank"
            rel="noreferrer"
            className="tactile flex items-center justify-between gap-3 border border-white/10 bg-ink-900/40 px-4 py-3.5 transition hover:border-white/25"
          >
            <div className="flex items-center gap-3">
              <AndroidLogo size={18} weight="fill" className="text-bone" />
              <div>
                <div className="text-[13.5px] font-medium text-bone">
                  Google subscriptions
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/60">
                  Opens Play Store
                </div>
              </div>
            </div>
            <ArrowRight size={13} weight="bold" className="text-ink-300/60" />
          </a>
        </div>
      </Section>

      <Section
        kicker="06 / Refunds"
        title="Refund policy"
        description="Honest, short, no asterisk."
      >
        <ul className="flex flex-col divide-y divide-white/[0.05] border border-white/10 bg-ink-900/40">
          {[
            {
              tier: "Monthly",
              policy: "Cancel any time. No refund on the current period.",
            },
            {
              tier: "Annual",
              policy: "14-day no-questions refund.",
            },
            {
              tier: "Founder's Pass",
              policy: "14-day no-questions refund. After that, it's yours.",
            },
            {
              tier: "App Store / Play Store",
              policy: "Apple and Google handle their own — request through them.",
            },
          ].map((row) => (
            <li
              key={row.tier}
              className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-3.5"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone">
                {row.tier}
              </span>
              <span className="text-[13px] text-ink-200/80">{row.policy}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[12.5px] leading-relaxed text-ink-300/75">
          Trouble with a refund?{" "}
          <Link
            href="/contact"
            className="text-bone underline underline-offset-4 decoration-bone/40 hover:decoration-bone"
          >
            Send a brief
          </Link>{" "}
          and we&rsquo;ll route it.
        </p>
      </Section>

      <Section
        kicker="07 / Payment data"
        title="What we keep on file"
      >
        <div className="flex items-start gap-3 border border-white/10 bg-ink-900/40 p-4">
          <Lock size={18} weight="fill" className="mt-0.5 shrink-0 text-bone" />
          <p className="text-[13.5px] leading-relaxed text-ink-200/85">
            Stripe (web) and Apple/Google (native) handle payment data. We
            store a token + last-four for display only. Card numbers, CVV,
            and full billing addresses stay with the processor.
          </p>
        </div>
      </Section>
    </>
  );
}
