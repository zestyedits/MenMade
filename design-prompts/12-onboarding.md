# Onboarding — `/onboarding`

## What this page is for
A 4-question intake wizard that places a new operative into a squad: focus area(s), intensity, squad style, and identity.

## How it looks today
Two-column split (mobile: single column):
- **Left (desktop only):** dark branded panel — logo, headline *"Four questions. No spam ever."*, and a lock-icon assurance *"Your answers stay private to your squad."*
- **Right:** mobile-only header (logo + step counter), an ember progress bar that fills left→right, a centered form (`max-w-[520px]`) with `AnimatePresence` slide+fade between steps, and a bottom nav row (Back · step counter · Next / Find my squad).

Steps (each via a `StepShell` with index/total, title, hint):
1. **Focus** — multi-select of 6 (Build *"Wood, metal, code, garage projects"*, Move, Make, Master, Mend, Mark). 2-col mobile / 3-col tablet; selected = ember border + bg.
2. **Intensity** — single-select radio of 4 (Light *"Honest is better than ambitious"*, Steady *"Where most squads land"*, Heavy, Brutal *"We will fact-check you"*) + a 4/5/6/7 days-per-week selector (default 6).
3. **Squad style** — single-select of 3 (Matched → *"You start in the Founders Circle… spins off when five men line up at your intensity"*, Invite own, Solo).
4. **Identity** — Display name, Handle (auto-lowercased, alnum/`-`/`_`, 2+ chars), Pronouns (optional), auto-detected timezone shown.

Button *"Find my squad"* on step 4 → `POST /api/squads/match` → `/dashboard`. Uses `Logo`, `Button`, `Input`, `MonoLabel`, `StepShell`, Phosphor icons.

## Redesign goals
- Make the progress read as a mono index `01 / 04`, not just a candy-bar fill (brand prefers instrument indices).
- Make the option grids (focus/intensity) feel like selecting equipment/loadout, with stronger selected-state feedback and the dry flavor copy carrying weight.
- Preserve progress if the tab closes mid-flow; keep Back/Next fully keyboard-reachable.

## The prompt (paste into Lovable)

> Redesign our 4-step **Onboarding** wizard for MenMade (brand rules in `00-BRAND-SYSTEM.md` — dark, ember
> sparingly, Geist Sans/Mono, mono kickers, no emoji, dry instrument-panel voice). Two-column split: left
> brand panel (logo, headline *"Four questions. No spam ever."*, a small lock-icon privacy assurance); right
> column holds the wizard in a centered `~520px` form with a **mono step index `01 / 04`** (plus a thin
> ember progress line), animated slide+fade between steps, and a bottom Back / Next row. Steps: (1) **Focus**
> — multi-select of six options (Build, Move, Make, Master, Mend, Mart/Mark) each with a one-line example,
> selected state in ember; (2) **Intensity** — single-select of Light / Steady / Heavy / Brutal with dry
> flavor copy (*"Where most squads land"*, *"We will fact-check you"*), plus a 4/5/6/7 days-per-week picker
> defaulting to 6; (3) **Squad style** — Matched (start in the Founders Circle, spin off when five men line
> up) / Invite your own / Solo; (4) **Identity** — Display name, Handle (auto-lowercased, alphanumeric +
> `-`/`_`), optional Pronouns, and an auto-detected timezone shown read-only. Final button **Find my squad**.
> Make selecting options feel like choosing a loadout — strong selected feedback, the satirical copy doing
> real work. Steps must be fully keyboard-reachable and preserve progress if the tab closes. Mobile-first,
> full state coverage, WCAG AA.
