---
name: kickoff
description: Phase 1 (strategy) of a new app made from this template. Reads Sebastian's strategy files in docs/input/ (PowerPoints, documents, PDFs, notes), fills docs/brief.md with him, names the app, writes the demo cast, checks Expo Go, runs the checks, the preview and the safety test, and shows the starter app on his iPhone so the whole pipeline is proven. It builds no app screens: designs come next with /designs. Sebastian runs it once with /kickoff (again to continue after a stop).
argument-hint: "[optional: extra notes, or which files in docs/input/ matter most]"
disable-model-invocation: true
---

# Kickoff (phase 1: strategy)

Input: $ARGUMENTS

The template already ships a working Expo app (SDK 58). Kickoff personalises it; it never re-scaffolds. It writes no app screens: the order is 1. strategy (this skill), 2. designs (`/designs`), 3. code (`/build-screen`).
Work through the steps in order. Say in one line which step you are on. Ask with AskUserQuestion (options plus a default). Explain every change in plain words.
Tell Sebastian once at the start: "You will get some approval prompts. Approve edits inside `docs/` freely; read every edit outside `docs/` and every push or install."
PC setup (Git, Node, gh, Claude Code) is in `docs/playbook/guide/1-first-day.md` section B. Point there instead of repeating it.

**Setup-day stop rule.** If setup plus kickoff gets long (about 4 hours) or he is tired: check `docs/playbook/troubleshooting.md` before you call a failure final, finish the current step, write the next step into `docs/now.md`, commit `docs/` only, and tell him to continue with `/kickoff` next time. This is about one tiring day, not a project limit.

## 0. Before you start
- If `app.json` no longer has the name `app-starter`, kickoff already ran or stopped part-way: find the first unfinished step (from `docs/now.md` and the files) and continue there.
- `git status` must be clean (files he dropped into `docs/input/` are fine). If only `.claude/settings.json` changed and `git diff` shows only reordered lines (a plugin install with `--scope project`), ask him to run `git restore .claude/settings.json` himself. Next time the install uses `--scope local` (no repo diff).
- Ask: "Is this an Accenture-managed PC, or is client data on it?" If yes: stop and suggest a private PC or a separate Windows user.
- Permission mode: ask which mode the Desktop app's mode selector shows. Week 1 suggestion: Manual (remembered per folder). Prompts help him learn; they are not the safety.
- Expo tools loaded twice? Keep ONE Expo MCP: the `expo` plugin for Claude Code (install with `--scope local`; this repo already enables it). If the claude.ai Expo connector also shows up in `/mcp`, turn it off for this repo.
- Run `npm -v`. 11.10 or newer: the 7-day package delay in `.npmrc` works. Older: the delay is off, and rule 3 in CLAUDE.md (package at least 7 days old) is the stand-in. Do not fight it today.

## 1. Strategy into the brief (docs/brief.md, about 70 lines)
- Read every file in `docs/input/` and anything in the input above. PDFs, images, Markdown and text you can read directly. For a `.pptx`, `.docx` or `.xlsx` you cannot read, ask him to save it as PDF into `docs/input/` instead of guessing its content.
- Summarise in 5 lines what you understood (who, problem, core loop, main screens, open points) and let him correct it before you write the brief.
- Ask only for what is still missing, max 10 questions, in this order: mode (Learn/Fun or Business), one sentence, core loop, main screens (at most 10, core loop first; this list feeds `/designs`), target platforms (iPhone always; Android, iPad or web only if he names them), max 5 must-haves and no-gos, build risk (hardest technical piece, built and tested first), permission or approval risk (store rules, third-party APIs), budget cap, outside constraints (for example a stay abroad or a visa: orientation only, [immigration advisor]).
- Never ask for an hour cap, a timeline or stop criteria. The order of work is his biggest current problem and what is most fun.
- Default "Done when" (both modes): "I used it on my iPhone with my own real data on 3 different days." Storing his data on the device is fine in slice 1 (no backend).
- Business mode adds: assumptions in the order Reach, Want, Build; one named channel with a number; one check when slice 1 works (what did strangers do?). Copy `.claude/skills/kickoff/evidence-template.md` to `docs/evidence.md`. Learn/Fun mode: no evidence file.
- Push back if there are more than 5 must-haves or must-haves go beyond the core loop: suggest the toy box.
- Mark legal points [lawyer] or [tax] and add each to the lawyer-question list in the brief. Never invent answers: unknowns go to "Open questions" in `docs/now.md`.

