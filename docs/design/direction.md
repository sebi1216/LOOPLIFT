# Design direction

Decisions Claude can apply, not adjectives. Picked direction: **C · Loop Ring**, picked by Sebastian on 2026-10-28, design file `docs/design/looplift.figcraft` (frames named `C / ...`, PNGs in `docs/design/renders/c-loop-ring/`). Last changed: 2026-10-28. Tokens live in code (`src/ui/tokens.ts`); the design file mirrors them by hand.

Design tool: FigCraft 0.11.2 (local app), driven through its MCP (`figcraft-cli mcp --attach 8790`, set in `.mcp.json`). The app is started with `--control 8790` and read and write roots on `docs/design/` (exports can only be written there). Design file: `docs/design/looplift.figcraft`. Key screens for the directions: Today, Calendar, Workout editor (confirmed 2026-10-28). Note: set `parent` on every layer, set sizes directly, never scale components. Directions A and B stay in the file as reference (rows 1 and 2); they are not the app.

## Design rounds
- 2026-10-28 · round 0 · 3 directions on Today, Calendar, Workout editor in `docs/design/looplift.figcraft`, PNGs in `docs/design/renders/` (A Loop Cards, B Big Type, C Loop Ring). Contrast fixes before showing: A tint to #EAF5F1 (4.60), C rest outline to #9C8573 (3.32).
- 2026-10-28 · round 1 · Sebastian picked C Loop Ring as it is, no changes. Next: remaining screens, empty Today, dark mode.
- 2026-10-28 · round 2 · Full set in C (8 main screens, empty Today, dark Today, Calendar and Workout editor). Sebastian: "Looks good, hand off".

