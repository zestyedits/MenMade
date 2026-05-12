import { redirect } from "next/navigation";
import Link from "next/link";
import { getStripe } from "../../../lib/stripe";
import { MonoLabel } from "../../../components/ui/MonoLabel";
import { Section } from "../../../components/ui/Section";
import { Button } from "../../../components/ui/Button";

/**
 * Stripe Embedded Checkout `return_url` lands here with the session ID.
 * We check the session status server-side and render an honest state:
 *   - `complete` → "Activated." with a link back to the billing page.
 *      The actual subscription row is created by the webhook; this page
 *      just confirms payment was accepted.
 *   - `open` → user closed the drawer or hit a transient error; bounce
 *      back to /settings/billing.
 *   - `expired` → stale URL; bounce back.
 *
 * No client component needed — server-rendered.
 */

type SearchParams = Promise<{ session_id?: string }>;

export const dynamic = "force-dynamic";

export default async function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { session_id } = await searchParams;
  if (!session_id) redirect("/settings/billing");

  const stripe = getStripe();
  let status: string | null = null;
  let email: string | null = null;
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    status = session.status;
    email = session.customer_details?.email ?? null;
  } catch (err) {
    console.error("[billing/return] failed to retrieve session:", err);
    redirect("/settings/billing?checkout=error");
  }

  if (status !== "complete") {
    redirect("/settings/billing");
  }

  return (
    <div className="flex flex-col gap-8 py-8">
      <header className="flex flex-col gap-3">
        <MonoLabel ember>Confirmed</MonoLabel>
        <h1 className="text-[34px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[40px]">
          You&rsquo;re in.
        </h1>
        <p className="text-[14px] leading-relaxed text-ink-200/75">
          Payment accepted{email ? <> for <span className="text-bone">{email}</span></> : null}. Your plan flips live within a few seconds.
        </p>
      </header>

      <Section
        kicker="01 / What happens next"
        title="No further action"
        description="Stripe finalizes the receipt and our server reconciles in the background. Refresh your billing page in a moment if you don't see the new plan."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/settings/billing">Back to billing</Button>
          <Button variant="secondary" href="/dashboard">
            Dashboard
          </Button>
        </div>
      </Section>

      <p className="text-center font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
        Receipt sent to your email. Stripe handles the rest.
      </p>
      <p className="text-center text-[12.5px] text-ink-300/70">
        Issues?{" "}
        <Link
          href="/contact"
          className="text-bone underline underline-offset-4 decoration-bone/40 hover:decoration-bone"
        >
          Send a brief
        </Link>
        .
      </p>
    </div>
  );
}
