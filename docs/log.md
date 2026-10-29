# Log

One entry per session, newest at the bottom. /wrap-up appends here. Hours and checked-device are measured, not felt. They are a record, not a cap.

Format:
## <date> · <Learn | Ship> · <hours> h · checked-device +<n>
- Built: ...
- Learned: ...
- Problems: ...
- Next: ...

## 2026-10-28 · starter · 0 h · checked-device +0
- Built: template repo with a running Expo SDK 58 app (2 tabs, tokens, Button, EN/DE, demo cast), checks, hooks, skills, layout wall.
- Learned: web output "server" caused a hydration error with German text, so the starter uses "single". Store Expo Go 58.0.5 supports SDK 58 (App Store listing, 28 Oct 2026).
- Problems: all checks green on Linux only; not yet run on Windows. `npm ci` warns that eslint 9 is no longer supported: Expo's lint config pins it, so do not upgrade eslint by hand.
- Next: /kickoff in a new repo made from this template.

## 2026-10-29 · starter v4 · 0 h · checked-device +0
- Built: new order strategy, designs, code. START-HERE.md, docs/input/, /kickoff without a coded screen, new /designs skill (at most 10 screens, 3 directions, FigCraft first), playbook moved into docs/playbook/, no hour cap or waivers.
- Learned: two homes (app-playbook and app-starter) confused the first real run.
- Problems: /designs with FigCraft is untested; the skill checks first whether Claude Code can create frames there.
- Next: a new app from this template: Use this template, docs/input/, /kickoff.

## 2026-10-28 · Ship (kickoff) · 1 h · checked-device +0
- Built: LoopLift brief from the concept PDF (Business mode, iPhone only, 5 locked must-haves, 8 main screens), evidence log, name and scheme, lifting cast (Lena, Jonas, Mia) with Push/Pull and the example loop, decision #1 (Expo Go 58 matches).
- Learned: all checks pass on Windows too (check, test:hooks, test:e2e). Expo Go on iOS needs the Expo CLI login as well. The guard blocked both safety tests (secrets file, force push).
- Problems: `npx expo login` browser flow crashes on this PC (cmd cuts the link at `&`); fixed with `--no-browser`, added to troubleshooting.
- Next: /wrap-up, then /designs in a new session.
