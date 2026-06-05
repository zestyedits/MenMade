# MenMade — Design Prompts for Lovable

Per-page redesign briefs for every route in the app. Each file pairs a **faithful snapshot of how
the page looks today** with a **ready-to-paste Lovable prompt** to spin up a better design.

## How to use these

1. **Load the brand first.** Open [`00-BRAND-SYSTEM.md`](./00-BRAND-SYSTEM.md) and paste it into Lovable as
   a Knowledge / pinned-context doc. Every per-page prompt assumes those rules (palette, type, voice, bans)
   are already loaded, so it only needs to reference them — not repeat them.
2. **Pick a page** from the list below and open its file.
3. **Paste the "The prompt" block** (the last section of each file) into Lovable. The "How it looks today"
   section above it is context for *you* — and you can paste it too if you want Lovable to understand the
   current state before redesigning. If you can attach screenshots of the live page, even better; the
   snapshot text describes the same thing in words.
4. Generated screens must stay consistent with each other — the shared brand doc is what keeps 30 separate
   prompts feeling like one product.

> Note: live screenshots weren't captured here (most routes are auth-walled behind Supabase and the app
> needs secrets to run), so each "current look" is a precise written snapshot pulled straight from the page
> code — layout regions, real copy strings, components, and states.

## Pages

### Foundation
- [`00-BRAND-SYSTEM.md`](./00-BRAND-SYSTEM.md) — **paste into Lovable first.** Palette, type, voice, components, bans.

### Marketing / public
- [`01-landing.md`](./01-landing.md) — `/` — **locked reference, don't redesign**
- [`02-how-it-works.md`](./02-how-it-works.md) — `/how-it-works`
- [`03-pricing.md`](./03-pricing.md) — `/pricing`
- [`04-contact.md`](./04-contact.md) — `/contact`
- [`05-privacy.md`](./05-privacy.md) — `/privacy`
- [`06-terms.md`](./06-terms.md) — `/terms`

### Auth
- [`07-auth-sign-in.md`](./07-auth-sign-in.md) — `/auth/sign-in` (also defines the shared auth shell)
- [`08-auth-sign-up.md`](./08-auth-sign-up.md) — `/auth/sign-up`
- [`09-auth-forgot.md`](./09-auth-forgot.md) — `/auth/forgot`
- [`10-auth-reset-password.md`](./10-auth-reset-password.md) — `/auth/reset-password`
- [`11-auth-callback.md`](./11-auth-callback.md) — `/auth/callback`

### Core product
- [`12-onboarding.md`](./12-onboarding.md) — `/onboarding`
- [`13-dashboard.md`](./13-dashboard.md) — `/dashboard`
- [`14-chat.md`](./14-chat.md) — `/chat`
- [`15-squad-redirect.md`](./15-squad-redirect.md) — `/squad` (redirect only)
- [`16-squad-detail.md`](./16-squad-detail.md) — `/squads/[slug]`
- [`17-cycles.md`](./17-cycles.md) — `/cycles`
- [`18-field-log-new.md`](./18-field-log-new.md) — `/field-log/new`

### Settings (shared shell + 9 sub-pages)
- [`19-settings-shell-and-index.md`](./19-settings-shell-and-index.md) — `/settings` (**read first** — shared shell)
- [`20-settings-account.md`](./20-settings-account.md) — `/settings/account`
- [`21-settings-profile.md`](./21-settings-profile.md) — `/settings/profile`
- [`22-settings-notifications.md`](./22-settings-notifications.md) — `/settings/notifications`
- [`23-settings-privacy.md`](./23-settings-privacy.md) — `/settings/privacy`
- [`24-settings-billing.md`](./24-settings-billing.md) — `/settings/billing`
- [`25-settings-billing-return.md`](./25-settings-billing-return.md) — `/settings/billing/return`
- [`26-settings-legal.md`](./26-settings-legal.md) — `/settings/legal`
- [`27-settings-accessibility.md`](./27-settings-accessibility.md) — `/settings/accessibility`
- [`28-settings-safety.md`](./28-settings-safety.md) — `/settings/safety`

### System
- [`29-admin.md`](./29-admin.md) — `/admin` (founder-only)
- [`30-not-found-404.md`](./30-not-found-404.md) — 404
- [`31-error-500.md`](./31-error-500.md) — 500 error boundary

---

**31 page briefs + the brand system.** Built from the current `web/app` source on branch
`claude/page-prompts-design-views-WrGxd`.
