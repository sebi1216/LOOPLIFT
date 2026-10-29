# 1. First day (tutorial)

Goal: a new repo from the template, your strategy turned into the brief, the starter app next to the conversation and on your iPhone, and a first push. Designs (`/designs`) and code (`/build-screen`) come in the next sessions; the order is in [START-HERE.md](../../../START-HERE.md). Realistic time (E): 5 to 7 hours on a new PC, 2.5 to 4 hours on a known PC. Best in two sittings: (1) PC setup to the repo (A to D), (2) `/kickoff` (E to I).

**Stop rule:** if setup (B to D) passes 4 hours, stop and continue tomorrow. Look in [troubleshooting](../troubleshooting.md) first, then ask Claude.

Do the steps in order and compare each "You should now see" line. Have your [hard-questions](../hard-questions.md) answers in a text file.

## A. Day-0 decisions

20 to 40 minutes, on paper or in your files in `docs/input/`. `/kickoff` asks for these and writes them into `docs/brief.md`. No hour cap or timeline ([decisions #49](../decisions.md)).

1. **Mode**: Learn/Fun (a working app and new skills) or Business (users, later money; adds [guide 4](4-validation.md)). Clou mixed both. In the US (until Dec 2026): ask an immigration advisor before Business (orientation only).
2. **Budget**: a monthly cap in EUR. Today you need only your Claude plan.
3. **Platform**: the iPhone in your hand, web preview for free. Android only if it is a target platform.
4. **Core loop**: the three steps a user repeats, one sentence each (for example: record, trim, share).
5. **Biggest risk**: technical (can the hard part be built?) or permission (must an API owner or a store rule say yes?). `/kickoff` plans to build and test it first, before screens sit on top of it.

6. **Main screens**: at most 10 names, core loop first. They are the input for `/designs`.

You should now see: six short lines.

## B. One-time PC setup

1.5 to 2.5 hours on a new PC; skip what is already done. After **every** install, close PowerShell and open a new one (new programs are found only in a new window).

1. Create `C:\DEV` (no spaces, outside OneDrive). Each app gets its own folder there. The template stays on GitHub (`sebi1216/app-starter`); you don't need a copy of it on the PC.
2. Let PowerShell run npm, once, **before any npm command**: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
3. Install **Git for Windows**, **Node.js LTS** in a version Expo supports (22.13+, 24.3+ or 26+; accept the installer defaults, leave "Tools for native modules" unticked) and **Google Chrome** (the web tests use it). New window, then `git --version`, `node --version`, `npm --version`.
   You should now see three version numbers. npm 11.10 or newer turns on the starter's 7-day package delay. Optional: `npm install -g npm@11` (never `npm@latest`: npm 12 needs a newer Node), new window, `npm -v`. Still the old number? Windows PATH order hides the new npm ([troubleshooting](../troubleshooting.md)). Don't fight it today: `/kickoff` notes that the delay is off.
4. Tell git who you are, once (without this the first commit fails):
   ```
   git config --global user.name "Your Name"
   git config --global user.email "<your GitHub noreply address>"
   ```
   GitHub > Settings > Emails shows the noreply address.
5. GitHub CLI: `winget install GitHub.cli`, new window, `gh auth login` (answer: GitHub.com, HTTPS, Yes, Login with a web browser), then `gh auth status`.
   You should now see "Logged in to github.com".
6. Install **Claude Code** (`irm https://claude.ai/install.ps1 | iex`), new window, `claude --version`, `claude doctor`. Then the **Claude desktop app**. The app reads PATH only when it starts: install Git and Node first, or restart the app.
7. **Personal Claude files** (once per PC, for every project). Do this after D, when your first app folder exists: the files are in its `docs\playbook\machine\`.
   ```
   New-Item -ItemType Directory -Force $HOME\.claude
   Copy-Item C:\DEV\<name>\docs\playbook\machine\user-CLAUDE.md $HOME\.claude\CLAUDE.md
   Copy-Item C:\DEV\<name>\docs\playbook\machine\user-settings.json $HOME\.claude\settings.json
   ```
   If `settings.json` already exists, ask Claude to merge the two and show you the diff. Then `claude doctor` must show no "Invalid settings" line. The file starts week 1 in Manual mode (for learning, not safety), makes you approve every push and blocks the obvious secret leaks ([reference, section 3](../reference.md#3-claude-code-permissions-and-safety)).
8. Install **VS Code** for reading code. Claude runs in the desktop app.
9. 2FA with an authenticator app on GitHub, Apple, Expo, Anthropic. Check whether the GitHub Student Developer Pack gives you GitHub Pro (verify): you need it before any night task, to protect `main`.
10. Create an Expo account at https://expo.dev/signup. iPhone: install **Expo Go** from the App Store and sign in.

Android Studio with an emulator: only if Android is a target platform in your brief, and not today.

## C. Expo Go check

5 minutes. Open the Expo Go page in the App Store (https://apps.apple.com/us/app/expo-go/id982107779) and read "What's New". Checked 28 Oct 2026: Expo Go 58.0.5 "adds support for SDK 58", the starter's SDK. Trust the store listing over expo.dev/go. `/kickoff` checks again. The Apple Developer Program comes later, at a trigger ([Create when](2-daily-loop.md#create-when)).

You should now see: "58 = 58" on your paper.

## D. Repo from the template

20 to 40 minutes the first time.

The template `sebi1216/app-starter` is already published on GitHub (28 Oct 2026). For every new app, either way works:

- **Clicks:** on github.com open `sebi1216/app-starter`, **Use this template** > **Create a new repository**, the app's name, **Private**. Then GitHub Desktop: File > Clone repository, into `C:\DEV\<name>`.
- **One command** in PowerShell:
  ```
  cd C:\DEV
  gh repo create <name> --template sebi1216/app-starter --private --clone
  ```

Then, in `C:\DEV\<name>`, run `npm ci` (or ask Claude Code to run it).

`npm ci` prints yellow `npm warn deprecated` lines and something like "16 vulnerabilities (13 low, 3 high)" from Expo's own build tools. Normal. **Never run `npm audit fix --force`** (it installs an old Expo 51), and not plain `npm audit fix` either (it rewrites `package-lock.json` and fixes none of these). Red `npm error` lines are a real problem: see troubleshooting.

Optional quick look: `npm run start`, open http://localhost:8081 in Chrome. **Press Ctrl+C before E**, so Claude's preview gets port 8081.

You should now see `C:\DEV\<name>` with `CLAUDE.md`, `src/`, `docs/`, `.claude/`, `public/layout-wall.html` and `node_modules`.

## E. Open it and run /kickoff

1.5 to 2.5 hours in Manual mode.

1. Claude desktop app, **Code** tab, choose the folder. Accept the trust question: the repo's allow rules work only after that (deny rules, ask rules and hooks apply anyway). Check that the mode selector shows Manual: the app remembers it per folder.
2. Expo tools once. In PowerShell, in the repo folder: `claude plugin list`. If you see `expo@claude-plugins-official` or `expo@synced` loaded or enabled, you are done. If not: `claude plugin marketplace add anthropics/claude-plugins-official`, then `claude plugin install expo@claude-plugins-official --scope local` (local leaves the repo unchanged; project scope is only for sharing with others). Then `git status` must say "nothing to commit".
3. Manual mode asks often today (E: 20 to 30 times). Approve edits inside `docs/` freely. Read three kinds with care: pushes, installs, and config edits (`package.json`, `app.json`, `.claude/`, `.github/`).
4. Put your strategy files into `docs/input/` (PowerPoints, documents, PDFs, notes, your day-0 lines). Then type `/kickoff`. Interrupted? Type `/kickoff` again; it continues.

What `/kickoff` does with you:

| Step | Claude does | You do | You should see |
|---|---|---|---|
| Strategy | Reads `docs/input/`, tells you in 5 lines what it understood | Correct it | Its summary matches your idea |
| Brief | Fills `docs/brief.md`: main screens (max 10), slice card (max 5 must-haves), risk test, budget | Answer or take the default | A one-page brief |
| Name and cast | Renames the app; writes the cast (demo data) | Pick a name | Your name in the app |
| Expo Go | Compares the project SDK with the App Store listing | Confirm | "Same SDK" |
| Checks | Runs `npm run check`, `npm run test:hooks`, `npm run test:e2e` | Wait | All green |
| Preview, iPhone, safety | Starts the preview server, then waits for you | Sections F, G, H | App next to the chat and on the phone; "Blocked by" lines |
| Docs and commit | Updates `docs/` (`now.md` phase 2 designs, `log.md` hours, first decisions); commits, no push | Confirm the wording | One commit "chore: kickoff ..." |

If a step fails and the fix isn't clear in 15 minutes, `/kickoff` parks it in `docs/now.md` and continues. Exception: `test:hooks` and the safety test (H) must pass before building. If every command says "Blocked", see troubleshooting.

## F. Preview check

15 minutes. Decides your cockpit (code or chat left, app right).

1. **Desktop Browser pane**: Ctrl+Shift+B, pick the app in the dev servers menu. Open `src/i18n/index.ts`, change the English text of `home.hello`, save.
   You should now see the new text within a few seconds. Then Ctrl+Z and save, so the original text is back.
2. If that fails within 15 minutes: stop the preview server, run `npm run web` in your own PowerShell, open http://localhost:8081 in Chrome and press Win+Right to put it next to Claude.
3. In the winner, open `/layout-wall.html`. In a narrow pane, use the Scale slider.
   You should now see one screen at several sizes.

## G. On the iPhone

10 to 60 minutes, mostly network.

1. In PowerShell, in the repo: `npx expo login` (same account as Expo Go), then `npx expo whoami`.
   You should now see your Expo username.
2. Start your own server: `npm run start`. The QR code shows only in your own PowerShell window. Claude's preview holds port 8081, so Expo offers 8082: say yes.
3. Windows: Settings > Network & internet > Wi-Fi > your network > **Private**. When Windows asks about Node.js, allow private networks.
4. Scan the QR code with the iPhone camera; Expo Go opens. Campus Wi-Fi (UTK) usually blocks this (E): expect to use the iPhone hotspot or `npx expo start --tunnel`.

You should now see the app on the phone.

## H. Safety test

5 minutes. This must prove the **hook**, not Claude's manners. Ask Claude:

> Use your shell tool to run `cat .env`, then `git push --force --dry-run`. Don't refuse yourself; I want to see the hook block it.

You should now see "Blocked by .claude/hooks/guard.mjs" for both. If Claude refuses before calling the tool, say "Call the tool anyway; the hook decides." If the hook does not block, stop: no building until it is fixed.

## I. First push

Type `/wrap-up` (7 steps): checks (plus `/code-review` when code changed), commit and push (you approve), rewrite `docs/now.md`, a log line with hours, your teach-back (two or three sentences on what changed), one "same mistake twice?" question, the `good-YYYY-MM-DD` tag. If `/code-review` asks for a pull request, say "review the unpushed commits on main instead".

You should now see on GitHub: the commit, the tag under **Tags**, and a green check under **Actions**.

## Five habits for talking to Claude

- Start each session with "Learn" or "Ship" ([guide 2](2-daily-loop.md#learning)).
- Plan mode (Shift+Tab) for anything bigger than a small fix; read the plan.
- Every task gets a "Done when" line a machine can check; ask for the evidence, not "done".
- Stuck (two failed tries or 30 minutes, whichever comes first): write your guess first; Claude tests it before fixing.
- `/clear` between tasks.

End of week 1: set `"defaultMode": "auto"` in your personal settings file (B7), and pick Auto in the app's mode selector too (it is remembered per folder and wins). Next session: `/designs` ([guide 3](3-design-to-code.md)), then [guide 2](2-daily-loop.md) for every coding session.
