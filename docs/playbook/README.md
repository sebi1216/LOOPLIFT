# App playbook (v4)

How Sebastian builds an app with Claude, from idea to a working slice on the iPhone. Written 28 Oct 2026 after Clou ([retro](retros/2026-10-clou.md)), changed 29 Oct 2026 to strategy, designs, code ([#51](decisions.md), [#52](decisions.md)). Everything is a suggestion; you decide. Prices and versions: [reference.md](reference.md).

This guide is for you. It lives in `docs/playbook/` of the template, so every app made from the template carries it. Claude reads it only when you ask or a skill points to a page. The steps for a new app are in [START-HERE.md](../../START-HERE.md).

> **If you follow only 5 rules**
> 1. **The repo is the only home.** A decision made in a chat, Doc or note counts only once it is in `docs/`.
> 2. **Product first, max 5 must-haves.** No hour cap, no timeline. Work on the biggest current problem and what is most fun; new ideas wait in the toy box.
> 3. **Strategy, then designs, then code.** `/kickoff` turns your files into the brief, `/designs` shows at most 10 screens in a few directions, you pick one, then `/build-screen` codes it screen by screen.
> 4. **One writer, nothing unattended on the PC.** One Claude session per repo; unattended work only in the cloud.
> 5. **Done = seen on the iPhone plus a check that ran.** Not "Claude said so".

## The method on one screen

```
 STRATEGY  your files in docs/input/ -> /kickoff -> docs/brief.md
           (main screens, core loop, max 5 must-haves); starter app on the iPhone
   |
 DESIGNS   /designs: 3 key screens in 3 directions (FigCraft, Figma or code variants)
           you comment, mix, pick; the picked one grows to at most 10 screens
           -> tokens in code, docs/design/
   |
 CODE      one screen or must-have per session
           /spec (if big) -> plan -> /build-screen -> play
           -> iPhone (+ Android if a target) -> /wrap-up
   |       (Business mode, alongside: reach, talks, smoke test page)
 NEXT      slice 1 works on the iPhone: pick the next biggest problem
```

## The 10 rules

1. **The repo is the only home.** Brief, designs, specs, decisions, evidence: all in `docs/`. Chat freely before the repo exists; your files go into `docs/input/`. After that, nothing counts until it is a repo file. Artifacts and Claude Docs are only views.
2. **Product first, max 5 must-haves.** One core loop, at most 5 must-haves, no-gos, a toy box for new ideas. No hour cap, no timeline, no stop rules: the order of work follows the biggest current problem and what is most fun ([#49](decisions.md)). `docs/log.md` records hours as a fact, not a cap. `docs/now.md` says `active`, `paused` or `done`.
3. **Strategy, then designs, then code.** No app screen is coded before you have seen the designs and picked a direction. Designs cover at most 10 main screens: they set the tone, they are not the app. The picked look goes into `src/ui/tokens.ts` and `docs/design/`, then `/build-screen` codes one screen at a time from it ([#51](decisions.md)). The design tool stays fixed per app.
4. **One writer.** One Claude session writes to a repo at a time; HQ and Build never run at the same time. Nothing unattended on the PC: unattended work runs only in the cloud, as one small task that pushes to `night/<date>` and ends in a PR.
5. **Main with gates.** `npm run check` and `/code-review` (correctness) before push, a daily `good-YYYY-MM-DD` tag. Duplication: `/simplify` in the weekly review. Auth, payments and data changes go on a short branch with `/security-review`.
6. **Platform owns navigation, brand owns content.** Native tabs, headers, sheets, also in the designs. Same core loop everywhere, platform-appropriate extras. Slice 1 is the iPhone in your hand.
7. **Done = evidence you can explain.** A check that ran, a screenshot, each screen opened on the iPhone (and on the Android emulator only if Android is a target platform in your brief), and two sentences from you on what changed. The layout wall shows sizes, not platforms.
8. **Working product earns scope.** Slice 2, a backend or a new platform come when slice 1 works on the iPhone; in Business mode also the evidence in [guide 4](guide/4-validation.md).
9. **Safety is a seatbelt, not a wall.** Settings and the guard hook catch accidents, not a determined bypass. Real protection: no production secrets on the PC, Claude on dev data only, unattended work in the cloud.
10. **Add on trigger, not just in case.** No tool, file, skill or plugin before its moment ([Create when](guide/2-daily-loop.md#create-when)). The same Claude mistake twice is a trigger for a test, lint rule or hook. Stuck on tooling? Simplify.

## Start a new app

Follow [START-HERE.md](../../START-HERE.md). In short: GitHub **Use this template**, clone to `C:\DEV\<name>`, files into `docs/input/`, then `/kickoff`, `/designs`, `/build-screen`, and `/wrap-up` at the end of every session. First time on a laptop: [guide 1](guide/1-first-day.md) section B. Optional before you start: [hard-questions.md](hard-questions.md).

## What is where

| File | Open it when |
|---|---|
| [guide/1-first-day.md](guide/1-first-day.md) | First day (tutorial, incl. PC setup) |
| [guide/2-daily-loop.md](guide/2-daily-loop.md) | Every coding session |
| [guide/3-design-to-code.md](guide/3-design-to-code.md) | Before and during `/designs`; when the look is stuck |
| [guide/4-validation.md](guide/4-validation.md) | Business mode |
| [reference.md](reference.md) | Price, version, limit, command, learning links |
| [decisions.md](decisions.md) | "Why does the playbook say this?" |
| [troubleshooting.md](troubleshooting.md) | Something broke |
| [glossary.md](glossary.md) | A word is unclear |
| [hard-questions.md](hard-questions.md) | Before a new app |
| [retros/](retros/_template.md) | End of an app, or every 2 to 4 weeks |
| [project-kit/](project-kit/README.md) | Optional claude.ai Project for the strategy talk |
| [machine/](machine/user-CLAUDE.md) | Personal Claude files, copied once per PC ([guide 1 B](guide/1-first-day.md#b-one-time-pc-setup)) |

## Playbook maintenance

The playbook lives in the template repo `sebi1216/app-starter` ([#52](decisions.md)). A change to the method is a commit there, plus a row in [decisions.md](decisions.md). Apps made earlier keep their own copy. Freeze ([#43](decisions.md)) with two deliberate exceptions by Sebastian: #49 (28 Oct 2026, product first) and #51/#52 (29 Oct 2026, strategy, designs, code; one folder). Next changes after the first retro of an app: one session, at most 3 edits, each logged.
