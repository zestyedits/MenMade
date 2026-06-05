# Sign Up — `/auth/sign-up`

## What this page is for
Account creation (email/password) with honeypot spam protection, OAuth placeholders, and routing into onboarding or email confirmation.

## How it looks today
Same auth shell as sign-in (see `07-auth-sign-in.md` for the shared aside). Centered form column `max-w-[420px]`:
- Kicker *"Sign up / 001"*, h1 *"Create your account."*, subtext *"Two minutes of setup. Then you're in a squad."*
- Hidden honeypot field.
- OAuth pair (Apple / Google — "coming soon").
- Divider *"Or with email"*, Name (*"What should the squad call you?"*), Email, Password (*"Build a real one"*, hint *"At least 8 characters. Make it something a stranger can't guess."*).
- **Create account** button.
- Legal footer *"By signing up you agree to our Terms and Privacy Policy."* + *"Already have an account? Sign in."*

Validation: name required, email regex, password min 8. Uses `Button`, `Input`, `MonoLabel`, Phosphor logos.

## Redesign goals
- Mirror the sign-in redesign so the two are obviously one flow (tabbed feel, URL-routed).
- Make the value reminder ("Then you're in a squad") more present so signup feels like enlisting, not a chore.

## The prompt (paste into Lovable)

> Redesign our **Sign Up** page for MenMade to be the twin of the Sign In page (same split/asymmetric auth
> shell, brand rules in `00-BRAND-SYSTEM.md` — dark, ember sparingly, Geist Sans/Mono, mono kickers, no
> emoji). Left brand panel identical to sign-in; right column is the create-account form (`max-w-[420px]`):
> kicker *"Sign up / 001"*, h1 *"Create your account."*, subtext *"Two minutes of setup. Then you're in a
> squad."*, then "Continue with Apple"/"Continue with Google" secondary buttons, an *"Or with email"*
> divider, fields for Name (placeholder *"What should the squad call you?"*), Email, and Password (placeholder
> *"Build a real one"*, helper *"At least 8 characters. Make it something a stranger can't guess."*), and a
> **Create account** primary button. Below: small legal line linking Terms and Privacy, and *"Already have an
> account? Sign in."* Keep a hidden honeypot field for bots. Inline ember mono-caps validation (name required,
> valid email, password ≥ 8). The signup → onboarding handoff should feel like **enlisting**, not a form.
> Mobile-first, full keyboard nav, WCAG AA.
