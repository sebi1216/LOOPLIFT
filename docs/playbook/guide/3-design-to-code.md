# 3. From design to code (how-to and why)

Since 29 Oct 2026 every app goes strategy, then designs, then code ([rule 3](../README.md#the-10-rules), [#51](../decisions.md)). You want to see the app before it is programmed, and switching looks is easier in a design tool than in code. Clou showed the risk: about 350 designed frames and no clear way to turn them into an app. This page keeps the design phase small and makes the hand-off to code part of it.

## The rule

**Design first, but small: at most 10 main screens, and the design ends in code.** `/designs` makes 3 key screens in 3 clearly different directions; you comment, mix and pick; the picked direction grows to the remaining main screens; its colours, spacing and type go into `src/ui/tokens.ts`. Then `/build-screen` codes one screen at a time from it. No app screen is coded before a direction is picked.

**The design tool stays fixed per app.** `/designs` checks first whether Claude Code can create designs in FigCraft on your PC. If not: Figma through its MCP, or coded variants on a `/dev/variants` route. The choice is written into `docs/design/direction.md`. Clou switched from Figma to FigCraft within a day and paid with a file repair.

**Suggestion, not a rule:** after about 2 change rounds on the same direction, `/designs` says so and suggests picking. You decide.

## The path for slice 1

1. **Strategy** in `docs/brief.md` (`/kickoff`), including the main screens list (at most 10).
2. **Directions**: 3 key screens in 3 directions (`/designs`).
3. **Pick**, then the remaining main screens in the picked direction, plus the empty state and dark mode of the key screens.
4. **Tokens in code** in `src/ui/tokens.ts`, contrast checked, and `docs/design/direction.md` and `screens.md` filled.
5. **Screens in code**, one per session with `/build-screen`, from the picked design.
6. **Components on second use**: a pattern becomes a component when it appears twice. Max 5 at first.

## Direction: decisions, not adjectives

`docs/design/direction.md` holds choices Claude can apply: three feel words and three anti-words ("not corporate, not cute, not cluttered"); three references, each with the one thing to borrow (never copied layouts or logos); colours, fonts and a dark mode decision now (cheap with tokens, expensive later). Unsure? Ask for 2 or 3 variants of one screen on `/dev/variants` and pick one.

## The cast (demo data)

The demo data in `src/data/` starts with a "Cast" block: 2 or 3 personas and one hero content set, no real people. Every screen, test and screenshot uses the same cast. Clou's story bible did this and kept 13 design rounds consistent; it also makes the smoke test page and Mom Test demos believable.

## Styling

The starter ships the Expo default (StyleSheet plus tokens, `@expo/ui` for native controls). That covers most designs. If the picked design clearly needs a styling library (a strong brand look), `/designs` says why and asks first. The option then: Uniwind (free, Tailwind v4) plus React Native Reusables, tried in a throwaway first (about 30 minutes; it is young). The repo's `CLAUDE.md` has one line that settles the styling system, because some Expo skills say "no Tailwind" and others assume it.

## Tokens: code is the source of truth

- Semantic names in `src/ui/tokens.ts` (`bg`, `text`, `accent`, `onAccent`, `border`, ... each light and dark), plus spacing, radii, sizes (`touch` 48) and a type ramp. Check contrast once per pair.
- Screens use tokens only: no hex colours, no raw font sizes, no fixed text heights.
- A design file mirrors the code by hand (20 to 40 tokens); automatic sync is a team tool.

## Platform owns navigation, brand owns content

Expo Router native tabs, native headers, native sheets and `@expo/ui` controls give iOS Liquid Glass and Android Material behaviour for free. The brand goes into the content: cards, colours, type, imagery. Never design a custom tab bar or header; no glass effects in the content layer.

## Principles (compact)

Claude gets these as rules in `.claude/rules/ui.md`; here is the why.

| Topic | Rule |
|---|---|
| Touch | Hit area at least 48 on everything tappable. Covers iOS 44 pt and Android 48 dp; WCAG 2.2 AA (2.5.8) asks only 24 px, 44 px is AAA (2.5.5) (https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) |
| Text | Font scaling stays on; layouts survive 200%. German is about 30% longer (E): screenshot once in DE |
| Colour | 4.5:1 for body text, 3:1 for large text and icons, light and dark. Status = icon plus label. One accent = act or selected |
| Platform | SF Symbols on iOS, Material Symbols on Android. Never block Android back or the iOS edge swipe |
| Sizes | Small phone, large phone, tablet, web. Android 16 tablets (apps targeting API 36) can't lock portrait; a temporary opt-out exists until API 37 (https://developer.android.com/about/versions/16/behavior-changes-16): every screen needs a wide layout (a centred column is enough) |
| Motion | Respect Reduce Motion; short springs over long animations |

Sources: Apple HIG (https://developer.apple.com/design/human-interface-guidelines/), Android accessibility (https://developer.android.com/guide/topics/ui/accessibility/apps).

## Which design tool

`/designs` checks them in this order and you confirm:

1. **FigCraft**: free, known from Clou, installed on your PC. Claude must be able to create frames through its MCP, not only read them; `/designs` tests that on a throwaway file first. Don't scale components: set sizes directly (in Clou, scaling broke many texts).
2. **Figma** through the Figma MCP: free seats get very few MCP calls (see reference); a Full seat (about 16 to 20 EUR per month) for real design work. A Dev seat only inspects.
3. **Coded variants** on a `/dev/variants` route in the web preview, with screenshots saved to `docs/design/renders/`. Always works, no account.

Claude Design (all plans) is another option for exploring; its standalone version at claude.ai/design closes on 14 Dec 2026 (see reference), so don't make it the fixed tool for an app that runs past that date.

In a design file: variables for everything, auto layout, size variants instead of scaling, real layer names.

## Visual check: what it can and can't do

- Claude's screenshot check catches **big** errors (missing elements, overflow, cut text, broken dark mode), not 12 vs 16 px. So `/build-screen` also asks the `design-reviewer` subagent.
- **Check numbers, not pixels**: a search for hex colours or raw numbers in screens finds drift best.
- **You are the final judge**, five minutes per screen. Your OK is the gate.
