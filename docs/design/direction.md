# Design direction

Decisions Claude can apply, not adjectives. `/designs` fills this from the direction Sebastian picks. Picked direction: <none yet | name, date, link to the design file>. Last changed: <date>. Tokens live in code (`src/ui/tokens.ts`); a design file, if any, mirrors them by hand.

## Feel
- Three words: <e.g. fast, bold, warm>
- Not: <three anti-words, e.g. corporate, cute, cluttered>
- References (principles only, never copied layouts or logos):
  - <App>: <the one thing to borrow, e.g. how the feed card shows stats>
  - <App>: ...
  - <App>: ...

## Platform stance
- Platform owns navigation, brand owns content.
- Chrome: native (native tabs, stack headers, sheets, @expo/ui controls) | custom (why: ...)
- Icons: SF Symbols on iOS, Material Symbols on Android | one custom set (name)
- Dark mode in slice 1: yes (starter has light and dark tokens) | no. Default: system.

## Tokens (source of truth: src/ui/tokens.ts; starter values below)
| Token | Light | Dark | Use |
|---|---|---|---|
| bg | #FFFFFF | #0B0F14 | screen background |
| bgRaised | #F3F4F6 | #1A2029 | cards, sheets |
| text | #111827 | #F3F4F6 | body text |
| textMuted | #4B5563 | #AAB2BD | secondary text |
| accent | #1D6FD8 | #5AA2FF | act or selected only |
| onAccent | #FFFFFF | #0B0F14 | text and icons on accent |
| border | #E5E7EB | #2A313B | dividers, inputs |
| danger / success | #B42318 / #067647 | #F97066 / #47CD89 | status, always with icon plus label |

Checked contrast pairs (WCAG ratio, light / dark; computed 28 Oct 2026 for the starter values):
| Pair | Light | Dark |
|---|---|---|
| text on bg | 17.7 | 17.5 |
| textMuted on bg | 7.6 | 9.0 |
| onAccent on accent | 4.9 | 7.4 |
| accent on bg (icons, links) | 4.9 | 7.4 |
Rule: at least 4.5 for body text, 3 for large text and icons. Recheck when a colour changes.

Spacing: 4, 8, 12, 16, 24, 32, 48. Side padding 16. Radius: 8, 12, 16, full.
Type ramp: title 28, headline 17 semibold, body 17, caption 13. Fonts: system font (add a brand font here if you pick one).
Motion: fast 150 ms, base 250 ms; respect Reduce Motion.

## Principles (summary; the full rules Claude follows are in .claude/rules/ui.md)
- Layers: navigation = platform, content = brand. No custom tab bar or header. No glass in content.
- Touch: house rule 48 x 48 on everything tappable (hitSlop is fine). Covers iOS 44 pt and Android 48 dp; WCAG 2.2 AA asks only 24 px.
- Text: font scaling stays on, layouts survive 200%. German is often about 30% longer (E).
- Colour: checked pairs only. Status = icon plus label. One accent = act or selected.
- Platform differences: SF Symbols on iOS, Material Symbols on Android. Never block Android back or the iOS edge swipe.
- Sizes: small phone, large phone, tablet, web. Android 16 tablets can't lock portrait, so every screen needs a wide layout (a centred column with max width 640 is enough).
- Motion: respect Reduce Motion; short springs over long animations.

## Rules (5 to 8, the ones Claude breaks; add yours)
- One accent colour = act or selected, never decoration
- Hit area at least 48; 4 pt grid; gap, not margins
- Status = icon plus label
- Short copy, EN and DE, no em dashes

## Layout by size
- Phone: single column. Tablet and wide: <centred column, max width 640 | 2 columns | sidebar>.
- Web: same as tablet, centred.

## Components for slice 1 (only what slice 1 needs; extract on second use, max 5 at first)
| Component | Source: ours / @expo/ui / kit | Status |
|---|---|---|
| Button | ours (src/ui/button.tsx) | starter |
