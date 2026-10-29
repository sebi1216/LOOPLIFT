# LoopLift brief (working title)

/kickoff filled this from `docs/input/Workout Planner App Concept.pdf` and an interview. Decisions: `docs/decisions.md` (newest wins). Open questions: `docs/now.md`. Last changed: 2026-10-28

## 1. Mode and idea
- Mode: Business. Why: Sebastian chose it at kickoff; the app should win real users, not only serve as a test project. A mode switch is written as a decision in `docs/decisions.md`.
- One sentence: people who train 3 to 6 times a week on a self-chosen split (Push/Pull/Legs, Upper/Lower, Full Body) can set their split up once as a repeating loop so that "what am I doing today and tomorrow?" takes one glance.
- Core loop: opens the app and sees today's workout (or rest) -> glances at the next 7 days -> skips or moves a day when life happens, without breaking the loop -> gets a plan that is always right. Comes back because every training day starts with "what's today?".

## 2. Main screens (input for /designs, at most 10)
| # | Screen | What the user does there |
|---|---|---|
| 1 | Today (home) | Sees today's workout or rest as a big card with exercises (sets x reps) and a 7-day strip; opens the workout, skips or swaps today |
| 2 | Change-a-day sheet | Picks "Replace this day only" or "Push the loop back" (no default: both shown equally) |
| 3 | Calendar | Month view, each day labelled with its workout; rotation days and manual days look different; tap a day to assign a workout or Rest, or clear an override |
| 4 | Rotation editor (from Calendar) | Ordered slots (workout or Rest), add, reorder by drag, pick a start date |
| 5 | Workouts | List of workout templates with exercise count; create, duplicate, delete |
| 6 | Workout editor | Name the workout, add, remove and reorder exercises, set target sets x reps |
| 7 | Exercises | Searchable library grouped by muscle group; add a custom exercise, rename, delete (warns if used) |
| 8 | First launch / empty states | "No workouts yet, create your first" on Today, Workouts and Calendar |

## 3. Slice card: slice 1
- Order of work: 1. strategy (this brief), 2. designs (`/designs`, one direction picked), 3. code, screen by screen. No hour cap, no timeline, no stop rules: the biggest current problem and what is most fun come first.
- Targets: iPhone (Expo Go). Web preview is free for checking but not a target. No Android, no iPad.
- Must-haves (max 5; locked: Claude ticks them only with evidence and never edits them; the live list is in `docs/now.md`):
  - [ ] Exercise library and workout templates: starter list of about 20 lifts; add, rename, delete exercises; named workouts with target sets x reps, reorderable
  - [ ] Plan days: set any date to a workout or Rest and clear it again; a repeating rotation (workouts and Rest) with a start date, shown repeating on the Calendar
  - [ ] Day overrides: "Replace this day" and "Push the loop back" both work and the rest of the loop stays correct
  - [ ] Today screen: today's plan plus the next 7 days; helpful empty state on first launch
  - [ ] Local persistence: all data survives an app restart; no account
- No-gos: set and weight logging, pre-made programs or AI coaching, accounts or cloud sync, social features, Apple Health or wearables.
- Build risk (both modes): the scheduling engine, a pure `resolveDay(date)` over DayEntry, Rotation and RotationShift (slot = (days since start - shifts before d) mod n) · built and unit-tested first (example loop Push, Pull, Rest from Mon 2 Nov 2026, both override types), before Calendar and Today · result: <works | cut | change plan>
- Storage: the PDF suggests `expo-sqlite` (in Expo Go). A new package needs Sebastian's OK first (CLAUDE.md rule 3).
- Permission or approval risk: Apple 4.3(b) (spam: many workout planners exist; the loop must be clearly our own) · no third-party APIs · daily reminder (later) needs notification permission · how we check: re-read App Review Guidelines 4.3 before the first TestFlight.
- Done when (behaviour, not opinion): every screen checked-web and checked on the iPhone, and "I used it on my iPhone with my own real data on 3 different days" (data on the device; no backend in slice 1). Then the stranger check in section 5.
- New ideas go to the toy box. A must-have changes only when I say so (logged in `docs/decisions.md`).

## 4. Toy box (ideas parked with a date)
| Date | Idea | Played with? |
|---|---|---|
| 2026-10-28 | Mark as done, completed days with a check on the Calendar (PDF P1) | no |
| 2026-10-28 | Workout colors in Calendar and 7-day strip (PDF P1) | no |
| 2026-10-28 | Daily reminder naming today's workout (PDF P1) | no |
| 2026-10-28 | Rotation editor shows the next 14 days before saving (PDF P1) | no |
| 2026-10-28 | Set logging, progress charts, sync, multiple rotations (PDF P2; data model ready for set logging) | no |

## 5. Business mode only (evidence log: `docs/evidence.md`)
- Assumptions in this order: Reach: people at my gym or uni sport who are not close friends; 10 of them try it · Want: they train on a fixed split and plan it today in their head, notes or a spreadsheet · Build: `resolveDay` handles loops and overrides correctly.
- One check when slice 1 works on the iPhone: what did the 10 strangers do? Then expand, change or stop (my call; no hour or date trigger).
- Evidence never blocks coding. It decides growing scope (slice 2, a backend, a new platform).

## 6. Budget (EUR per month; cap: 0 EUR for now; estimates (E), check prices before paying)
| Item | Now | Trigger for paying | Note |
|---|---|---|---|
| Claude plan | your current plan | Weekly limit hit 2 weeks in a row | `/usage` weekly |
| Apple Developer Program | 0 | First of: Business mode before outside testers (this app: before the 10 strangers); a package not in Expo Go; a store Expo Go gap. Enrol 3 days early | about 99 USD per year; above the 0 EUR cap: ask first |
| Google Play developer account | 0 | Not a target | about 25 USD once |
| Design tool (FigCraft or Figma) | 0 | Only if the free plan blocks `/designs` | check the price first |
| EAS, Supabase, domain | 0 | Free tiers first | Supabase Free has no backups |

## 7. Outside constraints (orientation only)
- None named at kickoff (2026-10-28).

## 8. Lawyer questions (bundle them for one paid hour; orientation only)
- [ ] Impressum (§ 5 DDG) once the app or a smoke test page is public; which address [lawyer]
- [ ] Privacy policy, consent for analytics (start without analytics SDKs) [lawyer]
- [ ] Health-adjacent data: is a workout plan stored only on the device personal or health data under GDPR? [lawyer]
- [ ] Payments, trader status in the stores (address becomes public) [lawyer]
- [ ] Side business next to the employment contract (approval, IP clause) [lawyer]/HR
- [ ] Gewerbe, Kleinunternehmer, VAT [tax]

## 9. Not now (no-gos for the whole first version)
- Set and weight logging; pre-made programs or AI coaching; accounts or cloud sync; social features or sharing; Apple Health, Google Fit, wearables; Android and iPad as targets.
