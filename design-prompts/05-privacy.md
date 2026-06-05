# Privacy Policy — `/privacy`

## What this page is for
The privacy policy — plain-language summaries above controlling legal text. Static, indexable.

## How it looks today
Rendered through a shared `LegalShell` (Navbar → centered `max-w-[1100px]` main → header → `.legal-prose` body → Footer). Header: kicker *"Legal / 002"*, title *"Privacy policy"*, effective date *"May 10, 2026"*, intro. Each section leads with a mono plain-language summary, then the legal prose. Sections: short version, what we collect / don't collect / why, who we share with, cookies, your rights, retention, children, international transfers, changes, contact. Carries a placeholder-draft note. Links to `/contact` for requests.

## Redesign goals
- Make a long legal document genuinely *readable* — strong heading hierarchy, scannable plain-language summaries visually distinct from the binding text, and a sticky section nav on desktop.
- Keep it on-brand (dark, mono kickers) without making legal text low-contrast or hard to read.

## The prompt (paste into Lovable)

> Redesign our **Privacy Policy** page for MenMade (brand rules in `00-BRAND-SYSTEM.md` — dark, ember
> sparingly, Geist Sans/Mono, mono kickers, no emoji). It's a long legal document where each section has a
> short **plain-language summary** followed by the controlling legal text. Make it genuinely readable:
> a centered reading column (~`max-w-[70ch]` for prose), clear `<h2>/<h3>` hierarchy, the plain-language
> summaries visually distinct from the legal body (e.g. an ember hairline + lighter weight) but never
> low-contrast, and a sticky **section nav / table of contents** on desktop that tracks scroll. Header:
> kicker *"Legal / 002"*, title *"Privacy policy"*, effective date, short intro. Keep the dry MenMade tone
> in the summaries. Ensure WCAG AA contrast on all body text (legal text must read easily), proper landmarks,
> and a mobile layout where the TOC collapses. Link "data requests" to `/contact`.
