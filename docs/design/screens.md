# Screens

One row per screen. `checked-web`: looked right in the web preview and the layout wall (Claude may set it). `checked-device`: Sebastian opened it on the iPhone (only he sets it); if Android is a target in `docs/brief.md`, also on the Android emulator. Done for a screen = `checked-web` + `checked-device`.

Designs come first: `/designs` adds one row per main screen (at most 10) with the link to its frame or picture in the picked direction. `/build-screen` then codes them one by one.

| Screen | Route | Spec / design | checked-web | checked-device | Notes |
|---|---|---|---|---|---|
| Home | `/` (states: `?state=empty`) | starter placeholder | 2026-10-28 | no | Replaced by the first screen of the picked design |
| Profile | `/profile` | starter placeholder | 2026-10-28 | no | Replace in slice 1 |
