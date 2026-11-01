---
name: build
description: Build app screens or features from the picked design, using our tokens, components and the demo cast, one subagent per screen, then check them in light, dark, German and empty states and report with evidence. Use when Sebastian says "build <topic>", gives a feature list, or runs /build.
argument-hint: "[topic from docs/design/screens.md, all, or a pasted feature list]"
---

# Build

Input: $ARGUMENTS (a topic from `docs/design/screens.md`, `all`, or a pasted feature list)

## 1. Understand
- Read `docs/brief.md`, `docs/design/direction.md`, `docs/design/screens.md`, `docs/design/review-<topic>.md` if it exists, and the spec in `docs/specs/` if there is one. `docs/design/rules.md` and `.claude/rules/ui.md` apply.
- Use the Expo skills expo-router (tabs, stacks, sheets), expo-ui (native controls) and expo-native-ui. The styling line in CLAUDE.md wins over skill advice.
- If `docs/design/direction.md` says no direction is picked yet, say so and suggest `/designs` first. Build anyway only if Sebastian says so.
- Design input:
  - Picked design from `/designs`: the frame link or picture for each screen in `docs/design/screens.md`. This is the default.
  - Claude Design handoff bundle: read its README and designs. Its code is web reference only; translate to our tokens.
  - Figma: follow the Figma MCP server's own instructions. One get_design_context and one get_screenshot per screen; paid seats have daily limits.
  - FigCraft: inspect the frame and export a PNG through its MCP.
  - Save the design image (if any) to `docs/design/renders/<screen>.png`.

## 2. Plan (one message, no waiting)
- For each screen or feature: route file, test file, parts reused, states (empty, loading, error, filled, each reachable with `?state=<name>`), new strings (EN and DE), the "Done when" machine check.
- Shared files that must change (navigation, store, theme, tokens, i18n).
- Wait for OK only if a new dependency or a data-model change is needed. Otherwise start at once.

## 3. Build
- Shared files first: the main session changes navigation, store, theme, tokens and i18n, alone, before any subagent starts.
- Then one subagent per screen or feature (`model: sonnet`), each with an explicit file list: its route file and its test. The lists never overlap, and no subagent touches a shared file. If one needs a shared change, it reports back and the main session makes it.
- Each subagent gets: the design picture, the rules files, its states, and these rules:
  - Native tabs, stack headers and sheets for navigation; never custom ones.
  - Tokens only; strings through `src/i18n`; hit area at least 48 x 48 with accessibilityRole and accessibilityLabel.
  - No backend calls: data comes from `src/data/`.
  - Logic is red/green: the failing test first.
- Gallery: the dev-only route `src/app/_gallery/<topic>.tsx` renders every screen of the topic in a scrollable list of 390 x 844 frames. It shows nothing outside `__DEV__`.

## 4. Check (max 2 fix rounds)
- `npm run check`.
- Playwright screenshots of each screen in light, dark, German and empty states, saved to `docs/design/checks/<screen>-<state>.png` (e2e tests fail on any console error).
- In the background: the `design-reviewer` subagent (differences from the design) and the `native-gap-checker` subagent (pass it `git status --porcelain`; a code-reading pre-check, not a device test).
- Fix big differences first. After 2 rounds stop and list what still differs and why.

## 5. Finish
- Set each screen to `checked-web` in `docs/design/screens.md`. Only Sebastian sets `checked-device`, after he opened it on the iPhone. Only if Android is a target platform in `docs/brief.md`: also the Android emulator (`a` in the dev server) before `checked-device`.
- Commit `feat: <topic>`. Do not push; that is /wrap-up.
- Report in 6 lines, with evidence:
  1. Built: what, and the "Done when" result (command plus its last output line, screenshot path, gallery route)
  2. Choices I made for you (confirm or change): defaults you picked that he did not decide
  3. Try these taps (device)
  4. Known differences
  5. Open questions
  6. Files changed
