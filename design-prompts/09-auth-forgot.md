# Forgot Password — `/auth/forgot`

## What this page is for
Request a password-reset link. Enumeration-resistant: always shows the same "sent" state regardless of whether the email is registered.

## How it looks today
Inside the auth shell, two states in one form column:
- **Idle:** kicker *"Reset / 001"*, h1 *"Lost the password."*, copy *"Drop your email. We'll send a one-time link. If it's on file, you're back in within a minute."*, Email input, **Send reset link** button, link *"Remember it now? Sign in instead."*
- **Sent:** `CheckCircle` ember icon, kicker *"Sent / 001"*, h1 *"Check your email."*, message *"If [email] is on file with us, a one-time reset link is on the way. Link expires in 30 minutes."*, an info box (*"Didn't arrive? Check spam, then try a different address."*), and a **Back to sign in** secondary button.

Validation: email required + regex. Uses `Button`, `Input`, `MonoLabel`, Phosphor (`CheckCircle`, `EnvelopeSimple`, `ArrowLeft`).

## Redesign goals
- Make the idle→sent transition feel like a deliberate, reassuring system response (the enumeration-resistant copy is a feature — present it confidently, not apologetically).
- Keep it inside the shared auth shell so it doesn't feel like a detour.

## The prompt (paste into Lovable)

> Redesign our **Forgot Password** page for MenMade inside the shared auth shell (brand rules in
> `00-BRAND-SYSTEM.md` — dark, ember sparingly, Geist Sans/Mono, mono kickers, no emoji). Two states in the
> right-hand form column. **Idle:** kicker *"Reset / 001"*, h1 *"Lost the password."*, copy *"Drop your
> email. We'll send a one-time link. If it's on file, you're back in within a minute."*, an Email input, a
> **Send reset link** button, and *"Remember it now? Sign in instead."* **Sent (enumeration-resistant):* an
> ember confirmation glyph, kicker *"Sent / 001"*, h1 *"Check your email."*, message *"If [email] is on file
> with us, a one-time reset link is on the way. Link expires in 30 minutes."*, a small "didn't arrive? check
> spam / try a different address" affordance, and a **Back to sign in** secondary button. The sent state
> should read as a confident system acknowledgement, not an apology. Inline ember mono-caps validation.
> Mobile-first, full keyboard nav, WCAG AA.
