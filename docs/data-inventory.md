# Data inventory

Everything LoopLift stores, where, and why. CLAUDE.md rule 7: personal data only as listed here; none in logs, tests or demo data. Change this file before the app stores anything new. Last changed: 2026-10-29.

Status: Suggestion by Claude, written while building persistence (decision #6). Sebastian confirms or changes it. Whether a workout plan on the device counts as personal or health data under GDPR is a lawyer question in `docs/brief.md` section 8.

| What | Example | Where | Leaves the phone? | Why | Code |
|---|---|---|---|---|---|
| Exercise library (names, muscle group) | "Bench Press", chest | expo-sqlite key-value store on the phone, key `looplift.data` | No | Workouts are built from it | `src/data/store.ts`, `src/data/persist.ts` |
| Workouts (name, exercises, target sets x reps) | Push: Bench Press 4 x 6 | same key | No | Today shows them | same |
| Schedule (loop slots and start date, days set by hand, push-back dates) | Push, Pull, Rest from 2026-11-02 | same key | No | The Calendar and Today are computed from it | same |
| Workout log (date, workout name, lifts, kg and reps per set, ticked or not) (Suggestion, spec 001) | 2026-11-05 Push: Bench Press 65 kg x 6 | same key | No | Prefills the next session, Done days, the graph per lift | `src/data/tracker.ts`, `src/data/store.ts` |

Not stored: name, email, account, device id, location, health data, analytics, crash reports. The demo casts (Lena, Mia) are made up and never saved.

Web preview only: the same data in the browser's localStorage (`src/data/persist.web.ts`), for testing.

Deleting: removing the app deletes everything. There is no in-app "delete my data" yet (Suggestion for later: toy box).
