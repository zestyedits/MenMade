# Chat / Field Channel — `/chat`

## What this page is for
The real-time squad chat ("field channel"): squad list, message stream, roster, code-of-conduct gate, moderation.

## How it looks today
Responsive split:
- **Desktop:** `300px` **SquadList** sidebar | flex-1 chat stream | `280px` **Roster** rail.
  - **SquadList:** *"Your squads / Channels"*, `N / cap`, per-squad rows (CALLSIGN · focus, last-message time-ago, name, `author · preview`), active row has a 2px ember left border; footer *"Find a squad / N slots open"* or *"Squad cap hit…"*.
  - **ChatHeader:** *"{CALLSIGN} / Squad ledger"*, squad name, `Cycle {code}`, `Day DD / total`, `Dial {intensity}`, `Live · N / total`, **Rules** button.
  - **MessageList:** day dividers (Today/Yesterday/weekday/date) + message items (run-leading shows avatar + byline + timestamp; continuations are bare; own messages get an ember left border; reactions as count badges; per-message menu = report/block). Empty: *"Nothing to print / Field channel quiet…"*.
  - **Composer:** preview line *"You / Filing to {squad} / {callsign} / N on channel"*, hints *"Enter to file · Shift+Enter for newline"*, `len / MAX`. Moderation: hard-block (red) / soft-warn (amber).
  - **Roster:** stats (cycle/online/intensity), member list with online dots + crown for lead, footer *"Frequency / B-04 / Encrypted local"*.
- **Mobile:** SquadList full-screen; selecting a squad shows the stream full-width with a back button (Roster hidden).
- **No squads:** centered empty state → Founders Circle.
- **CoC sheet** modal: *"Squad chat / code / The bouncer rules."* + 5 rules.

Optimistic sends (`opt-` ids), reported/blocked handling, reactions. Uses `Avatar`, `LiveDot`, `MonoLabel`, `Button`, Phosphor.

## Redesign goals
- Make the three-pane desktop layout feel like a comms console (the "field channel" / "ledger" framing) without becoming noisy. Keep the ember accents to own-messages, live dots, and active states only.
- Strengthen the message run grouping (lead message vs continuation) and the day dividers so the thread is easy to scan.
- Make the mobile single-pane transition (list ↔ stream ↔ roster) clean and keyboard/back-button friendly.

## The prompt (paste into Lovable)

> Redesign our squad **Chat** ("field channel") for MenMade (brand rules in `00-BRAND-SYSTEM.md` — dark,
> ember sparingly, Geist Sans/Mono, mono kickers, no emoji, dry instrument-panel voice). Desktop is a
> three-pane comms console: left **squad list** (`~300px`: *"Your squads / Channels"*, `N / cap`, rows with
> CALLSIGN · focus, last-message time-ago, name and `author · preview`; active row marked with a 2px ember
> left border; footer showing open slots); center **message stream** with a header (*"{CALLSIGN} / Squad
> ledger"*, squad name, `Cycle {code}`, `Day DD / 30`, `Dial {intensity}`, `Live · N / total`, a **Rules**
> button), day dividers (Today / Yesterday / weekday / date), and messages grouped into runs — the
> run-leading message shows avatar + name + handle + timestamp, continuations are bare with a hover
> timestamp, own messages get a subtle ember left edge, reactions render as small count badges, and each
> message has a quiet report/block menu; right **roster** rail (`~280px`: cycle/online/intensity stats, member
> list with online dots and a crown on the lead, a mono "encrypted local" footer). Composer with a preview
> line (*"You / Filing to {squad} / {callsign} / N on channel"*), `Enter to file · Shift+Enter for newline`,
> a char counter, and inline moderation states (hard-block in red, soft-warn in amber). Deadpan empty state:
> *"Nothing to print. Field channel quiet."* A code-of-conduct sheet (*"The bouncer rules."* + 5 rules) gates
> first send. On mobile, collapse to a single pane that swaps squad-list ↔ stream ↔ roster with a clear back
> control and keyboard equivalents. Live region on incoming messages, optimistic send states, skeletons not
> spinners, WCAG AA.
