# Spec 001: Workout tracker   Status: update 2 (S1 flow) in build; update 1 built (web-checked; device check open)

## Update 2, 2026-10-30: S1 workout flow (decisions #11, #12, #13, #14)
Replaces "Flow" steps 2 and 3 and the workout screen part of the checks below. Everything else stays.

Flow:
1. "Start workout" on Today opens the Workout screen: one tile per exercise (drawing, "Last: 4 × 6 · 65 kg", hint chip), "0 of 4 done", any order.
2. A tile opens the Exercise screen inside the workout: muscle group, name, 2 to 3 cues and the drawing on the hero; the hint card ("Time to add weight", with "Use 67.5 kg" and "Keep 65 kg"); "Last time"; the set rows (prefilled as before); "Finish exercise" goes back to the tiles; the graph and history below.
3. A tile counts as done when every set of it is ticked; otherwise it shows "2 of 4 sets".
4. "Finish workout" saves (ticked sets only, as before) and opens the Summary: lifts, sets, new records, "Next time" hints (add weight and stay only) and the next loop day. "Done" goes to Today.
5. The Exercises tab opens the same Exercise screen without the set rows and Finish (graph, history, rename, delete).

Hint rules (decision #12), pure in `src/data/hints.ts`, built red/green in `hints.test.ts`:
- Add weight: every set reached the target reps in each of the last 2 finished sessions at the same top weight: + 2.5 kg (upper body), + 5 kg (legs); rounded to 2.5 kg.
- Stay: the same top weight for 3 or more sessions without every rep: stay, aim for 1 more rep than the lowest set last time.
- Comeback: last session 14 to 27 days ago: about 90%, 28 days or more: about 80% of the last top weight, rounded down to 2.5 kg ("Welcome back").
- Same: anything else, and bodyweight lifts (0 kg): "Same as last time". No history: no hint.
- Each hint says its reason ("every rep, 2 sessions in a row"). "Use" sets the kg of all unticked sets; "Keep" hides the card for this workout.
- Record: a finished set heavier than every earlier finished set of that lift (tie: more reps). A lift's first session is not a record.

Acceptance checks (update 2):
- Lena, Thu 5 Nov, Start workout: 4 tiles; Bench Press shows "Last: 4 × 6 · 65 kg" and "Try 67.5 kg"; Incline DB Press shows "Stay at 24 kg · +1 rep". Check: Playwright + `docs/design/checks/workout.png`.
- Bench Press tile → hint "Time to add weight", "Use 67.5 kg" fills 4 sets with 67.5; tick all 4, Finish exercise: the tile reads done, "1 of 4 done". Check: Playwright + `exercise.png`.
- Finish workout → Summary: 1 new record (Bench Press 67.5 kg × 6, 2.5 kg over your best), "Next in your loop: Pull, tomorrow". Check: Playwright + `summary.png`.
- `?state=comeback` on Bench Press shows "Welcome back" with 57.5 kg (about 90% of 65 after 2 to 4 weeks off). Check: Playwright + `exercise-comeback.png`.
- Lifts without a drawing yet show a neutral placeholder, never another lift's drawing (#14; drawn now: Push, Pull and Lena's 8 lifts).

Done when (update 2): `npm run check` and `npm run test:e2e` pass, and `docs/design/checks/` has `workout.png`, `exercise.png`, `exercise-comeback.png`, `summary.png`.

