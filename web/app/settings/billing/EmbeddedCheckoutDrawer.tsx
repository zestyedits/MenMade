"use client";

/**
 * Slide-up drawer that hosts Stripe Embedded Checkout inside the app.
 * Mounted only while we have a live `clientSecret`. On completion Stripe
 * navigates the embedded iframe to our `return_url` (which the wrapper
 * intercepts via onComplete) — we let Stripe's own UI handle the final
 * receipt-and-redirect screen and then close the drawer.
 *
 * Stripe's React wrapper insists on stable refs for `options.clientSecret`,
 * so the drawer fully unmounts between sessions to avoid stale state.
 */

import { useEffect, useMemo, useState } from "react";
import { loadStripe, type Stripe as StripeJs } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { X } from "@phosphor-icons/react/dist/ssr";
import { MonoLabel } from "../../components/ui/MonoLabel";

type Props = {
  clientSecret: string | null;
  onClose: () => void;
  /** Called after Stripe reports `complete` in the embedded session.
   *  We use it to surface a "processing" state while the webhook fires. */
  onComplete?: (sessionId: string) => void;
};

// Cache the loadStripe promise across drawer opens — Stripe.js is happy
// to be reused, and re-running loadStripe inside the drawer re-fetches
// the script every time. The mode-aware var read here keys off
// NEXT_PUBLIC_STRIPE_MODE (test/live) and the matching _TEST/_LIVE
// publishable key so we never accidentally mix modes between server +
// browser.
let stripePromise: Promise<StripeJs | null> | null = null;
function getStripeJs(): Promise<StripeJs | null> {
  if (stripePromise) return stripePromise;
  const mode = (
    process.env.NEXT_PUBLIC_STRIPE_MODE ?? "test"
  ).toLowerCase();
  const pk =
    mode === "live"
      ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE
      : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST;
  if (!pk) {
    console.warn(
      `[billing] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_${mode.toUpperCase()} missing — embedded checkout will not load.`,
    );
    return Promise.resolve(null);
  }
  stripePromise = loadStripe(pk);
  return stripePromise;
}

export function EmbeddedCheckoutDrawer({
  clientSecret,
  onClose,
  onComplete,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (clientSecret) {
      setMounted(true);
      // Lock body scroll while drawer is open.
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [clientSecret]);

  // Close on Escape.
  useEffect(() => {
    if (!clientSecret) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clientSecret, onClose]);

  const options = useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            onComplete: () => {
              // Stripe doesn't pass the sessionId here — we rely on the
              // caller capturing it when it kicked off the checkout.
              onComplete?.(clientSecret);
            },
          }
        : null,
    [clientSecret, onComplete],
  );

  if (!clientSecret || !options || !mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Stripe checkout"
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/80 backdrop-blur-sm md:items-center"
    >
      {/* Click outside drawer to close. */}
      <button
        type="button"
        aria-label="Close checkout"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div
        className="relative z-10 flex max-h-[92vh] w-full max-w-[640px] flex-col overflow-hidden border border-white/10 bg-ink-900 shadow-2xl md:max-h-[88vh]"
        style={{ animation: "drawerUp 220ms ease-out" }}
      >
        <header className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3.5">
          <MonoLabel ember>Checkout</MonoLabel>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center text-ink-300/70 transition hover:text-bone"
          >
            <X size={16} weight="bold" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-paper">
          <EmbeddedCheckoutProvider stripe={getStripeJs()} options={options}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>

      <style jsx>{`
        @keyframes drawerUp {
          from {
            transform: translateY(24px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
