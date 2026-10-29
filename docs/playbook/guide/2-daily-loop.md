# 2. The daily loop (how-to)

Use this every session after day 1. The rules are in the [README](../README.md#the-10-rules); this page shows how.

## Session start (3 minutes)

1. Open the repo in your cockpit. One Claude session writes to it ([rule 4](../README.md#the-10-rules)).
2. First message: "**Learn**" or "**Ship**", then "Read docs/now.md. Is git clean and pulled? What is the next step?" If `docs/log.md` has no line for your last session, Claude says so.
3. "Did I decide anything outside this repo since last time (chat, Doc, notes)?" Paste it; Claude turns it into rows for `docs/decisions.md` (you confirm the wording).
4. Pick **one** must-have from `docs/now.md`. New ideas go to the toy box in `docs/brief.md`, not into the slice.

Two roles, named with `/rename`:
- **HQ**: plans, researches, runs `/spec`, edits only `docs/`. Not long-lived: start a fresh HQ session at least weekly from `docs/now.md` and `docs/decisions.md`. Nothing may live only in its memory.
- **Build**: fresh for each task, from a spec or a one-line task.

HQ and Build never run at the same time on one repo: both write `docs/`, and Build would commit HQ's half-finished edit. **Remote Control** from the iPhone continues the one session that is open on the PC; it is not a second HQ.

## The loop (one screen or feature)

1. **Spec, if needed.** `/spec <feature>` when it touches 3 or more files or you are unsure. Claude interviews you and writes `docs/specs/NNN-<feature>.md`: acceptance checks, each saying how it is checked, and a "Done when" line. Skip it when one sentence describes the change.
2. **Fresh build session.** `/clear`, plan mode (Shift+Tab), read the plan, say OK.
3. **Build.** `/build-screen <name>` for a screen; a plain prompt with "Done when" for logic ("use red/green TDD" for data functions). `/build-screen` ends with "choices I made": confirm or change each. Design path: [guide 3](3-design-to-code.md).
4. **Look and play** for 5 minutes in the preview and layout wall. Say what feels wrong in plain words. Max 3 rounds, then accept, cut or park it.
5. **Device.** `native-gap-checker` reads the code first (a pre-check, not device truth). Then open the screen on the iPhone (and on the Android emulator only if Android is a target platform in the brief) and set its status in `docs/design/screens.md`.
6. **`/wrap-up`** at the end, or a small commit after each green step.

**Done = evidence** ([rule 7](../README.md#the-10-rules)): Claude's last message shows the command it ran and its output, or the screenshot. Must-haves in `docs/now.md` are a locked checklist: Claude ticks a box only with evidence and never edits a must-have.

## Preview levels

| Level | Shows | When |
|---|---|---|
| Web preview | The app, updated on every save | All the time |
| Layout wall (`/layout-wall.html`) | One screen at several sizes | Every new screen |
| iPhone (Expo Go or development build) | The real thing | Each screen once, before it counts as done |
| Android emulator | The real Android app | Only if Android is a target platform: each screen once |

The layout wall has no iOS safe areas, iOS fonts, native modules or touch. So screens are `checked-web` or `checked-device` (= seen on the iPhone, plus the emulator if Android is a target); the slice is done when all are `checked-device`.

## Git gates

- Slice 1 works on `main`. Hooks run ESLint after every edit and TypeScript when Claude ends a turn; the full `npm run check` runs in `/wrap-up` and CI. Red means not done.
- `/code-review` before every push (inside `/wrap-up`) looks for **correctness** bugs. Duplication is `/simplify`, in the weekly review. Fix blocking findings now, put the rest on one "later" line; max two review rounds per change.
- Claude never changes a test and the code it tests in one step without saying so.
- Daily tag `good-YYYY-MM-DD`. Going back: ask Claude to check out the last good tag.
- Risky changes (auth, payments, RLS, data): a short branch, `/security-review` before the push (it compares against `origin`).
- Worktrees only for a truly separate task; the main session merges. No background dispatch (`claude --bg`, agent view) in slice 1: each one creates a branch, which was Clou's branch chaos.

## /wrap-up (end of every session, 7 steps)

1. Checks: `npm run check`, and `/code-review` (correctness) when code changed.
2. Commit and push (you approve the push).
3. Re-read `docs/now.md` from disk, then rewrite it (status `active`, `paused` or `done`; changed facts go into their doc).
4. One line in `docs/log.md`: date, Learn or Ship, **hours** (a record, not a cap), screens moved to `checked-device`.
5. **Teach-back**: you write 2 or 3 sentences on what changed and why; Claude asks one question; a weak answer means a 5-minute walk-through, then commit anyway.
6. One question: "Did Claude make the same mistake twice?"
7. Tag `good-YYYY-MM-DD`.

## Weekly review (15 to 30 minutes, Sunday, fresh HQ)

1. **Measure, don't feel.** Logged hours and screens moved to `checked-device`, as facts (no cap, [#49](../decisions.md)). In METR's 2025 trial developers felt 20% faster and were 19% slower ([METR](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)).
2. **Next problem.** Is the slice still the smallest thing that proves the core loop? Which problem is biggest now, and what is most fun?
3. Evidence (Business mode): reach, talks, signups, repeat users against `docs/evidence.md`.
4. **Harness ratchet**: same mistake twice becomes a test, lint rule or hook (a `CLAUDE.md` line only if impossible). Delete one rule that never caught anything.
5. **Housekeeping** (moved here from `/wrap-up`): `/simplify` for duplicated code, or ask for "the 3 most confusing files" (AI code tends to duplicate: [GitClear](https://www.gitclear.com/the_ai_code_quality_maintainability_gap)); `git branch` and `git worktree list` (only `main`?); config diff since last week (`.claude/`, `.mcp.json`, `.vscode/`, `.github/`, `package.json`, `.npmrc`: anything you didn't ask for?); `docs/now.md` under about 60 lines; next item of `docs/security-checklist.md`; Expo Go store version = project SDK?
6. `/usage` (press `f` for fixes) and `/memory` (delete wrong notes).
7. Pick this week's toy for one 2-hour play session (throwaway branch, never merged). Ask: am I still having fun and learning?

## Create when

| Trigger | Create |
|---|---|
| Feature touches 3+ files, or you are unsure | `/spec` writes `docs/specs/NNN-<feature>.md` |
| Business mode chosen | `docs/evidence.md` ([guide 4](4-validation.md)) |
| Same prompt typed 3 times | A skill in `.claude/skills/` |
| Same Claude mistake twice | A test, lint rule or hook (a `CLAUDE.md` line only if impossible) |
| First real table or upload | Supabase dev + prod, `.claude/rules/data.md`, section C of `docs/security-checklist.md` |
| Outside testers, a package Expo Go lacks, or the next Expo Go store gap | Apple Developer Program (99 USD a year; enrol 3 days early: a newly registered iPhone can take 24 to 72 hours to appear in a build), then a development build |
| A new main screen the designs don't cover, or the look feels wrong | A short `/designs` round for that screen ([guide 3](3-design-to-code.md)) |
| Slice 1 done, the area has tests, and you merged one PR yourself and can explain it | A night task in the cloud (below) |
| A bug you can't fix today | A GitHub issue |
| Something broke and you fixed it | A row in [troubleshooting.md](../troubleshooting.md) |

## Unattended work (night shift)

Optional, max one task, only at the trigger above.

- **Cloud only**: a cloud scheduled task or a cloud session with **one** repository. It runs in an isolated VM, and your PC can be off ([cloud scheduled tasks](https://code.claude.com/docs/en/routines.md)). Unattended runs on your PC are not recommended: native Windows has no sandbox.
- **What the cloud loads**: a single-repo cloud session uses the repo's `CLAUDE.md`, skills, agents, guard hook and permission rules, but not the Expo plugin and not your personal `~/.claude/CLAUDE.md` ([cloud environments](https://code.claude.com/docs/en/cloud-environments.md)). So `CLAUDE.md`, `AGENTS.md` and `docs/` must carry the knowledge, and the repo holds no secrets. Never start a night task as a Projects thread or with several repositories: those run without the repo's hooks and permission rules.
- **Branches**: cloud scheduled tasks push to a `claude/` branch unless the prompt says otherwise. The only hard control is branch protection on `main`, which needs GitHub Pro for private repos (Student Pack, verify). So protect `main` first, and the prompt says "push only to `night/<date>`, never to `main`".
- **Narrow and checkable**: tests for a parser, lint fixes, a component from a spec. Never product or design choices.
- **The prompt** starts with `npm ci` (a fresh clone has no `node_modules`) and contains: a computational **Done when** ("`npm run check` exits 0 and no test file changed"), a turn cap (`/goal <Done when>, or stop after 20 turns`), "no new dependencies", a size cap of about 200 changed lines (E), and "push only to `night/<date>` and open a PR". Write it down by 22:00. If you can't, it is not a night task.
- **Morning**: read the diff with Claude (`/code-review`, then "walk me through this diff"), and the evidence (test output, screenshots). Not the summary: about half of test-passing agent PRs would not have been merged ([METR](https://metr.org/notes/2026-03-10-many-swe-bench-passing-prs-would-not-be-merged-into-main/)). Then the main session merges.

## When stuck

1. Trigger: two failed tries or 30 minutes, whichever comes first.
2. **Write your guess first**, one line: what you think is wrong.
3. Ask: "Explain the error in plain words and test my guess. Don't fix it yet."
4. Then fix, or `/rewind`, or go back to the last good tag.
5. Let Claude search the Expo docs (Expo plugin).
6. New session with `/clear` and a better prompt. For mechanical errors: `/goal npm run check exits 0, or stop after 15 turns`.
7. Still stuck: move the feature to later. Stuck on tooling means simplify, not add a tool.

## Learning

Anthropic's own trial (Jan 2026, 52 mostly junior developers): the AI group scored 50% on a quiz about the code they had just written, hand coders 67%. Full delegation scored 39%; asking conceptual questions 65%; letting AI debug for you 24% ([Anthropic](https://www.anthropic.com/research/AI-assistance-coding-skills)). Default Claude Code work is full delegation. So:

- **Learn or Ship**, marked at session start. Learn sessions use the Learning output style (`/output-style Learning`): you write the `TODO(human)` parts and ask "why" and "what would break if...". Ship sessions use Default.
- **Teach-back** in every `/wrap-up`. In a small preprint study, 77% of unrestricted AI users failed a later task without AI, against 39% of those who had to explain their code first ([arXiv 2602.20206](https://arxiv.org/abs/2602.20206)).
- **Guess first** when stuck: debugging is where most skill is lost.
- Monthly, 30 minutes: change something small without Claude. If you can't, next week's Learn sessions go there.

## Cockpit habits

- **Remote Control** (`/remote-control`): continue the open session on the PC from the iPhone, including answering its permission prompts; the PC stays awake and the session running ([docs](https://code.claude.com/docs/en/remote-control.md)).
- **`/statusline`**: shows context use and cost at the bottom ([docs](https://code.claude.com/docs/en/statusline.md)).
- `/usage` weekly, `/context` when a session feels slow, `/clear` between tasks. Sonnet-class model for routine work, the strongest for planning and hard bugs.
- Quiet spenders (one shared plan limit): long sessions, `/goal` and `/loop` check-ins, scheduled tasks, subagents, auto-verify screenshots, Claude Design. An `ANTHROPIC_API_KEY` in your environment switches to API billing ([reference](../reference.md)).

## Safety, honestly

The guard hook and deny rules match **text**. Creative bypasses still get through (current count: see the starter's test output, `npm run test:hooks`). The guard is stricter than v2 and fails closed, and it blocks credential printers such as `gh auth token`, `gh auth status --show-token`, `git credential fill` and `cmdkey /list` by text. It is still a seatbelt against **accidents**, not a wall against attacks or prompt injection. Permission prompts are not safety either: Anthropic found users approve about 93% of them ([Anthropic](https://www.anthropic.com/engineering/how-we-contain-claude)).

What actually protects you:
1. **No production secrets on the PC** in slice 1: dev keys only, rotated if leaked; real secrets in a password manager.
2. **Claude touches dev data only.** You run anything that hits production, publishes, or costs money.
3. **Unattended work only in the cloud** (above).
4. **Git**: push daily, tag good states; read every change to `.claude/`, `.mcp.json`, `.vscode/` and `.github/` like code.
5. Before each phase, tick `docs/security-checklist.md`. Collect [lawyer] questions in one list and book one paid hour when about 5 pile up or before anything goes public.

Real isolation, if you want more: (1) cloud sessions for unattended work; (2) WSL2, where Claude Code's sandbox runs (you decided against WSL for now; it is the upgrade path) ([sandboxing](https://code.claude.com/docs/en/sandboxing.md)); (3) a separate Windows user account or VM just for Claude (E).
