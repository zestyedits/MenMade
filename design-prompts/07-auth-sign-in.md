# Sign In — `/auth/sign-in`

## What this page is for
Email/password sign-in, with OAuth placeholders, status banners (email confirmation / reset results), and forgot-password link.

## Shared auth shell (applies to sign-in, sign-up, forgot, reset, callback)
A `1fr | minmax(420px, 520px)` grid on lg; single column on mobile.
- **Left aside (hidden on mobile):** ink-900 with an ember radial glow, a vertical ember divider, the Logo, and bottom-anchored content — mono kicker, `Stop scrolling. Start cycling.` ("Start cycling" in ember), the tagline *"A private squad app for men who'd rather finish a real thing than scroll a fake one. Built quietly, used loudly."*, and a `LiveDot` + `1,847 squads in cycle`.
- **Right:** ink-950, mobile-only header (logo + mono label), centered form column `max-w-[420px]`.

## How it looks today
Centered form column inside the shell:
- Kicker *"Sign in / 001"*, h1 *"Welcome back."* (or *"Almost in."* in confirm states), subtext *"The cycle started without you. Catch up."*
- Optional status banner (confirm-email / confirmed / reset-sent / reset-ok) with icon + message, colored per type.
- OAuth pair (Continue with Apple / Google) — currently disabled, "coming soon".
- Divider *"Or with email"*, Email input, Password input with a *"Forgot"* link, **Sign in** button.
- Footer: *"New here? Create an account."*

Inline validation (email regex, password min 6). Errors in ember mono-caps alert. Uses `Button`, `Input`, `MonoLabel`, Phosphor (`AppleLogo`, `GoogleLogo`, `CheckCircle`).

## Redesign goals
- Keep the split/asymmetric shell (no centered hero) but make the brand aside feel alive — the animated `OPERATIVE / AUTHENTICATING`-style mono label and the live counter should sell the product while you sign in.
- Make the status banners read as instrument-panel system messages, not generic alerts.
- Tighten the OAuth-vs-email hierarchy.

## The prompt (paste into Lovable)

> Redesign our **Sign In** page for MenMade (brand rules in `00-BRAND-SYSTEM.md` — dark, ember sparingly,
> Geist Sans/Mono, mono kickers, no emoji, dry instrument-panel voice). Use a **split/asymmetric layout —
> never a centered hero**: left brand panel (ink-900, ember radial glow, logo, a quietly animated mono
> status label like `OPERATIVE / AUTHENTICATING`, the tagline *"A private squad app for men who'd rather
> finish a real thing than scroll a fake one. Built quietly, used loudly."*, and a live pulse-dot +
> `1,847 squads in cycle`); right column is the form (`max-w-[420px]`). Form: kicker *"Sign in / 001"*, h1
> *"Welcome back."*, subtext, then "Continue with Apple"/"Continue with Google" secondary buttons, an *"Or
> with email"* divider, Email + Password (with a small *"Forgot"* link), and a **Sign in** primary button.
> Footer link *"New here? Create an account."* Support contextual **status banners** styled as system
> messages (email-confirmation pending, email confirmed, reset link sent, password updated) — use
> enumeration-resistant copy. Inline ember mono-caps validation errors. On mobile, drop the aside and show a
> compact logo header. Full keyboard nav, visible focus, WCAG AA.
