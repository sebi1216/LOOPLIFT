# How this repo works

Plain-words tour. Claude updates it when folders, commands or the data flow change. State: after /kickoff (28 Oct 2026).

## This app
- Name: LoopLift (scheme `looplift`)
- Expo SDK: 58. Expo Go on the iPhone: matches (App Store Expo Go 58.0.5 supports SDK 58; checked 28 Oct 2026, decision #1). Log in to both Expo Go and the Expo CLI (`npx expo login --no-browser` on this PC).
- Styling: Expo default (StyleSheet plus tokens) and @expo/ui.
- Preview: Browser pane in the Claude desktop app (port 8081, live reload works), decided on 28 Oct 2026

## The three phases (details: `START-HERE.md`)
1. **Strategy:** your files in `docs/input/` become `docs/brief.md` (`/kickoff`).
2. **Designs:** at most 10 main screens in several directions; you pick one (`/designs`). Result: `docs/design/direction.md`, `src/ui/tokens.ts`, pictures in `docs/design/renders/`.
3. **Code:** one screen at a time from the picked design (`/build-screen`), checked on the iPhone, `/wrap-up` at the end of each session.

## The big picture
You talk to Claude. Claude changes files. The dev server notices and the preview updates in about a second. Hooks run automatically; the full `npm run check` runs before every commit and in `/wrap-up`. Git keeps every step, and GitHub runs the same checks again.

```
you -> Claude Code -> files in src/ -> dev server (npm run start) -> preview, layout wall, Expo Go
                           |
                       hooks: guard (before commands), ESLint (after edits), TypeScript (end of turn)
                           |
                     git commit on main -> /wrap-up pushes -> GitHub Actions: check, hook tests, web tests, gitleaks
```

## Folders
| Folder | What lives there | Rule |
|---|---|---|
| `src/app/` | Screens. Every file is a route: `index.tsx` is `/`, `profile.tsx` is `/profile`. `_layout.tsx` sets up the tabs | Routes only |
| `src/ui/` | `tokens.ts`, `use-colors.ts`, `button.tsx`, `app-tabs.tsx` (native tab bar), `app-tabs.web.tsx` (web-only tab bar) | Tokens, never raw values |
| `src/data/` | `demo.ts`: the cast (made-up people), fixed demo data, the functions screens call | When a backend comes, only this folder changes |
| `src/i18n/` | All texts in English and German; screens call `t('key')` | No text written straight into a screen |
| `e2e/` | Playwright web tests; screenshots in `e2e/screenshots/` (not in git) | One test per screen |
| `public/` | `layout-wall.html` (also copied into a web export: remove it before a public website) | |
| `docs/` | Brief, now, log, decisions, design, specs, checklists | The only home for written decisions |
| `docs/input/` | Your strategy files: PowerPoints, documents, PDFs, notes | You put them in; `/kickoff` reads them |
| `docs/design/` | `direction.md` (the picked look), `screens.md` (every screen and its status), `renders/` (design pictures), `checks/` (screenshots of built screens) | Filled by `/designs` and `/build-screen` |
| `docs/playbook/` | Your guide: why the setup is how it is, first day, daily loop, fixes, words | For you; Claude reads it only when asked |
| `tools/` | `test-hooks.mjs` and `guard-cases.mjs`: tests for the Claude hooks | Never delete a case to make it green |
| `.claude/` | Settings, hooks, rules, skills, subagents, preview config | Config is code: read every change |
| `.vscode/` | Optional: F5 debugger after `npm run web` | Not needed for the preview |
| `.github/` | The CI workflow | Actions pinned to commit SHAs |

## Commands
| Command | What it does |
|---|---|
| `npm ci` | Installs exactly the versions in `package-lock.json`. Yellow warnings and "N vulnerabilities" are normal. Never `npm audit fix --force` |
| `npm run start` | Dev server and the QR code for Expo Go (only in your own terminal). Port rule: Claude's preview (`.claude/launch.json`) owns 8081; your own server takes 8082 when Expo asks (say yes). `a` opens the Android emulator |
| `npm run web` | The same server, opens the browser. Fallback preview: Chrome snapped right (Win+Right) |
| `npm run android` | Dev server plus the Android emulator (start the emulator in Android Studio first) |
| `npm run check` | TypeScript, ESLint and Jest. Must be green before a commit |
| `npm run test:e2e` | Own server on port 8099, the web app at iPhone 17 size in Chrome; fails on any console error |
| `npm run test:hooks` | Runs 472 guard checks (132 sample commands for Bash, PowerShell and Monitor, 74 bypass tricks, 2 fail-closed checks) and tests the lint and type hooks |

## What each hook does
| Hook | When | What | Cost |
|---|---|---|---|
| `guard.mjs` | Before every shell command (Bash, PowerShell, Monitor) | Blocks risky text: secrets, force push, lost work, deleting outside the repo, download-and-run, production, changing safety files from the shell. Fails closed | about 0.1 s |
| `lint-edited-file.mjs` | After Claude edits a JS/TS file | ESLint on that one file; Claude sees the problems | 1 to 3 s |
| `typecheck-on-stop.mjs` | When Claude wants to end a turn | `tsc` once, only if `.ts` files changed since the last clean check; sends Claude back once on errors | 0 to 5 s |

## Seeing the app
- **Web preview** (Browser pane, or `npm run web` + Chrome): updated on every save. Good for layout and flow.
- **Layout wall** (`/layout-wall.html`): the same screen at 7 sizes. Sizes, not platforms: no safe areas, no iOS fonts, no native tab bar, no native modules, no touch.
- **iPhone and iPad**: Expo Go (scan the QR code from your own `npm run start`) or a development build later. The truth. `supportsTablet` is on, so the iPad shows the real tablet layout.
- **Android emulator** (only if Android is a target in `docs/brief.md`): Android Studio, then `a` in the dev server.
- A screen is `checked-web` after the preview and wall, `checked-device` after the iPhone (plus the emulator if Android is a target). Done = both (`docs/design/screens.md`).

Why web output is "single" (`app.json`): with Expo's default "server" mode, German text caused a hydration error (server said English, the browser said German). A single-page web app avoids that.

## Safety in this repo (honest version)
- `.claude/settings.json`: a short allow list of commands that change nothing (checks, tests, `git status`, `git diff`, `git log`); asks for risky things (push, merge, installs, any `npx`, deleting, EAS, Supabase, `curl`, edits to `package.json`, `app.json`, workflows); denies reading `.env` and key files, force push, hard reset, publishing. Rules exist for Bash and PowerShell. Everything else asks (Manual mode) or goes through the auto-mode classifier.
- `guard.mjs` is a seatbelt against accidents, not a wall: 73 of 74 known bypass tricks are blocked (`npm run test:hooks`, 28 Oct 2026, Linux), but text matching can always be tricked (base64, string building, a script file Claude wrote). `npm run check` and the tests run code Claude can edit, so in auto or acceptEdits mode that is code without a prompt.
- Saved logins: on Windows, `gh` and Git keep their tokens in the Windows credential store, not in a file, so a file deny rule cannot protect them. The guard blocks the known printers by text (`gh auth token`, `gh auth status --show-token` or `-t`, `git credential fill`, `cmdkey`, `Get-StoredCredential`).
- Real protection: no production secrets on this PC (dev keys only), dev-only data, unattended work only in cloud sessions. Real isolation options: (1) cloud sessions or cloud scheduled tasks (isolated VM; see "Unattended runs" below); (2) WSL2, where Claude Code's sandbox works (decided against for now; the upgrade path); (3) a separate Windows user account or a VM for Claude (E).
- `.npmrc` `min-release-age=7` installs only packages at least 7 days old, but only with npm 11.10 or newer (`npm -v`). Older npm ignores it silently; then CLAUDE.md rule 3 (check the publish date) is the stand-in. Optional: `npm install -g npm@11` (never `npm@latest`: npm 12 needs a newer Node), new window, `npm -v`. Still old? Windows PATH lists `C:\Program Files\nodejs` before `%AppData%\npm`, so the bundled npm wins; leave it.
- Secrets: real values go into `.env` (you create it from `env.example`; Claude may not read it). Only `EXPO_PUBLIC_` values reach the app, and anyone can read them.

## Unattended runs (cloud only)
- Never unattended on this PC (no sandbox). Remote Control only continues the session that is open; it is not a second HQ.
- A cloud session or cloud scheduled task with ONE repository (this one) loads: `CLAUDE.md`, `AGENTS.md`, `.claude/settings.json` hooks and permission rules (so the guard runs), `.claude/rules`, skills and agents. It does NOT load: plugins enabled here (no Expo plugin), your personal `~/.claude/CLAUDE.md`, user skills and user settings. With several repositories, or as a Projects thread, no repo hooks or permission rules run: never start a night task that way. So `CLAUDE.md`, `AGENTS.md` and `docs/` must carry the knowledge, and the repo holds no secrets.
- Cloud tasks push to a `claude/` branch unless the prompt says otherwise; the only hard control is GitHub branch protection (needs GitHub Pro on a private repo; maybe free with the Student Pack, verify). Night prompt template:

```
Start with `npm ci`. Task: <one small task from docs/now.md>.
Done when: <machine check, e.g. `npm run check` passes>. Stop after <N> turns.
No new dependencies. Change at most about 200 lines.
Push ONLY to the branch night/<YYYY-MM-DD>; never push to main; never force-push.
End with a pull request and a short report: what changed, the Done-when output, open questions.
```
Morning: read the diff with Claude (`/code-review`, then a walk-through) and the Done-when output, not only the summary.

## Weekly review
Sunday, 15 minutes. Not part of `/wrap-up`.
1. Hours logged (a record, no cap); status and phase still right (active, paused, done)?
2. Next problem: is the slice still the smallest thing that proves the core loop? Which problem is biggest now, and what is most fun?
3. Same mistake twice: add a test, lint rule or hook; name one rule that never caught anything as a deletion candidate.
4. Mechanics (Claude runs them, you read): `/simplify` on the week's code (duplication, the 3 most confusing files); `git branch -a` and `git worktree list` (only `main` expected); `git diff --stat <last good- tag> -- .claude/ .mcp.json .vscode/ .github/ package.json .npmrc` (anything you did not ask for?); `docs/now.md` under about 60 lines and `CLAUDE.md` under 500 words; Expo Go version on the iPhone = project SDK; next open item in `docs/security-checklist.md`.

## Create when (not before)
| File | Create it when |
|---|---|
| `docs/evidence.md` | Business mode is chosen (/kickoff copies the template) |
| `docs/data-inventory.md` | The first real table or upload |
| `.claude/rules/data.md` | The first backend code (Supabase): RLS, dev and prod, secrets rules move there from CLAUDE.md |
| `docs/specs/NNN-*.md` | A feature touches 3 or more files (`/spec`) |
| `src/ui/<component>.tsx` | A part is used on a second screen |

## Docs and what to open when
| File | Open it when |
|---|---|
| `START-HERE.md` | Starting a new app; "what was the order again?" |
| `docs/now.md` | Every session start (max about 60 lines) |
| `docs/brief.md` | Scope questions; toy box; budget; lawyer questions |
| `docs/decisions.md` | "Why is it like this?" (newest row wins) |
| `docs/log.md` | Weekly review (hours, checked-device) |
| `docs/specs/` | Before building a bigger feature |
| `docs/design/direction.md`, `screens.md` | Before and after a screen |
| `docs/security-checklist.md` | At each phase gate |
