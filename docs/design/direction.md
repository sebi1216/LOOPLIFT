# Design direction

Decisions Claude can apply, not adjectives. Picked direction: **S1 Loop orbit in Teal Glow (light)**, picked by Sebastian on 2026-10-29 (replaces C Loop Ring, decision #2). Design file `docs/design/looplift.figcraft`, frames named `Final / ...` (row "Picked: S1 Loop orbit"), PNGs in `docs/design/renders/final/`. Last changed: 2026-10-29. Tokens live in code (`src/ui/tokens.ts`); the design file mirrors them by hand.

Design tool: FigCraft 0.11.2 (local app), driven through its MCP (`figcraft-cli mcp --attach 8790`, set in `.mcp.json`). The app is started with `--control 8790` and read and write roots on `docs/design/` (exports can only be written there). Notes: set `parent` on every layer, set sizes directly, never scale components; in a `batch`, `$step` numbers count every command (recount after edits); duplicated frames do not keep id order. Earlier directions (A, B, C, D to G, rounds 3 and 4) stay in the file as reference; they are not the app.

## Design rounds
- 2026-10-28 · round 0 · 3 directions on Today, Calendar, Workout editor (A Loop Cards, B Big Type, C Loop Ring).
- 2026-10-28 · round 1 · Sebastian picked C Loop Ring as it is.
- 2026-10-28 · round 2 · Full set in C (8 screens, empty Today, dark). "Looks good, hand off".
- 2026-10-29 · redo round 1 · 3 new directions on Today, Workout, Exercise (D Track dark lime, E Ledger editorial, F Bento tiles); C kept as reference. He liked D Today, D Workout, E Exercise, F Today (stats on Today); not the colours; bottom bar looked low effort.
- 2026-10-29 · redo round 2 · Mix G (D Today + F stat tiles, D Workout, E Exercise, floating iOS 26 tab bar) in Ember, Midnight, Glacier. He liked G3 Glacier, wants light.
- 2026-10-29 · redo round 3 · G3 Today with gradients (V1 Teal glow, V2 Aurora, V3 Ocean, V4 Sunrise). V1 liked most, "still nothing special".
- 2026-10-29 · redo round 4 · Signature ideas on Today (S1 Loop orbit, S2 Poster type, S3 Own drawing, S4 Progress first) plus a board of 8 palettes. Picked S1 + palette 1 Teal Glow; liked the S3 bench press drawing.
- 2026-10-29 · redo round 5 · New workout flow (Workout tiles, Exercise screen with cues, hint and graph, Summary), drawings per lift, then the full set: Calendar, Change-a-day, Rotation editor, Workouts, Workout editor, Exercises, empty Today, comeback state, dark Today, Workout, Exercise. "Looks good".

## Feel
- Three words: calm, fresh, confident
- Not (Suggestion, from the direction's idea): cluttered, loud, generic
- References: none. The loop orbit (a ring split into the loop's days with a marker on today) is our own idea and the reason S1 was picked (Apple 4.3 risk in `docs/brief.md`).

## The idea in one line
The loop is the hero: a teal gradient card with a ring split into the loop's days shows where today sits; every lift has its own simple line drawing; hints from your own history ("Try 67.5 kg", "Welcome back") tell you what to lift.

## Platform stance
- Platform owns navigation, brand owns content.
- Chrome: native tabs (Today, Calendar, Workouts, Exercises). The floating pill tab bar in the frames is what iOS 26 native tabs render; never rebuild it in JS. Stack headers with back and Save; Change-a-day is a native sheet.
- Icons: SF Symbols on iOS, Material Symbols on Android (the design file uses stand-in strokes).
- Dark mode: follows the system. Designed for Today, Workout, Exercise; other screens use the same tokens.

## Tokens (source of truth: src/ui/tokens.ts)
| Token | Light | Dark | Use |
|---|---|---|---|
| bg | #F2F5F7 | #0A1215 | screen background |
| bgRaised | #FFFFFF | #131E21 | cards, tiles, list rows |
| field | #E8EEF1 | #1C2A2E | kg and reps fields, secondary buttons, search |
| text | #0D1B24 | #E9F1F0 | body text |
| textMuted | #51606B | #9DB0AE | secondary text, labels |
| accent | #0B6B5D | #4FD1B5 | act or selected only: primary button, today, links, ticks |
| onAccent | #FFFFFF | #0A1215 | text and icons on accent |
| accentSoft | #D6EFEA | #12302B | ticked set rows, hint chips, pills |
| artTint | #E6F4F1 | #12302B | background behind drawings |
| loopPull / loopRest | #9DC4BE / #E8EEF1 | #2A5A52 / #1C2A2E | other loop slots on light surfaces |
| restOutline | #7C8A94 | #6B7F84 | dashed outline of rest days (always with the word "Rest") |
| border | #DCE3E8 | #24343A | dividers, chart grid |
| heroFrom → heroTo | #0A5C50 → #0E7C6B | same | hero gradient (Today orbit, exercise header, Summary) |
| onHero / heroChip | #FFFFFF / 12% black | same | text on the hero; chips on the hero |
| danger / success | #B42318 / #067647 | #F97066 / #47CD89 | status, always with icon plus label |

Checked contrast pairs (WCAG ratio, light / dark; computed 2026-10-29 with a script for these values):
| Pair | Light | Dark | Needs |
|---|---|---|---|
| text on bg | 15.99 | 16.49 | 4.5 |
| text on bgRaised | 17.51 | 14.82 | 4.5 |
| text on field | 14.95 | 12.89 | 4.5 |
| text on accentSoft | 14.50 | 12.34 | 4.5 |
| textMuted on bg | 5.93 | 8.34 | 4.5 |
| textMuted on bgRaised | 6.49 | 7.49 | 4.5 |
| textMuted on field | 5.54 | 6.52 | 4.5 |
| accent on bg | 5.86 | 10.02 | 4.5 |
| accent on bgRaised | 6.41 | 9.00 | 4.5 |
| accent on accentSoft | 5.31 | 7.50 | 4.5 |
| onAccent on accent | 6.41 | 10.02 | 4.5 |
| onHero on heroFrom | 7.90 | 7.90 | 4.5 |
| onHero on heroTo | 5.10 | 5.10 | 4.5 |
| onHero on heroChip (over heroTo) | 6.24 | 6.24 | 4.5 |
| text on loopPull | 9.23 | 6.82 | 4.5 |
| danger on bg | 6.00 | 6.79 | 4.5 |
| success on bg | 5.20 | 9.33 | 4.5 |
| accent on artTint (drawings) | 5.67 | 7.50 | 3 (non-text) |
| restOutline on bg | 3.24 | 4.50 | 3 (non-text) |
| restOutline on bgRaised | 3.55 | 4.04 | 3 (non-text) |
Rule: at least 4.5 for body text, 3 for large text and icons. Never put white text on a white tint over the hero (3.9 on heroTo); use heroChip. Recheck when a colour changes.

Note: in the dark frames the primary buttons are #0E7C6B with white text; the tokens use the mint accent with dark text (10.02), which keeps one accent per mode. Suggestion: check this on the iPhone and switch if it looks too bright.

Spacing: 4, 8, 12, 16, 24, 32, 48. Side padding 16. Radius: 12 (fields, day cells), 16 (lists, set rows), 24 (cards, tiles), 32 (hero cards), full (buttons, pills, chips).
Sizes: touch 48, ring 200 (Today). Type ramp unchanged (system font). Hero numbers ("Push", "65 kg") use title/hero sizes.
Gradient in code: Suggestion, decide in `/build-screen` Today (React Native's `experimental_backgroundImage` linear-gradient if SDK 58 supports it on iOS, else `expo-linear-gradient`, which needs Sebastian's OK as a new package).
Motion: fast 150 ms, base 250 ms; respect Reduce Motion. Suggestion: the today marker slides to the next slot after midnight.

## Principles (summary; the full rules Claude follows are in .claude/rules/ui.md)
- Layers: navigation = platform, content = brand. No custom tab bar or header. No glass in content.
- Touch: house rule 48 x 48 on everything tappable (hitSlop is fine; the small pills in the frames need it).
- Text: font scaling stays on, layouts survive 200%. German is often about 30% longer (E).
- Colour: checked pairs only. Status = icon plus label. One accent = act or selected.
- Sizes: small phone, large phone, tablet, web; wide screens use a centred column, max width 640.

## Rules (the ones Claude breaks)
- One accent = act or selected, never decoration. The hero gradient is the one brand surface; do not add more gradients.
- Rest days: dashed restOutline plus the word "Rest". Days set by hand: accent outline plus pin plus the legend "Set by you, outside the loop".
- The two Change-a-day options are equal: same card, same weight, no default, each with a 4-day preview.
- Every lift and every workout has its own drawing (simple line figure in the app's style, own work, never copied); never reuse one drawing for two lifts.
- Hints are rule-based from the user's history (decision rows pending), never AI coaching. Each hint names its reason ("every rep, 3 times").
- Hit area at least 48; 4 pt grid; gap, not margins. Short copy, EN and DE, no em dashes.

## Layout by size
- Phone: single column. Workout tiles in 2 columns (1 column above 200% text).
- Tablet and wide: centred column, max width 640.

## Components for this direction (max 5 at first; extract on second use)
| Component | Source | Status | Used on |
|---|---|---|---|
| HeroCard (gradient, heroChip chips) | ours | to build | Today, Exercise, Summary, Rotation editor |
| LoopRing | ours (react-native-svg, decision #3) | restyle (white on hero) | Today, Rotation editor, Calendar loop card |
| LiftArt (drawing per lift and workout) | ours (react-native-svg) | to build; drawings are a separate art task | Workout tiles, Exercise, Today, Workouts, Exercises |
| HintCard / HintChip | ours | to build | Workout tiles, Exercise, Summary |
| SetRow, DayCell, Button, LineChart | ours (exist) | restyle with new tokens | Exercise, Calendar, everywhere |
