# Settings · Profile — `/settings/profile`

> Uses the shared settings shell — see `19-settings-shell-and-index.md`.

## What this page is for
Set how you read to your squad: pronouns, bio, focus areas, intensity, days/week, and timezone.

## How it looks today
- **01 / Persona — "How you read on the wall":** Pronouns input (hint *"Optional."*) + a Bio textarea (3 rows, `maxLength 240`, placeholder *"One line about what you're working on. Skip the resume."*, char counter `/240`).
- **02 / Brief — "What you're here to do":** a 2/3-col grid of 6 focus buttons (Build/Move/Make/Master/Mend/Mark, each icon + label + blurb, `aria-pressed`, ember selected state) — multi-select.
- **03 / Dial — "Intensity & cadence":** a RadioGroup of 4 intensities (Light/Steady/Heavy/Brutal, with descriptions) + a 4/5/6/7 days-per-week button grid (tabular-nums, `X / 7` counter).
- **04 / Region — "Time zone":** an auto-detected timezone in a bordered mono box + a *"Re-detect"* action.
- **Sticky footer:** backdrop-blur bar with a *"Saved."* badge + **Save changes** button.

Uses `Section`, `Input`, `RadioGroup`, `Button`, focus-area Phosphor icons.

## Redesign goals
- This mirrors onboarding's focus/intensity pickers — keep them visually consistent so the app feels coherent (a returning user editing prefs sees the same "loadout" controls).
- The sticky save footer should feel anchored and obvious; the focus grid selected-state should be unmistakable.

## The prompt (paste into Lovable)

> Redesign the **Profile** settings sub-page for MenMade inside the shared settings shell (brand rules in
> `00-BRAND-SYSTEM.md`; sectioned with `border-t`, not carded; reuse the same focus/intensity controls as
> onboarding for consistency). Sections: **01 Persona ("How you read on the wall")** — a Pronouns input
> (optional) and a Bio textarea capped at 240 chars with a live counter and placeholder *"One line about what
> you're working on. Skip the resume."*; **02 Brief ("What you're here to do")** — a multi-select grid of six
> focus options (Build / Move / Make / Master / Mend / Mark), each an icon + label + one-line blurb with a
> strong ember selected state and `aria-pressed`; **03 Dial ("Intensity & cadence")** — a radio group of
> Light / Steady / Heavy / Brutal with descriptions, plus a 4/5/6/7 days-per-week picker shown as a tabular-nums
> button grid with an `X / 7` counter; **04 Region ("Time zone")** — an auto-detected timezone in a mono
> bordered box with a *"Re-detect"* action. Anchor a **sticky save footer** (backdrop-blur) with a *"Saved."*
> acknowledgement and a **Save changes** button. Mobile-first, full keyboard nav, visible focus, WCAG AA.
