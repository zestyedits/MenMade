# Settings · Billing Return — `/settings/billing/return`

> Uses the shared settings shell — see `19-settings-shell-and-index.md`. Reached after Stripe checkout completes.

## What this page is for
The post-checkout confirmation: validates the Stripe session server-side, confirms the purchase, and auto-redirects back to billing.

## How it looks today
- Server-validates `session_id` (redirects away if missing/incomplete).
- Header: mono kicker *"Confirmed"*, H1 *"You're in."*, copy *"Payment accepted for {email}. Your plan flips live within a few seconds."*
- **01 / "No further action":** copy about Stripe reconciling in the background, an `AutoRedirect` countdown (*"Redirecting to /settings/billing in {n}s"*, ~12s), and a button row — **Back to billing now** + **Dashboard**.
- Footer: *"Receipt sent to your email. Stripe handles the rest."* + *"Issues? Send a brief."*

Uses `Section`, `Button`, `MonoLabel`, `AutoRedirect`.

## Redesign goals
- This is a moment of earned confidence — make *"You're in."* land with restrained weight, then get out of the way and route the user onward.
- The auto-redirect countdown should feel intentional (a system handing control back), with clear manual escapes.

## The prompt (paste into Lovable)

> Redesign the **Billing Return** confirmation page for MenMade inside the shared settings shell (brand rules
> in `00-BRAND-SYSTEM.md` — dark, ember sparingly, mono kickers, no emoji, dry voice). It's the screen shown
> after a successful Stripe checkout. Header: kicker *"Confirmed"*, H1 *"You're in."* (let it land with
> restrained weight — this is an earned moment, not a confetti moment), and copy *"Payment accepted for
> {email}. Your plan flips live within a few seconds."* One section, **"No further action,"** explaining that
> Stripe reconciles in the background, with an intentional **auto-redirect countdown** back to billing
> (~12 seconds) and clear manual escapes — **Back to billing now** and **Dashboard**. Footer: *"Receipt sent to
> your email. Stripe handles the rest."* plus an *"Issues? Send a brief."* contact link. Keep it calm and
> brief. Mobile-first, full keyboard nav, WCAG AA.
