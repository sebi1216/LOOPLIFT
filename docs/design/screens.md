# Screens

One row per screen. `checked-web`: looked right in the web preview and the layout wall (Claude may set it). `checked-device`: Sebastian opened it on the iPhone (only he sets it); if Android is a target in `docs/brief.md`, also on the Android emulator. Done for a screen = `checked-web` + `checked-device`.

Designs: direction S1 Loop orbit, Teal Glow (picked 2026-10-29) in `docs/design/looplift.figcraft`, frames `Final / ...`; PNGs in `docs/design/renders/final/`. The screens built on 2026-10-29 follow the old direction C, so `checked-web` is empty again until `/build-screen` rebuilds each one in S1. Core loop first. Screenshots go to `docs/design/checks/`.

10 screens (cap): the exercise screen from the Exercises tab and the one inside a workout are one screen, which frees the slot for Summary.

| Screen | Route (planned) | Design | checked-web | checked-device | Notes |
|---|---|---|---|---|---|
| Today | `/` (states: `?state=empty`, `?state=filled`, `?date=2026-11-05`) | `Final / Today`, `today.png`; dark `today-dark.png`; empty `today-empty.png` | | | Core loop, build first. Loop orbit hero, Push drawing sticker |
| Workout | `/session` | `Final / Workout`, `workout.png`; dark `workout-dark.png` | | | Exercise tiles, any order, hint chip per tile. Replaces the one-list workout screen (decision row pending) |
| Exercise | `/exercises/[id]` (inside a workout: `?session=1`; states `?state=comeback`, `?state=empty`) | `Final / Exercise (scrolls)`, `exercise.png`; dark `exercise-dark.png`; comeback `exercise-comeback.png` | | | Drawing + cues, hint, last time, sets, Finish exercise; graph and history below |
| Summary | `/session/summary` | `Final / Summary`, `summary.png` | | | New records, next-time hints, next loop day |
| Calendar | `/calendar` | `Final / Calendar`, `calendar.png` | | | Done check, rest dashed, set-by-you pin + legend, loop card |
| Change-a-day sheet | `/change-day?day=2026-11-05` (sheet) | `Final / Change-a-day sheet`, `change-day-sheet.png` | | | Both options equal, no default, 4-day previews |
| Rotation editor | `/calendar/loop` | `Final / Rotation editor`, `rotation-editor.png` | | | From the loop card and Edit loop |
| Workouts | `/workouts` | `Final / Workouts`, `workouts.png` | | | One drawing per workout |
| Workout editor | `/workouts/[id]` (picker sheet `/workouts/add?id=`) | `Final / Workout editor`, `workout-editor.png` | | | Tap a target to edit sets x reps |
| Exercises | `/exercises` (add/rename sheet `/exercises/edit`) | `Final / Exercises`, `exercises.png` | | | Last weight per lift, hint chip; delete warns if used |
