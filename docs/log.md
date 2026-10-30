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

## 2026-10-28 · Ship (designs) · 2 h · checked-device +0
- Built: FigCraft works from Claude Code (create, read back, export PNG). 3 directions on Today, Calendar, Workout editor; Sebastian picked C Loop Ring. Full C set (8 screens, empty Today, dark key screens), tokens in src/ui/tokens.ts (14 contrast pairs pass), direction.md, screens.md, decision #2. Tag good-2026-10-28.
- Learned: FigCraft only writes inside docs/design/; generating batch commands with a small script beats hand-writing 40-cell grids. Auto-layout strokes need the other three side weights set to 0.
- Problems: two contrast misses caught before showing (A tint, C rest outline); a text frame truncated until set to fill. Another session committed the design kit during wrap-up.
- Next: decide the loop-ring drawing (react-native-svg or not), then /build-screen Today.

## 2026-10-29 · Ship (build all screens) · hours not given · checked-device +0
- Built: scheduling engine resolveDay (15 tests, red/green) and in-memory store; all 8 screens in direction C (Today + empty, Change-a-day sheet, Calendar, Rotation editor, Workouts, Workout editor, Exercises) with 4 native tabs and 3 sheets; react-native-svg 15.16.0 for the loop ring (decision #3). `npm run check` 30 tests, `test:e2e` 28 passed. All 8 checked-web. Must-haves 3 and 4 ticked with web evidence. Tag good-2026-10-29.
- Learned: @expo/ui MenuView and DateTimePicker do nothing on web, so both got small .web fallbacks. A screen's own ?date= param clashes with the store's ?date= switch (renamed the sheet's to ?day=).
- Problems: a second dev server in this folder rewrote the typed routes; fixed by flat routes (workouts/[id].tsx, workouts/add). Code review: 6 fixed, 3 deferred (now.md). Teach-back and ratchet skipped at Sebastian's request.
- Next: open all screens on the iPhone in Expo Go, set checked-device, decide storage (must-have 5).

## 2026-10-29 · Ship (persistence, starter lifts, spec 001 written) · hours not given · checked-device +0
- Added afterwards by Claude from the commits (this session had no log entry): saved data on the phone with expo-sqlite 58.0.13 (first launch empty), ?date= links are demo mode and save nothing (security review), 60 starter lifts and creating a lift inside the picker, spec 001 and decision #9.

## 2026-10-29 · Ship (spec 001 workout tracker) · hours not given · checked-device +0
- Built on branch feat/workout-tracker: workout log in saved data (tracker.ts, 15 tests red/green; store tests for old saves, broken sessions, Lena's 28 sessions), workout screen /session, exercise screen /exercises/[id] with an own react-native-svg line chart, Done on Today (ring and strip) and the Calendar, delete with Undo. Answers: code-first, ring and strip show Done, open session keeps its own copy.
- Learned: react-native-web needs `aria-checked`, not accessibilityState, for checkboxes. A second dev server in this folder still breaks `.expo/types`.
- Problems: one unit test was wrong (it contradicted the one-open-session rule) and was removed. The Calendar e2e test changed together with the code (2 Nov now reads Done). /code-review: 6 fixed, 4 parked as open questions; /security-review: no findings.
- Next: Sebastian looks at the screenshots, merges, iPhone check.

## 2026-10-29/30 · Ship (designs redo) · hours not given · checked-device +0
- Built: /designs redo in FigCraft. Rounds D/E/F, mix G in 3 palettes, G3 gradients, 4 signature ideas plus an 8-palette board; picked S1 Loop orbit in Teal Glow (#10). New workout flow with exercise tiles, exercise screen (cues, hint, sets, graph below) and Summary (#11), research-based hint rules (#12), merged exercise screens (#13), a drawing per lift (#14). Full set of 10 screens plus empty, comeback and 3 dark in docs/design/renders/final/. Tokens switched to Teal Glow, all 20 contrast pairs pass; npm run check green (58 tests); /code-review: no findings; pushed, tag good-2026-10-30.
- Learned: white text on a white tint over the lighter end of a gradient drops to 3.9:1; a dark tint keeps it above 6. Hint rules follow ACSM progression (2-10% when you beat the target) and detraining studies (comeback weight after 2 to 4 weeks off).
- Problems: FigCraft batch step numbers went wrong 4 times and duplicated frames came back in a different id order (G2/G3 names and PNGs swapped, fixed). FigCraft disconnected at the end, after the last save. Teach-back skipped at Sebastian's request.
- Next: new session, /build-screen Today in S1; update spec 001 for the new workout flow before Workout, Exercise and Summary.
