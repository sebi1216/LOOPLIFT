---
name: build-screen
description: Build one app screen from a description, a spec, a Claude Design handoff, or a Figma/FigCraft frame, using our tokens, components and the demo cast, then check it at several sizes and report with evidence. Use when Sebastian says "build <screen>", gives a design link or bundle, or runs /build-screen.
argument-hint: "[screen name, spec file, design link or frame id]"
---

# Build one screen

Screen: $ARGUMENTS

## 1. Understand
- Read `docs/brief.md` (is this screen in the current slice?), `docs/design/direction.md`, `docs/design/screens.md`, and the spec in `docs/specs/` if there is one. `.claude/rules/ui.md` applies.
- Use the Expo skills expo-router (tabs, stacks, sheets), expo-ui (native controls) and expo-native-ui. The styling line in CLAUDE.md wins over skill advice.
- If `docs/design/direction.md` says no direction is picked yet, say so and suggest `/designs` first. Build anyway only if Sebastian says so.
- Design input:
  - Picked design from `/designs`: the frame link or picture for this screen in `docs/design/screens.md`. This is the default.
  - Description only: use direction.md. If the look is unclear, offer 2 or 3 variants side by side on a temporary `/dev/variants` route and let Sebastian pick.
  - Claude Design handoff bundle: read its README and designs. Its code is web reference only; translate to our tokens.
  - Figma: follow the Figma MCP server's own instructions. One get_design_context and one get_screenshot per screen; paid seats have daily limits.
  - FigCraft: inspect the frame and export a PNG through its MCP.
  - Save the design image (if any) to `docs/design/renders/<screen>.png`.

## 2. Plan (once per screen, wait for OK)
- Route file, components reused, new parts (inline first; extract to `src/ui/` only on second use, max 5 components at first).
- Demo data from the cast in `src/data/demo.ts`, and the states: empty, loading, error, filled, each reachable with `?state=<name>`.
- New strings (EN and DE). Logic: which test comes first (red/green).
- "Done when": the machine check for this screen (from the spec, or write one).
- Ask again later only for: a new dependency, an API change to an existing component, a new route.

## 3. Build
- Native tabs, stack headers and sheets for navigation; never custom ones.
- Tokens only; strings through `src/i18n`; hit area at least 48 with accessibilityRole and accessibilityLabel.
- No backend calls: data comes from `src/data/`.
- Explain each new file in 2 or 3 plain sentences.

## 4. Check (max 3 rounds)
- Web preview at 402 x 874. Save a screenshot to `docs/design/checks/<screen>.png` (a Playwright test in `e2e/` is the easiest way; e2e tests fail on any console error).
- Ask the `design-reviewer` subagent for the list of differences. Fix big ones first.
- Open `/layout-wall.html`: small phone, large phone, tablet, desktop. Nothing overflows or gets cut off.
- Dark mode, German text, and each `?state=` once.
- After 3 rounds stop and list what still differs and why.

## 5. Finish
- `npm run check` passes; a test for any logic, and a Playwright test that opens the screen.
- Pass the output of `git status --porcelain` to the `native-gap-checker` subagent (a code-reading pre-check, not a device test); put its "Test on a device" taps in the report.
- Set the screen to `checked-web` in `docs/design/screens.md`. Only Sebastian sets `checked-device`, after he opened it on the iPhone. Only if Android is a target platform in `docs/brief.md`: also the Android emulator (`a` in the dev server) before `checked-device`.
- Show Sebastian the screenshot and wait for his look-OK. Then commit `feat: <screen>`. Do not push; that is /wrap-up.
- Report in 6 lines, with evidence:
  1. Built: what, and the "Done when" result (command plus its last output line, screenshot path)
  2. Choices I made for you (confirm or change): defaults you picked that he did not decide
  3. Try these taps (device)
  4. Known differences
  5. Open questions
  6. Files changed
