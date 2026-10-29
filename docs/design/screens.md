# Screens

One row per screen. `checked-web`: looked right in the web preview and the layout wall (Claude may set it). `checked-device`: Sebastian opened it on the iPhone (only he sets it); if Android is a target in `docs/brief.md`, also on the Android emulator. Done for a screen = `checked-web` + `checked-device`.

Designs: direction C Loop Ring in `docs/design/looplift.figcraft` (frame names below), PNGs in `docs/design/renders/c-loop-ring/`. `/build-screen` codes them one by one, core loop first. Built 2026-10-29; screenshots in `docs/design/checks/`.

| Screen | Route (planned) | Spec / design | checked-web | checked-device | Notes |
|---|---|---|---|---|---|
| Today | `/` (states: `?state=empty`, `?date=2026-11-05`) | frame `C / Today`, `today.png`; dark `today-dark.png` | 2026-10-29 | | Core loop, build first |
| Today empty (first launch, Mia) | `/?state=empty` | frame `C / Today empty`, `today-empty.png` | 2026-10-29 | | Same route as Today |
| Change-a-day sheet | `/change-day?day=2026-11-05` (sheet over any tab) | frame `C / Change-a-day sheet`, `change-day-sheet.png` | 2026-10-29 | | Both options equal, no default |
| Calendar | `/calendar` | frame `C / Calendar`, `calendar.png`; dark `calendar-dark.png` | 2026-10-29 | | Rest dashed, manual days pin + label |
| Rotation editor | `/calendar/loop` | frame `C / Rotation editor`, `rotation-editor.png` | 2026-10-29 | | Pushed from Calendar "Edit" |
| Workouts | `/workouts` | frame `C / Workouts`, `workouts.png` | 2026-10-29 | | Empty state: Suggestion, reuse the empty Today pattern |
| Workout editor | `/workouts/[id]` (picker sheet `/workouts/add?id=`) | frame `C / Workout editor`, `workout-editor.png`; dark `workout-editor-dark.png` | 2026-10-29 | | |
| Exercises | `/exercises` (add/rename sheet `/exercises/edit`) | frame `C / Exercises`, `exercises.png` | 2026-10-29 | | Delete warns if used ("In Push") |
