# Reset Password — `/auth/reset-password`

## What this page is for
Completes a password reset from an email link: validates the recovery session, takes a new password, then signs the user out so they re-auth with it.

## How it looks today
Inside the auth shell, a phase machine:
- **Checking:** three staggered animated dots, kicker *"Verifying"*, *"Confirming the recovery link."*
- **Expired:** kicker *"Link expired"*, h1 *"That link's dead."*, copy *"Reset links work once and expire after an hour. Request a fresh one."*, buttons **Request new link** + **Back to sign-in**.
- **Ready:** kicker *"Reset / Set new"*, h1 *"Pick a new one."*, copy *"Make it something a stranger can't guess. We'll sign you out after so you can use the new one."*, New password + Confirm inputs, **Set new password** button (/"Locking it in…"), helper *"Wrong email? Request a different reset."*
- **Done:** kicker *"Set"*, *"New password locked in. Signing you out so you can use it."*

Validation: min 8, confirmation match. Custom ink inputs (no `Input` component here). Uses `Button`, `MonoLabel`.

## Redesign goals
- Make the phase transitions (checking → ready → done, or → expired) feel like one continuous instrument readout instead of four unrelated screens.
- The "checking" and "done" states currently use bare animated dots — give them a branded, skeleton-style treatment.

## The prompt (paste into Lovable)

> Redesign our **Reset Password** page for MenMade inside the shared auth shell (brand rules in
> `00-BRAND-SYSTEM.md` — dark, ember sparingly, Geist Sans/Mono, mono kickers, no emoji; **no spinners —
> use branded skeleton/pulse states**). It's a phase machine in the right-hand column, and the transitions
> should feel like one continuous instrument readout: **Checking** (kicker *"Verifying"*, *"Confirming the
> recovery link."* with a branded pulse, not a bare spinner); **Expired** (kicker *"Link expired"*, h1
> *"That link's dead."*, copy about one-time/one-hour links, buttons **Request new link** + **Back to
> sign-in**); **Ready** (kicker *"Reset / Set new"*, h1 *"Pick a new one."*, New password + Confirm inputs,
> **Set new password** button, helper *"Wrong email? Request a different reset."*); **Done** (kicker *"Set"*,
> *"New password locked in. Signing you out so you can use it."*). Inline ember mono-caps validation (≥ 8
> chars, confirmation must match). Mobile-first, full keyboard nav, visible focus, WCAG AA.