Slice: 1 (decision #7, must-have added by Sebastian) · Why: targets you soon know by heart; the weight you did and its trend is what keeps you coming back.

## Flow
1. Today: "Let's go" opens the workout screen for today's workout. On a rest day, any workout can be started (today only; no past dates).
2. Each exercise shows its sets as rows: kg and reps, prefilled from the last finished session of that lift (first time: reps = target, kg empty). The target ("3 × 8") is a quiet hint.
3. I change what differs and tick each set. Every change is saved at once.
4. If I leave the app, Today shows "Continue workout" until I finish or discard it.
5. "Finish workout": the day gets a check plus "Done" on the Calendar and in the Today strip.
6. Exercises tab: tapping a lift opens its screen: a graph of the heaviest set per session over time, past sessions below, rename moves here. A past session can be edited, or deleted with undo.

## Acceptance checks
- When I tap "Let's go" on Lena's Push day, the workout screen lists her 4 exercises with sets prefilled from her last Push (Bench Press 4 sets at 65 kg x 6). Check: Playwright + screenshot `session`.
- When I change a set and reload the page mid-workout, Today shows "Continue workout" and the set keeps my numbers. Check: Playwright (reload); device tap: close and reopen the app.
- When I finish, Thu 5 Nov shows a check plus "Done" on the Calendar and in the Today strip; unticked sets are not kept. Check: Playwright.
- When I open Bench Press, the graph shows one point per finished session (heaviest set); a lift never logged shows "Log a workout to see your progress". Check: Playwright + screenshots `exercise-detail`, `exercise-detail-empty`.
- When I edit a past set or delete a session, the history and graph update; Undo brings a deleted session back. Check: Playwright.
- In German, dark mode and at 200% text, set rows and the graph do not clip. Check: screenshots `session-de`, `exercise-detail-dark`; device tap with large text.

## Logic built red/green
`src/data/tracker.test.ts` first, then `src/data/tracker.ts` (pure, like `schedule.ts`):
- startSession: sets from the workout's targets; prefill per set index from the last finished session of that lift (fewer sets last time: repeat its last set); only one open session (starting again returns it).
- finishSession: drops unticked sets; a session with no ticked set is discarded.
- topSet per lift and session (most kg, tie: more reps); history(exerciseId) by date, finished only; doneDates for Calendar and Today.
- editSet, deleteSession and restore (undo).
- parseKg: "62,5" and "62.5" give 62.5; 0 to 999.5 in steps of 0.5 (bodyweight lifts: 0 = no extra weight); anything else is refused.
- Saved data: `sessions` added to AppData; older saves without it load with no sessions (`store.test.ts`).

## Done when
`npm run check` and `npm run test:e2e` pass, and `docs/design/checks/session.png`, `exercise-detail.png` and `exercise-detail-empty.png` exist.

## Out of scope
- lb, effort (RPE), rest timer, plate calculator, personal-record alerts, export, logging past dates.
- Estimated 1-rep max and volume graphs (toy box).
- Sync or backup (no-go: no accounts).

## Design and data
Design: code-first from `docs/design/direction.md` (no frame for these two screens yet; see open questions). Graph: own line chart with react-native-svg, no new package.
Demo data: Lena gets 6 weeks of finished Push and Pull sessions (Bench Press 57.5 to 65 kg); Mia has none (empty states).
States: workout screen filled and open (`?state=filled`), exercise screen filled and empty (a lift without sessions); no loading or error states (local data).

## Files and interfaces (Claude fills this in during plan mode)
- Routes: workout screen `/session` (root stack, over the tabs; `?start=w1` starts that workout for today or shows the open one), exercise screen `/exercises/[id]` (rename moved to its header, opens `/exercises/edit?id=`).
- Data: `src/data/tracker.ts` (pure: parseKg, parseReps, startSession, editSet, addSet, finishSession, deleteSession, restoreSession, topSet, history, doneDates; tests in `tracker.test.ts`). `AppData.sessions` in `store.ts`; saves without it load with `[]`, broken entries are refused. Lena's 28 sessions: `demoSessions()` in `demo.ts`.
- UI: `src/ui/set-row.tsx`, `line-chart.tsx` (react-native-svg), `undo-bar.tsx`; `DayCell` `done` prop (check plus "Done") on Today and the Calendar; the ring shows Done after finishing.
- Answers to the open questions (Sebastian, 2026-10-29): code-first from direction C; the strip and the ring both show Done; the open session keeps its own copy.

## Open questions
- Design: build these two screens code-first from the direction, or a short `/designs` round (2 frames in C) first?
- After finishing, should the ring on Today change (for example a check in the middle), or only the strip?
- If the workout template changes mid-session (an exercise added), the open session keeps its own copy. OK?
