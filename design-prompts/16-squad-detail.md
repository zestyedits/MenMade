# Squad Detail — `/squads/[slug]`

## What this page is for
The home for a single squad: a hero with cycle context, then four tabs — Brief, Roster, Field log, Settings.

## How it looks today
- **SquadHero:** ink with an ember radial glow. Top row: a callsign chip (Broadcast icon), separators, *"Squad ledger / 001"*, a live dot. Big `clamp(2.4–5rem)` squad name. Optional *"Led by {name} @{handle}"* with a crown. A cycle-context strip (2-col mobile / 4-col md: **Cycle / Day / Intensity / On channel**). Bottom row: a `Cycle progress` bar with days-remaining in big tabular-nums + a `Members` avatar stack (first 6, online dots, crown on lead, hover tooltips).
- **SquadTabs:** sticky bar (`top-16`), backdrop-blur, horizontal-scroll. Tabs **Brief / Roster / Field log / Settings** with Phosphor icons; active = bone text + ember icon + an ember underline that animates via shared layout (`layoutId`).
- **BriefTab:** 2-col (`7 / 5`). Left: the brief + a numbered objectives list (`01–04`, `divide-y`, CheckCircle). Right: a milestones timeline (vertical rail, today dot in ember) + a "Squad signals" stat snapshot (median streak / on channel / members / total days).
- **RosterTab:** header (`4`) + list (`8`). Expandable `MemberRow`s with avatar + online dot, You/Lead tags, expand → streak / time zone / status + Open chat / Report / Block.
- **FieldLogTab:** header + entries grouped by relative day. Filter chips (All / Completions / Briefs / Photos / Misses with counts). Each entry: avatar + author + type badge (Miss in ember) + timestamp + note. Empty: *"Filter empty"*.
- **SettingsTab:** numbered sections — per-squad notifications (toggles), mission statement (textarea, read-only for members), manage members (invite / pass lead), privacy toggle, and a Leave-squad danger zone (type `LEAVE` to confirm).

Loading *"Loading squad…"*; not-found → 404; error *"Couldn't load squad. Refresh."* Tab persisted in `?tab=`.

## Redesign goals
- Make the hero a genuine instrument header — cycle context, progress, and roster legible at a glance without crowding.
- Keep the four tabs as one coherent surface; the tab underline + sticky bar should feel solid, not floaty.
- Field log is the heartbeat — make entries scannable by type and day; the empty/quiet states should carry the dry voice.

## The prompt (paste into Lovable)

> Redesign our **Squad detail** page for MenMade (brand rules in `00-BRAND-SYSTEM.md` — dark, ember
> sparingly, Geist Sans/Mono, mono kickers, no emoji, dry instrument-panel voice). Top: a **squad hero** that
> reads like an instrument header — a callsign chip + *"Squad ledger / 001"* kicker + live dot, the squad name
> in big display type, a *"Led by @handle"* line with a crown, a four-stat cycle-context strip (**Cycle / Day /
> Intensity / On channel**), a thin **cycle progress** bar with days-remaining in tabular-nums, and a
> **member avatar stack** (initials only, online dots, crown on the lead, hover tooltips). Below it, a
> **sticky tab bar** (Brief / Roster / Field log / Settings) with mono-uppercase labels, an ember icon on the
> active tab, and an ember underline that slides between tabs; persist the active tab in the URL. **Brief**:
> two columns — the mission brief + a numbered objectives checklist (`divide-y`, not cards) on the left, a
> milestones timeline (today marked in ember) and a small squad-signals stat block on the right. **Roster**:
> a `divide-y` list of expandable member rows (avatar + online dot, You/Lead tags; expand reveals streak,
> time zone, status, and Open chat / Report / Block). **Field log**: entries grouped by relative day with
> filter chips (All / Completions / Briefs / Photos / Misses, each with a count), every entry showing avatar +
> author + a type badge (Miss in ember) + mono timestamp + note; deadpan empty state. **Settings**: numbered
> sections for per-squad notification toggles, an (often read-only) mission textarea, member management, a
> privacy toggle, and a Leave-squad danger zone requiring the user to type `LEAVE`. Cover loading, not-found,
> and error states. Mobile-first, bottom nav at ≤768px, full keyboard nav, WCAG AA.
