# Now

Max about 60 lines. Rewrite, never append (re-read this file right before rewriting it). Updated: 2026-10-30 (after /wrap-up, tag good-2026-10-30; design redo S1 Loop orbit, decisions #10 to #14)

Mode: Business   Phase: 1 strategy | 2 designs | 3 code (now: 3 code)
Status: active
Slice: slice 1 · hours logged 3 h + 2026-10-29 not given (a record, sum of docs/log.md) · card: docs/brief.md section 3

## Must-haves (locked: tick only with evidence, never edit; ~ = nice to have)
- [x] Phase 1: /kickoff (files from docs/input/ into the brief, app name, Expo Go check, checks, preview, safety test, starter app on the iPhone) · evidence 28 Oct 2026: `npm run check` green (4 tests), `test:hooks` all passed, `test:e2e` 5 passed, Browser pane live reload seen, both guard blocks shown, LoopLift ran in Expo Go on the iPhone
- [x] Phase 2: /designs (main screens in 3 directions, one picked, tokens and direction written) · evidence 28 Oct 2026: 3 directions in `docs/design/looplift.figcraft` + PNGs in `docs/design/renders/`, C Loop Ring picked (decision #2), 8 screens + empty + dark exported, `src/ui/tokens.ts` with 14 contrast pairs passing, `npm run check` green (4 tests)
- [ ] Exercise library and workout templates: starter list of about 20 lifts; add, rename, delete exercises; named workouts with target sets x reps, reorderable
- [ ] Plan days: set any date to a workout or Rest and clear it again; a repeating rotation (workouts and Rest) with a start date, shown repeating on the Calendar
- [x] Day overrides: "Replace this day" and "Push the loop back" both work and the rest of the loop stays correct · evidence 29 Oct 2026 (web): `schedule.test.ts` 15 tests incl. replace, push back, two push-backs, clear; `test:e2e` "Push the loop back" and "Replace this day only" flows pass; device check still open
- [x] Today screen: today's plan plus the next 7 days; helpful empty state on first launch · evidence 29 Oct 2026 (web): `test:e2e` Today filled (Push, day 1 of 3, 7-day strip) and empty (Mia, 3 steps, button creates a workout) pass; `docs/design/checks/today.png`, `today-empty.png`; device check still open
- [ ] Local persistence: all data survives an app restart; no account

## Next step (one line)
New session: `/build-screen Today` in the new direction S1 Loop orbit (design `Final / Today`; tokens already switched to Teal Glow, the old C layouts remain until each screen is rebuilt). The new workout flow (#11, #12) needs a spec update of 001 before Workout, Exercise and Summary are built.

## Open questions (Claude adds here, never invents answers)
- Another dev server in this folder overwrote `.expo/types` (route types) mid-session; CLAUDE.md says one session per repo.
- Should a loop also support weekday plans (Mon Push, Wed Pull every week), or is the N-day loop enough for v1? (from the concept PDF)
- Business mode needs the Apple Developer Program (about 99 USD per year) before the 10 strangers test; budget cap is 0 EUR. Decide before the stranger check.
- Confirm `docs/data-inventory.md` (written by Claude as a Suggestion while building persistence).
- Demo data now needs `?state=filled` (Lena); a plain launch is the real, saved app. Any `?state=` or `?date=` link is demo mode and saves nothing until the app restarts.
- Days before the loop starts (today is 29 Oct, Lena's loop starts 2 Nov): Today shows "Free" and "Your loop starts Mon, 2 Nov 2026". No design for this; keep, or design it?
- Rotation editor: the native tab bar stays visible on this pushed screen (iOS default); the design frame has none. Keep the platform default?
- `npm ci`: install scripts of `@parcel/watcher` and `unrs-resolver` are not approved (allowScripts); `npm audit` shows 3 high. Look at both before adding packages.
- `.mcp.json` (FigCraft MCP setup) is untracked. Commit it so the design tool setup is in the repo, or keep it local?
- A workout left open overnight stays the open one: the next day Today shows "Continue workout" (no date shown) instead of Let's go, and finishing files it under the old date. Keep, show the date, or ask to finish or discard? (spec 001 review)
- Undo on the exercise screen covers only the last deleted workout; a second delete within 6 s drops Undo for the first. OK for v1?
- If a workout holds the same lift twice, the graph and history use only its first block. Allow the same lift twice in a workout at all?
- 2026-10-29: a dev server on 8081 (`expo start -c`, not started by Claude) was running next to your 8082 one; the route types in `.expo/types` came out broken (`/../data/...` paths). Stop it when you are done with it.
- Two Expo integrations load here (the `expo` plugin and a claude.ai Expo connector); keep the plugin, turn the connector off for this folder.

- Drawings for every lift and workout (#14): 60 lifts plus each workout is a separate art task. Draw them all in FigCraft first, or start with Lena's 8 lifts and a neutral placeholder for the rest?
- Hero gradient in code: React Native's built-in gradient background, or `expo-linear-gradient` (new package, needs your OK)? Decide in `/build-screen Today`.
- Dark mode buttons: tokens use the mint accent with dark text; the dark frames showed teal buttons with white text. Check on the iPhone.
- Ratchet (same mistake twice, 2026-10-29): wrong `$step` numbers in FigCraft batches (4 times) and frame names swapped after duplicating. Suggestion: a small script in `scripts/` that builds FigCraft batches with named steps instead of counted numbers, plus "read the copy's ids before renaming" as a note in `/designs` step 2. OK to add?

## Evidence so far (Business mode; details in docs/evidence.md)
Channel: gym / uni sport circle, 10 try it · Conversations: 0/5 · Signups: 0 · Strangers who used it twice: 0

## Where things are
Start START-HERE.md · Brief docs/brief.md · Your files docs/input/ · Designs docs/design/ · Decisions docs/decisions.md · Log docs/log.md · Specs docs/specs/ · How the repo works docs/how-this-repo-works.md · Playbook docs/playbook/