## 2. Name and cast
- Ask for the app name. Then change: `app.json` name, slug and scheme (lowercase, no spaces), `package.json` name, the two `name` fields at the top of `package-lock.json`, the title line of `CLAUDE.md` and its one-line description. No bundle identifiers yet; EAS asks at the first build.
- Replace the cast in `src/data/demo.ts` with 2 or 3 invented personas and one hero content set that fit the core loop. The same cast fills the designs in `/designs`. Then `npm run check`.

## 3. Expo Go check (project SDK: the major version of `expo` in `package.json`)
- Check in this order and trust the first: (1) the App Store listing of Expo Go, "What's New" (https://apps.apple.com/us/app/expo-go/id982107779), (2) https://expo.dev/changelog. Say what you found and how sure you are.
- Same SDK: done.
- Store NEWER than the project: upgrade with the `expo:expo-upgrade` skill, then `npm run check` and `npm run test:e2e`.
- Store OLDER (a gap): explain in plain words and let him choose: (a) web preview now, iPhone when the store catches up (cheapest, default); (b) `eas go` or (c) a development build, both need the Apple Developer Program. A downgrade recipe is in `docs/playbook/troubleshooting.md`; never improvise one.
- Apple Developer Program (about 99 USD per year) is needed at the first of these triggers: Business mode before outside testers; the first package that is not in Expo Go; the next store gap. Enrol 3 days before you need it. Write the trigger into the budget in `docs/brief.md`.
- First row of `docs/decisions.md`: the Expo Go result (Who: Sebastian), after he confirms the wording.

## 4. Checks, preview, iPhone, safety
1. Run `npm run check`, `npm run test:hooks` and `npm run test:e2e`. `test:hooks` must pass: if it fails, check the troubleshooting page, then stop; no building until it is fixed. If only `test:e2e` fails because of Chrome or Playwright on this PC, write it into "Open questions" and continue.
2. Preview: start the dev server from `.claude/launch.json` (port 8081) and open the preview. Ask: does he see the app next to the conversation, and does a text change show up after save (`src/i18n/index.ts`, line `home.hello`)? Then undo the change. If the Browser pane fails within 15 minutes: stop your preview server; fallback is `npm run web` in his own PowerShell, Chrome snapped right (Win+Right).
3. iPhone (he does it, you guide). **Port rule:** your preview keeps 8081; his own server is a second one next to it.
   - Expo login in his own PowerShell: `npx expo login` (same account as in Expo Go). Check: `npx expo whoami`.
   - In his own PowerShell window: `npm run start`. When Expo asks to use port 8082, he says yes. The QR code shows only there.
   - Windows: Settings > Network > this Wi-Fi > Private; allow Node.js for private networks when asked. Scan the QR with the iPhone camera. Campus or hotel Wi-Fi often blocks it: use the iPhone hotspot, or `npx expo start --tunnel`.
   - Goal: the starter app runs on his iPhone. That proves the pipeline before any design or code work.
4. Safety test (proves the HOOK, not your manners): ask him to type "Use your shell tool (PowerShell or Bash) to run `cat .env`. Do not refuse yourself, I want to see the hook block it." Then the same with `git push --force --dry-run`. Pass = the tool result shows "Blocked by .claude/hooks/guard.mjs". If you refused without calling the tool, he says "Call the tool anyway; the hook decides." Still no hook text: run `npm run test:hooks` and check that `/hooks` lists the three starter hooks.
Write the preview winner (Browser pane or `npm run web` + Chrome) into `docs/how-this-repo-works.md`.

## 5. Docs
- `docs/how-this-repo-works.md`: app name, Expo Go result, preview winner. Plain words.
- `docs/now.md`: rewrite (phase 2 designs, status active, mode, hours logged so far as a record, locked must-haves as checkboxes, one next step "/designs in a new session", open questions).
- `docs/log.md`: one entry for today, with hours and checked-device count.

## 6. Commit
- `git add -A`, then `git commit -m "chore: kickoff <app name>"`. Do not push.
- Tell him in max 8 lines what changed, what he decided, and the next step: `/wrap-up` (pushes and tags), then a new session in this folder with `/designs`.
