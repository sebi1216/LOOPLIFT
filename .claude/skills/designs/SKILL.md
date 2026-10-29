---
name: designs
description: Phase 2 (designs) of a new app. Makes several clearly different design directions for the app's main screens (at most 10) in FigCraft, falling back to Figma or coded variants, lets Sebastian compare, comment, mix and pick one, then writes the picked look into src/ui/tokens.ts, docs/design/direction.md and docs/design/screens.md. Builds no app screens in code. Sebastian runs it with /designs after /kickoff (again to continue or to redo the designs).
argument-hint: "[optional: wishes for the look, reference apps, or 'continue']"
disable-model-invocation: true
---

# Designs (phase 2)

Wishes: $ARGUMENTS

Goal: Sebastian sees what the app will look like and picks one direction before any screen is coded. Designs set the tone; they are not the app. At most 10 screens in total.
Work through the steps in order. Say in one line which step you are on. Ask with AskUserQuestion (options plus a default). Plain words.

## 0. Before you start
- Read `docs/brief.md` (idea, core loop, main screens list in section 2, must-haves, no-gos), `docs/input/` for any look or brand wishes, `src/data/demo.ts` (the cast), `.claude/rules/ui.md` and `docs/design/direction.md`.
- If `docs/design/direction.md` already names a picked direction: ask whether to redo the designs or continue an unfinished run. Never overwrite a picked direction without his OK.
- No main screens in the brief: ask for them (core loop first, at most 10) and add them to the brief.

## 1. Screens to design
- Show the list from the brief and confirm it: at most 10 screens in total, core loop first.
- Pick the 3 key screens that show the most of the look (usually the home screen of the core loop, one list, one detail or form). The directions in step 3 use only these 3; the picked direction gets the rest in step 5.

## 2. Design tool (check before designing)
- Look for FigCraft tools in this session (`/mcp`, or tool names that contain "figcraft"). If they exist, test on a throwaway file: create one frame (402 x 874) with a text and a rectangle, read it back, export a PNG. Say what worked.
- FigCraft not connected: ask Sebastian how FigCraft's MCP is set up on this PC (he used it before). Never guess install commands. Note from an earlier app: scaling components in FigCraft once broke many texts, so do not scale components; set sizes directly.
- If FigCraft cannot create designs, offer, with a default:
  - (a) Figma through the Figma MCP, if it is connected (free seats have few MCP calls a month; check the limit message),
  - (b) coded variants: a temporary `/dev/variants` route in the web preview that shows the 3 directions side by side, with screenshots saved to `docs/design/renders/` (always works, no account; default if (a) is not available).
- Write the chosen tool into `docs/design/direction.md` ("Design tool: ..."). It stays fixed for this app unless he changes it.

## 3. Directions (3, clearly different)
- Make 3 directions that differ in idea, not only in colour: for example layout (cards vs list vs big type), mood (calm, bold, playful), density and how the core loop action is shown. Give each a short name and three feel words.
- Each direction shows the 3 key screens at iPhone size (402 x 874), filled with the cast from `src/data/demo.ts` (invented people only, no real photos, no real logos, no copied layouts of real apps), English text.
- Rules that hold in every direction: native iOS navigation (tab bar, headers, sheets look like iOS), tappable things at least 48 x 48, text contrast at least 4.5:1 (large text 3:1), status shown with icon plus label, one accent colour for actions.
- Save a PNG of every screen to `docs/design/renders/<direction>/<screen>.png` and put the frame or file link next to it in your report.
- Show him all 3 side by side (in the design tool and as the PNG paths), with 2 lines per direction: the idea and what it is good or bad for in this app.

## 4. Feedback rounds
- After each round ask: pick one, change one, or mix (for example "layout of A, colours of C"). Change only what he asked for; say what you changed.
- Suggestion to him, not a rule: after about 2 change rounds on the same direction, say so and suggest picking; he decides whether to continue.
- Write each round in one line into `docs/design/direction.md` under "Design rounds" (date, what changed, why).

## 5. Finish the picked direction
- Design the remaining main screens (total at most 10) in the picked direction, plus the empty state of the core loop screen and the picked look in dark mode for the key screens.
- Show him the full set once; fix what he points out.

## 6. Hand-off to code (no app screens in code yet)
- `src/ui/tokens.ts`: colours (light and dark), spacing, radius and type ramp from the picked direction. Compute the contrast ratio of every text and background pair with a small script and list the results in `docs/design/direction.md`; fix any pair under 4.5 (body) or 3 (large text, icons) before writing.
- `docs/design/direction.md`: picked direction, design tool and link, feel words and anti-words, rules, layout by size, components the screens need (max 5 at first).
- `docs/design/screens.md`: one row per designed screen with its route (planned), the frame link or PNG path, `checked-web` and `checked-device` empty.
- Expo default styling (StyleSheet plus tokens) covers most designs. If the picked design clearly needs a styling library, say why and ask first; see `docs/playbook/guide/3-design-to-code.md`.
- `npm run check` must stay green (tokens are code).
- Propose the `docs/decisions.md` row ("Design direction <name> picked", Who: Sebastian) and add it after he confirms the wording.
- `docs/now.md`: phase 3 code, next step "/build-screen <first screen of the core loop>".
- Commit `docs: design direction <name>` (tokens, docs, renders). Do not push; that is `/wrap-up`.
- Tell him in max 8 lines: the picked direction, where the designs are, what changed in the code (tokens only), and the next step: `/wrap-up`, then a new session with `/build-screen <first screen>`.