## Feel
- Three words: playful, warm, visual
- Not (Suggestion, from the direction's idea): corporate, loud, cluttered
- References: none. The loop ring is our own idea and the reason C was picked over generic planner layouts (Apple 4.3 risk in `docs/brief.md`).

## The idea in one line
The loop is visible: a ring split into the loop's days shows where today sits (Today, Rotation editor), and every other screen speaks the same loop language (loop chips, "Day 1 in your loop", dashed rest days).

## Platform stance
- Platform owns navigation, brand owns content.
- Chrome: native (native tabs with 4 tabs Today, Calendar, Workouts, Exercises; stack headers with back and Done/Save; Change-a-day is a native sheet). The large titles in the designs map to native large-title headers.
- Icons: SF Symbols on iOS, Material Symbols on Android (the design file uses simple stand-in strokes).
- Dark mode in slice 1: yes, follows the system. Designed for Today, Calendar, Workout editor; other screens use the same tokens.

## Tokens (source of truth: src/ui/tokens.ts)
| Token | Light | Dark | Use |
|---|---|---|---|
| bg | #FFF8F1 | #17110D | screen background (warm cream / warm near-black) |
| bgRaised | #FFFFFF | #241B15 | cards, list rows, fields, day cells |
| text | #2A1B12 | #F7EEE6 | body text |
| textMuted | #6B5547 | #C2AE9F | secondary text, labels |
| accent | #6D3FD9 | #A98BFA | act or selected only: primary button, today, current loop slot, links |
| onAccent | #FFFFFF | #17110D | text and icons on accent |
| accentSoft | #EFE8FC | #2E2445 | secondary buttons, steppers, sets x reps pills, changed days in previews |
| loopPull | #E4D9FA | #3B3058 | loop ring and chips: other workout slots |
| loopRest | #F1E6DA | #3A2E25 | loop ring and chips: rest slot |
| restOutline | #9C8573 | #8A7464 | dashed outline of rest days (always with the word "Rest") |
| border | #EFE2D6 | #3A2E25 | dividers, tab bar edge |
| danger / success | #B42318 / #067647 | #F97066 / #47CD89 | status, always with icon plus label |

Checked contrast pairs (WCAG ratio, light / dark; computed 2026-10-28 with a script for these values):
| Pair | Light | Dark | Needs |
|---|---|---|---|
| text on bg | 15.78 | 16.33 | 4.5 |
| text on bgRaised | 16.61 | 14.75 | 4.5 |
| textMuted on bg | 6.62 | 8.77 | 4.5 |
| textMuted on bgRaised | 6.96 | 7.93 | 4.5 |
| textMuted on accentSoft | 5.84 | 6.77 | 4.5 |
| onAccent on accent | 6.24 | 6.91 | 4.5 |
| accent on bg | 5.93 | 6.91 | 4.5 |
| accent on bgRaised | 6.24 | 6.25 | 4.5 |
| accent on accentSoft | 5.24 | 5.34 | 4.5 |
| text on loopPull | 12.35 | 10.47 | 4.5 |
| text on loopRest | 13.51 | 11.47 | 4.5 |
| restOutline on bg | 3.32 | 4.24 | 3 (non-text) |
| danger on bg | 6.25 | 6.72 | 4.5 |
| success on bg | 5.41 | 9.23 | 4.5 |
Rule: at least 4.5 for body text, 3 for large text and icons. Recheck when a colour changes.

Spacing: 4, 8, 12, 16, 24, 32, 48. Side padding 16. Radius: 12 (day cells), 16 (fields, grouped lists), 22 (cards, rows), full (buttons, pills, bubbles).
Sizes: touch 48, ring 200 (Today), ringSmall 84 (Rotation editor), dayBubble 44 (inside a 48+ tappable column with its label).
Type ramp: hero 36 bold (workout name in the ring), title 30 bold, headline 17 semibold, body 17, callout 15, caption 13, label 11 medium. Fonts: system font.
Motion: fast 150 ms, base 250 ms; respect Reduce Motion. Suggestion: the ring segment can slide to the next slot after midnight; skip it if Reduce Motion is on.

## Principles (summary; the full rules Claude follows are in .claude/rules/ui.md)
- Layers: navigation = platform, content = brand. No custom tab bar or header. No glass in content.
- Touch: house rule 48 x 48 on everything tappable (hitSlop is fine). Covers iOS 44 pt and Android 48 dp; WCAG 2.2 AA asks only 24 px.
- Text: font scaling stays on, layouts survive 200%. German is often about 30% longer (E).
- Colour: checked pairs only. Status = icon plus label. One accent = act or selected.
- Platform differences: SF Symbols on iOS, Material Symbols on Android. Never block Android back or the iOS edge swipe.
- Sizes: small phone, large phone, tablet, web. Every screen needs a wide layout (a centred column with max width 640 is enough).
- Motion: respect Reduce Motion; short springs over long animations.

## Rules (the ones Claude breaks)
- One accent colour = act or selected, never decoration. Pull and Rest in the ring use loopPull and loopRest, never a second bright colour.
- Rest days: dashed restOutline plus the word "Rest". Days set by hand: accent outline plus pin icon plus label; the legend "Set by you, outside the loop" sits under the calendar.
- The two Change-a-day options are equal: same card, same weight, no default, each with a 4-day preview of what changes.
- Hit area at least 48; 4 pt grid; gap, not margins. Steppers (40 high) and day bubbles (44) get hitSlop.
- Status = icon plus label.
- Short copy, EN and DE, no em dashes.

## Layout by size
- Phone: single column.
- Tablet and wide: centred column, max width 640 (size.maxContent). The ring stays 200.
- Web: same as tablet, centred.

## Components for slice 1 (max 5 at first; extract on second use)
| Component | Source | Status | Used on |
|---|---|---|---|
| Button (primary, soft) | ours (src/ui/button.tsx, restyle to pill + accentSoft variant) | starter | Today, empty Today, editors |
| LoopRing | ours (react-native-svg is not in the project; Suggestion: draw arcs with View borders or ask before adding a package) | to build | Today, Rotation editor |
| DayBubble / DayCell | ours | to build | Today strip, Calendar grid, previews |
| Stepper (− value +) | ours, or @expo/ui stepper if it matches | to build | Workout editor |
| Card row (drag handle, title, subtitle, trailing) | ours | to build | Workout editor, Rotation editor, Workouts, Exercises |
