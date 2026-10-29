# Screens

One row per screen. `checked-web`: looked right in the web preview and the layout wall (Claude may set it). `checked-device`: Sebastian opened it on the iPhone (only he sets it); if Android is a target in `docs/brief.md`, also on the Android emulator. Done for a screen = `checked-web` + `checked-device`.

Designs: direction C Loop Ring in `docs/design/looplift.figcraft` (frame names below), PNGs in `docs/design/renders/c-loop-ring/`. `/build-screen` codes them one by one, core loop first. Routes are planned, not built.

| Screen | Route (planned) | Spec / design | checked-web | checked-device | Notes |
|---|---|---|---|---|---|
| Today | `/` (states: `?state=empty`) | frame `C / Today`, `today.png`; dark `today-dark.png` | | | Core loop, build first |
| Today empty (first launch, Mia) | `/?state=empty` | frame `C / Today empty`, `today-empty.png` | | | Same route as Today |
| Change-a-day sheet | `/change-day` (sheet over Today) | frame `C / Change-a-day sheet`, `change-day-sheet.png` | | | Both options equal, no default |
| Calendar | `/calendar` | frame `C / Calendar`, `calendar.png`; dark `calendar-dark.png` | | | Rest dashed, manual days pin + label |
| Rotation editor | `/calendar/loop` | frame `C / Rotation editor`, `rotation-editor.png` | | | Pushed from Calendar "Edit" |
| Workouts | `/workouts` | frame `C / Workouts`, `workouts.png` | | | Empty state: Suggestion, reuse the empty Today pattern |
| Workout editor | `/workouts/[id]` | frame `C / Workout editor`, `workout-editor.png`; dark `workout-editor-dark.png` | | | |
| Exercises | `/exercises` | frame `C / Exercises`, `exercises.png` | | | Delete warns if used ("In Push") |
| Home (starter) | `/` | starter placeholder | 2026-10-28 | no | Replaced by Today |
| Profile (starter) | `/profile` | starter placeholder | 2026-10-28 | no | Remove when the 4 tabs come |
