# Contact — `/contact`

## What this page is for
A contact form for press, partnerships, bug reports, and squad-lead applications, with idle/sent/error states.

## How it looks today
Two-column grid (`5 / 7` on lg, stacks on mobile):
- **Left:** header *"Send a brief."*, intro *"Press, partnerships, bug reports, or honest feedback. We answer real messages. We ignore the rest."*, and a reasons list with icons (`ShieldCheck` Press & partnerships, `Bug` Bug reports & feedback, `Lightning` Squad lead applications).
- **Right:** form — Name + Email (2-col on md), Subject (*"One line. Like a headline."*), Message textarea (*"Skip the pleasantries. What's the ask?"*, 6 rows). Submit: **Send brief** / "Sending…".
- **Success state** replaces the whole main with a centered card (`CheckCircle` ember) — *"Got it. Your brief is in the queue. We answer real messages in 1–3 business days. We'll write back to [email]."*

Validation inline, mono-caps ember errors (*"Required." / "Doesn't look like an email." / "Tell us what's up."*). Hidden honeypot field. Uses `Navbar`, `Footer`, `Button`, `Input`, `MonoLabel`.

## Redesign goals
- Keep the asymmetric split (no centered form) but make the left column do more brand work — it currently reads like a static caption.
- Make the success state feel like a confirmation receipt (in-voice), not a generic green checkmark card.

## The prompt (paste into Lovable)

> Redesign our **Contact** page for MenMade (brand rules in `00-BRAND-SYSTEM.md` — dark, ember sparingly,
> Geist Sans/Mono, mono kickers, no emoji, dry instrument-panel voice). Asymmetric two-column layout (no
> centered form): left column carries the headline *"Send a brief."*, a short intro (*"Press, partnerships,
> bug reports, or honest feedback. We answer real messages. We ignore the rest."*) and a tight reasons list
> (Press & partnerships, Bug reports & feedback, Squad lead applications); right column is the form — Name,
> Email, Subject (placeholder *"One line. Like a headline."*), Message (placeholder *"Skip the pleasantries.
> What's the ask?"*), submit button **Send brief**. Inline validation in mono-caps ember. Keep a hidden
> honeypot field. On success, replace the form with an in-voice confirmation **receipt** (not a generic
> checkmark card) — *"Got it. Your brief is in the queue. We answer real messages in 1–3 business days."* —
> echoing the submitted email. Mobile-first, full keyboard nav, accessible labels and announced errors.
