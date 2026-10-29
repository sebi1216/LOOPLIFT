# Spec 001: Workout tracker   Status: draft

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
- New routes to confirm in plan mode: workout screen (for example `/session`) and exercise screen (`/exercises/[id]`).

## Open questions
- Design: build these two screens code-first from the direction, or a short `/designs` round (2 frames in C) first?
- After finishing, should the ring on Today change (for example a check in the middle), or only the strip?
- If the workout template changes mid-session (an exercise added), the open session keeps its own copy. OK?
