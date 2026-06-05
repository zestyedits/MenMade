# Auth Callback — `/auth/callback`

## What this page is for
The landing page email-confirmation links redirect to. Validates the session token, hydrates user state, then routes to dashboard / onboarding (or shows an error).

## How it looks today
A single `CallbackShell` whose content swaps:
- **Loading:** three staggered animated dots, kicker *"Verifying"*, *"Confirming your email and pulling your file."*
- **Error:** kicker *"Hold up"*, the error message (or *"Link expired or invalid."* / on timeout *"Confirmation took too long. Try signing in directly."*).

Detects both legacy hash sessions and PKCE code, routes `recovery → /auth/sign-in?reset=1`, else onboarded? `/dashboard` : `/onboarding`. 8s timeout. Uses `MonoLabel` + animated `Dot`.

## Redesign goals
- This is a 1–3 second interstitial — make the wait feel intentional and branded (it's the first authenticated moment), and make the error state genuinely helpful with a clear next action.

## The prompt (paste into Lovable)

> Redesign our **Auth Callback** interstitial for MenMade (brand rules in `00-BRAND-SYSTEM.md` — dark, ember
> sparingly, Geist Sans/Mono, mono kickers, no emoji; **no spinners — branded pulse/skeleton instead**).
> It's a short post-email-confirmation interstitial that should feel like the first authenticated moment in
> the product, not a blank loader. **Loading state:** kicker *"Verifying"*, line *"Confirming your email and
> pulling your file."*, with a branded pulse animation. **Error state:** kicker *"Hold up"*, a clear message
> (fallbacks *"Link expired or invalid."* and, on timeout, *"Confirmation took too long. Try signing in
> directly."*) plus an obvious next-step button to sign in. Center it within the same dark auth aesthetic.
> Respect reduced-motion. Keep it lightweight — it's on screen for a second or two before redirecting.
