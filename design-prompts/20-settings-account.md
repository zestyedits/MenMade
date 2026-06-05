# Settings · Account — `/settings/account`

> Uses the shared settings shell — see `19-settings-shell-and-index.md`.

## What this page is for
Manage identity (display name, handle), sign-in (email, password, 2FA), session sign-out, and account deletion.

## How it looks today
- **01 / Identity — "Member ID":** Display name + Handle inputs (handle auto-lowercased, `^[a-z0-9_-]+$`, hint *"Letters, numbers, hyphen, underscore. Lowercased."*), a Save button + transient *"Saved."* badge. Copy: *"What the squad sees. Your handle is also the link people use to find you (@handle)."*
- **02 / Sign-in — "Email & password":** read-only Email field (hint about verification-link change), a Password card (*"Send reset link"* → `/auth/forgot`), a 2FA card with a *"Soon"* badge.
- **03 / Session — "Sign out":** *"Signs out of this device only."* + Sign out button.
- **Danger — "Delete account":** type-`DELETE`-to-confirm flow — Begin deletion → ember warning alert + confirmation input + Delete account (disabled until exact match) + Cancel.

Uses `Section`, `Input`, `Button`, Phosphor (`SignOut`, `Trash`, `Warning`).

## Redesign goals
- Keep destructive actions clearly walled off (the ember danger zone) and the type-to-confirm gate.
- Make the read-only/coming-soon affordances (email change, 2FA "Soon") read as deliberate system states, not disabled dead-ends.

## The prompt (paste into Lovable)

> Redesign the **Account** settings sub-page for MenMade inside the shared settings shell (brand rules in
> `00-BRAND-SYSTEM.md`; sections separated by `border-t`, not carded). Sections: **01 Identity ("Member ID")**
> — Display name + Handle inputs (handle auto-lowercased to `[a-z0-9_-]`, helper *"Letters, numbers, hyphen,
> underscore. Lowercased."*), a Save action with a transient *"Saved."* acknowledgement, copy noting the handle
> doubles as the user's @link; **02 Sign-in ("Email & password")** — a read-only email field (with a clear note
> that changing it needs a verification link), a password block with a *"Send reset link"* button, and a 2FA
> block marked *"Soon"* presented as a deliberate upcoming feature, not a dead control; **03 Session ("Sign
> out")** — a single Sign out button (*"this device only"*); and a clearly walled-off **Danger ("Delete
> account")** zone with an ember-tinted warning and a **type `DELETE` to confirm** gate (the confirm button
> stays disabled until the text matches exactly), plus Cancel. Mobile-first, full keyboard nav, WCAG AA.
