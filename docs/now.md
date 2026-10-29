# Now

Max about 60 lines. Rewrite, never append (re-read this file right before rewriting it). Updated: 2026-10-28 (after /wrap-up, tag good-2026-10-28)

Mode: Business   Phase: 1 strategy | 2 designs | 3 code (now: 3 code)
Status: active
Slice: slice 1 · hours logged 3 h (a record, sum of docs/log.md) · card: docs/brief.md section 3

## Must-haves (locked: tick only with evidence, never edit; ~ = nice to have)
- [x] Phase 1: /kickoff (files from docs/input/ into the brief, app name, Expo Go check, checks, preview, safety test, starter app on the iPhone) · evidence 28 Oct 2026: `npm run check` green (4 tests), `test:hooks` all passed, `test:e2e` 5 passed, Browser pane live reload seen, both guard blocks shown, LoopLift ran in Expo Go on the iPhone
- [x] Phase 2: /designs (main screens in 3 directions, one picked, tokens and direction written) · evidence 28 Oct 2026: 3 directions in `docs/design/looplift.figcraft` + PNGs in `docs/design/renders/`, C Loop Ring picked (decision #2), 8 screens + empty + dark exported, `src/ui/tokens.ts` with 14 contrast pairs passing, `npm run check` green (4 tests)
- [ ] Exercise library and workout templates: starter list of about 20 lifts; add, rename, delete exercises; named workouts with target sets x reps, reorderable
- [ ] Plan days: set any date to a workout or Rest and clear it again; a repeating rotation (workouts and Rest) with a start date, shown repeating on the Calendar
- [ ] Day overrides: "Replace this day" and "Push the loop back" both work and the rest of the loop stays correct
- [ ] Today screen: today's plan plus the next 7 days; helpful empty state on first launch
- [ ] Local persistence: all data survives an app restart; no account

## Next step (one line)
Answer the loop-ring question below, then a new session: `/build-screen Today` (design: frame `C / Today` in `docs/design/looplift.figcraft`; read `docs/design/rules.md` first).

## Open questions (Claude adds here, never invents answers)
- Should a loop also support weekday plans (Mon Push, Wed Pull every week), or is the N-day loop enough for v1? (from the concept PDF)
- "Mark as done": parked in the toy box at kickoff; confirm it stays out of v1? (from the concept PDF)
- Business mode needs the Apple Developer Program (about 99 USD per year) before the 10 strangers test; budget cap is 0 EUR. Decide before the stranger check.
- Storage: `expo-sqlite` (in Expo Go) as the concept suggests? Needs your OK as a new package (CLAUDE.md rule 3) before the first data screen.
- The loop ring needs arcs. `react-native-svg` is not in the project (new package = your OK first), or Claude draws it without SVG. Decide before `/build-screen Today`.
- `npm ci`: install scripts of `@parcel/watcher` and `unrs-resolver` are not approved (allowScripts); `npm audit` shows 3 high. Look at both before adding packages.
- `.mcp.json` (FigCraft MCP setup) is untracked. Commit it so the design tool setup is in the repo, or keep it local?
- Two Expo integrations load here (the `expo` plugin and a claude.ai Expo connector); keep the plugin, turn the connector off for this folder.

## Evidence so far (Business mode; details in docs/evidence.md)
Channel: gym / uni sport circle, 10 try it · Conversations: 0/5 · Signups: 0 · Strangers who used it twice: 0

## Where things are
Start START-HERE.md · Brief docs/brief.md · Your files docs/input/ · Designs docs/design/ · Decisions docs/decisions.md · Log docs/log.md · Specs docs/specs/ · How the repo works docs/how-this-repo-works.md · Playbook docs/playbook/
