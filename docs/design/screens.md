# Screens

One row per screen. `checked-web`: looked right in the web preview and the layout wall (Claude may set it). `checked-device`: Sebastian opened it on the iPhone (only he sets it); if Android is a target in `docs/brief.md`, also on the Android emulator. Done for a screen = `checked-web` + `checked-device`.

Designs: direction S1 Loop orbit, Teal Glow (picked 2026-10-29) in `docs/design/looplift.figcraft`, frames `Final / ...`; PNGs in `docs/design/renders/final/`. The screens built on 2026-10-29 follow the old direction C, so `checked-web` is empty again until `/build` rebuilds each one in S1. Core loop first. Screenshots go to `docs/design/checks/`.

No screen cap (decision #23; the old cap of 10 came from FigCraft). The exercise screen from the Exercises tab and the one inside a workout stay one screen (decision #13).

| Screen | Route | Design | checked-web | checked-device | Notes |
|---|---|---|---|---|---|
| Today | `/` (states: `?state=empty`, `?state=filled`, `?state=skipped`, `?date=2026-11-05`) | `Final / Today`, `today.png`; dark `today-dark.png`; empty `today-empty.png`; skipped `today-skipped.png` (no frame) | 2026-11-03 | | Core loop, build first. Loop orbit hero, Push drawing sticker. Since 2026-11-03: "Marked as rest" card with Put back, and the loop card (Edit loop) that used to be on the Calendar |
| Workout | `/session` (`?start=w1&state=filled&date=2026-11-05`) | `Final / Workout`, `workout.png`; dark `workout-dark.png` | 2026-10-31 | | Exercise tiles, any order, hint chip per tile. Replaces the one-list workout screen (decision #11) |
| Exercise | `/exercises/[id]` (Exercises tab) and `/session/[exerciseId]` (inside a workout), one shared screen `src/ui/exercise-screen.tsx`; states `?state=comeback`, never logged `/exercises/e9?state=filled` | `Final / Exercise (scrolls)`, `exercise.png`; dark `exercise-dark.png`; comeback `exercise-comeback.png` | 2026-10-31 | | Drawing + cues, hint, last time, sets, Finish exercise; graph and history below |
| Summary | `/session/summary?id=` (after Finish workout) | `Final / Summary`, `summary.png` | 2026-10-31 | | New records, next-time hints, next loop day |
| Change-a-day sheet | `/change-day?day=2026-11-05` (sheet) | `Final / Change-a-day sheet`, `change-day-sheet.png` | 2026-10-31 | | Both options equal, no default, 4-day previews |
| Rotation editor | `/loop` | `Final / Rotation editor`, `rotation-editor.png` | 2026-11-03 | | From the loop card on Today. The Calendar tab was removed 2026-11-03 |
| Workouts | `/workouts` | `Final / Workouts`, `workouts.png` | 2026-10-31 | | One drawing per workout |
| Workout editor | `/workouts/[id]` (picker sheet `/workouts/add?id=`) | `Final / Workout editor`, `workout-editor.png` | 2026-11-03 | | Tap a target to edit sets x reps, and Remove from workout (`workout-editor-remove.png`). A new lift in the picker picks a picture |
| Exercises | `/exercises` (add/rename sheet `/exercises/edit`) | `Final / Exercises`, `exercises.png` | 2026-11-03 | | Last weight per lift, hint chip; delete warns if used. A lift you add picks its picture (`exercise-new-picture.png`) |
| Form sheet (Suggestion, see now.md) | `/form?id=e9` (from a Today row and inside a workout); demo also on the Exercise screen | No design frame, built in code (spec 002) | 2026-11-02 | | Moving figure, moment in words, Pause, cues, what to avoid; Reduce Motion shows two still poses |
| Settings (Suggestion, see now.md) | `/settings` (gear on Today); `?state=denied` shows the note for notifications turned off | No design frame, built in code from the S1 tokens and platform controls | 2026-11-02 | | Rest timer on/off, rest length, rest alert, haptics; Weights: kg / lb, Show both units, Standard reps (2026-11-03); Appearance System / Light / Dark. `settings.png`, `settings-weights.png`, `settings-dark.png`, `settings-de.png` |
| Progress (Suggestion, see now.md) | `/progress` (2nd tab); `?state=filled&date=2026-11-05` (Lena), `?state=empty` (Mia) | No design frame, built in code from the S1 tokens (from Sebastian's screenshot of another app) | 2026-11-03 | | Gym days: one row per year with workouts (month boxes removed 2026-11-03), week streak, strength web with Week/Month/Year/All. `progress.png`, `progress-strength.png`, `progress-dark.png`, `progress-empty.png`, `progress-strength-de.png` |
