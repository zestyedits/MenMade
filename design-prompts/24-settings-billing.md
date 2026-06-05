# Settings · Subscription / Billing — `/settings/billing`

> Uses the shared settings shell — see `19-settings-shell-and-index.md`.

## What this page is for
Show the active plan, offer upgrades (Operator monthly/annual, Founder's Pass), manage/cancel/resume, view billing history, external-store links, refund policy, and payment-data disclosure.

## How it looks today
- **01 / Active plan:** a plan card (ember border if paid) — mono plan label, big plan name, mono price, a status badge (*No renewal* / *Active* / *Active forever*). Description varies by plan (Founder shows seat #, Operator shows renewal/cancel date, Free shows the permanent-free line).
- **02 / Upgrade** (hidden for Founder): a 3-col grid — **Operator Monthly** ($14/mo), **Operator Annual** ($129/yr, *"Save 23%"* badge), **Founder's Pass** ($299 one-time, a seat-progress box `N / 500` + bar + `N left · real cap`, *"Claim a Pass"* / *"Sold out"*). Each card: kicker, heading, price, feature list, full-width CTA. Inline ember error row or the footer *"Secure checkout by Stripe, embedded…"*.
- **03 / Manage** (Operator only): Cancel/change → ember confirmation alert (*Confirm cancel* / *Keep my plan*) or, when cancel pending, *Resume subscription* + *Manage billing*.
- **04 / Receipts — "Billing history":** a list (empty *"No charges yet. Nothing to receipt."*).
- **05 / External billing:** Apple + Google subscription cards (open store account).
- **06 / Refunds — "Refund policy":** a 4-row name↔policy list, *"Honest, short, no asterisk."*
- **07 / Payment data:** a Lock infobox (Stripe/Apple/Google hold card data; we store token + last-four).

Drives Stripe Embedded Checkout in a drawer. Uses `Section`, `Button`, Phosphor (`Crown`, `Lightning`, `Receipt`, `AppleLogo`, `AndroidLogo`, `Lock`, `Warning`).

## Redesign goals
- Make the active plan unmistakable at the top, and the three upgrade options easy to compare without horizontal scroll on mobile.
- The Founder's Pass seat-scarcity needs honest weight (no fake-urgency — brand rule), and cancel/resume must be calm and friction-free (the brand explicitly promises "no retention agent, no surveys").

## The prompt (paste into Lovable)

> Redesign the **Subscription / Billing** settings sub-page for MenMade inside the shared settings shell
> (brand rules in `00-BRAND-SYSTEM.md`; sectioned with `border-t`; **honest billing — no fake urgency, no
> dark patterns, no retention-survey friction**). Sections: **01 Active plan** — a plan card (ember border when
> paid) showing a mono plan label, the plan name, price, and a status badge (*No renewal* / *Active* / *Active
> forever*), with plan-specific copy (Founder shows their seat number, Operator shows renewal or scheduled-end
> date, Free shows the permanent-free line); **02 Upgrade** (hidden for Founder) — three comparable options
> that stay legible on mobile (no horizontal scroll): **Operator Monthly** ($14/mo), **Operator Annual**
> ($129/yr with a *"Save 23%"* badge), and **Founder's Pass** ($299 one-time) with a restrained seat-progress
> meter (`N / 500` + bar + `N left · real cap`) that conveys real scarcity honestly and a *"Claim a Pass"* /
> *"Sold out"* CTA — each card has a kicker, price, a short feature list, and a full-width button, with a
> *"Secure checkout by Stripe, embedded"* footer and inline error states; **03 Manage** (Operator only) — calm
> cancel/resume with a confirmation that states what happens (features end at period end, squads stay live) and
> a *Keep my plan* escape, plus a *Manage billing* portal link; **04 Billing history** (with a dry empty state);
> **05 External billing** — Apple + Google store cards; **06 Refund policy** — a clean name↔policy list
> (*"Honest, short, no asterisk."*); **07 Payment data** — a Lock infobox clarifying processors hold card data
> and we keep only a token + last-four. Mobile-first, full keyboard nav, accessible progressbar semantics on
> the seat meter, WCAG AA.
