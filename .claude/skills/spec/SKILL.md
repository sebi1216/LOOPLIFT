---
name: spec
description: Interview Sebastian about one feature and write a one-page spec with acceptance checks and a "Done when" line to docs/specs/. Use when he runs /spec, or says "let's spec <feature>" for something that touches 3 or more files or that he is unsure about.
argument-hint: "[feature in a few words]"
---

# Write a spec

Feature: $ARGUMENTS

1. Read `docs/brief.md` (core loop, slice card, no-gos), `docs/now.md` and `docs/specs/_template.md`.
2. If the feature is a no-go or not in the current slice, say so first and suggest the toy box. Continue only if Sebastian says so, and log it in `docs/decisions.md`.
3. Interview him with AskUserQuestion: max 10 questions, only the hard parts (edge cases, empty and error states, what is out of scope, what "done" looks like). Offer concrete options with a default. Do not ask what the brief already answers.
4. Write `docs/specs/NNN-<short-name>.md` from the template (NNN = next free number), max 80 lines:
   - 3 to 7 acceptance checks, each testable ("When I ..., the app shows ..."), each saying HOW it is checked: Jest test, Playwright test, screenshot, or a device tap.
   - Logic (rules, calculations, data changes) is built red/green: the failing test first, then the code. Name those tests in the spec.
   - One "Done when" line a machine can check (for example "`npm run check` and `npm run test:e2e` pass and `e2e/screenshots/<screen>.png` exists"). It can be pasted into `/goal`.
   - Leave "Files and interfaces" for plan mode.
5. Unanswered questions go to the spec's "Open questions", never invented answers.
6. Stop. Tell him in 3 lines: where the spec is, the riskiest open question, and "build it in a fresh session: /clear, plan mode, then: build docs/specs/NNN-<name>.md".

Do not write code in this skill.
