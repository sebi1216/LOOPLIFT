# Start here

How to build a new app from this template, step by step. Three phases, always in this order: **1. strategy, 2. designs, 3. code.** No coding before you have seen and picked a design.

The why behind each step is in `docs/playbook/` (start with `docs/playbook/README.md`). Words you don't know: `docs/playbook/glossary.md`.

## Once per laptop
1. Install the tools: `docs/playbook/guide/1-first-day.md`, section B (Git, Node.js, GitHub login, Claude Code, Claude desktop app, Expo Go on the iPhone). Or open any folder in the Claude desktop app (Code tab) and ask Claude Code to do section B with you.
2. Copy your personal Claude files once: section B7 of the same guide (the files are in `docs/playbook/machine/`).

## New app
1. On GitHub, open `sebi1216/app-starter`, click **Use this template** > **Create a new repository**, give it the app's name, keep it **Private**.
2. Clone it to `C:\DEV\<app name>` (GitHub Desktop: File > Clone repository).
3. Open the folder in the Claude desktop app, **Code** tab. Accept the trust question. First message: "Run npm ci."

## Phase 1: strategy
1. Put your files into `docs/input/`: PowerPoints, documents, PDFs, notes, the overall idea.
2. Type `/kickoff`. Claude reads your files, asks only what is missing, writes `docs/brief.md` (idea, core loop, main screens, must-haves), names the app, checks Expo Go and shows the starter app on your iPhone.
3. Type `/wrap-up`.

## Phase 2: designs
1. New session in the same folder. Type `/designs`.
2. Claude designs at most 10 main screens: first 3 key screens in 3 different directions, in FigCraft (or Figma, or coded variants if FigCraft can't be used).
3. You comment, change or mix, and pick one. Claude finishes the picked direction and writes it into the code's design tokens and `docs/design/`.
4. Type `/wrap-up`.

## Phase 3: code
1. New session for each screen or feature. Type `/build-screen <screen>` (the first screen of the core loop first). For something bigger, `/spec <feature>` first.
2. Look at it in the preview and on your iPhone. Say what you like and what not.
3. End every session with `/wrap-up` (checks, your 2 sentences on what changed, commit and push, tag, log).
4. Repeat until the must-haves in `docs/now.md` are ticked.

## Rules that save you trouble
- One Claude Code session per app at a time. Two at once overwrite each other.
- A new session for each phase and each task. Decisions live in files (`docs/`), not in chat history.
- Done = seen on your iPhone plus a check that ran. Not "Claude said so".
- New ideas go to the toy box in `docs/brief.md`, not straight into the app.
