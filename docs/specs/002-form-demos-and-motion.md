# Spec 002: form demos, rest timer, motion

Written after the build on 2026-11-02, from Sebastian's request of 2026-11-01: "Test the current application. Think about what we can improve on the functionality side and on the design side. What I am kinda still missing is videos and so on of the correct ausführung der Übungen wie bringen wir dies mit ein. Was ist mit Animationen. Setze alle diese Themen um. Du brauchst mich nicht mehr zu fragen". No interview on purpose. Every product choice below is a Suggestion until he confirms it (Open questions in `docs/now.md`).

## What the test found
| Finding | What was done |
|---|---|
| 52 of 60 lifts: a neutral dumbbell and no words at all on how to do them | A form demo, 3 cues and 1 thing to avoid for all 60 |
| Nothing moves, so a line drawing cannot show a movement | Animated figures; motion across the app |
| Between sets you watch the clock yourself | Rest timer starts on the tick |
| A new weight has to be typed once per set | Later open sets with the same weight follow |
| Today: rows not tappable, Start workout falls below the fold once rows carry drawings | Rows open the form sheet, Start workout sits directly under the hero |
| Workouts you create have no drawing | They show the drawing of their first lift |
| Summary and graph give no sense of total | "kg moved" on Summary, "+7.5 kg since 24 Sept" on the graph, "2 of 5 this week" on Today |

## Form demos: why animated figures and not videos now
Decision #8 rules out copying clips and turned down YouTube links; decision #14 wants an own drawing per lift. So the demos are our own moving figures in the app's style, drawn in code.

- Engine: `src/ui/form-motion.ts`. A lift is 2 or 3 key poses (hips, torso angle, hands, feet); elbows and knees are computed, so limbs never stretch and planted feet stay down. It runs per frame on the UI thread.
- The 60 lifts: `src/ui/form-demos.ts`. Texts: `src/i18n/form-strings.ts`. Review picture: `docs/design/checks/form-demos.png` (start, middle, end of each).
- Costs: no package, no file size worth naming, no network, works offline, works in Expo Go, follows light, dark and any accent.
- Limits: a figure shows the path of a movement, not muscle tension or real grip details. Nobody who coaches has reviewed the poses or cues yet.
- Where: big on the Exercise screen from the Exercises tab, small inside a workout (tap opens the sheet), and the sheet `/form?id=e9` from a row on Today. Own lifts have no demo. Reduce Motion shows the first and last pose side by side.

## Real videos: the options (not built)
Suggestion: test the figures in the gym first. They may be enough, and every option below costs money, time or the 0 EUR cap.

| Option | What it takes | Trade-off |
|---|---|---|
| A. Figures only (built) | Nothing more | Free and ours; less vivid than a person |
| B. Film our own clips | 60 short clips of one person, `expo-video` (58.0.13, needs a dev build check), storage or a bigger app | Fully ours and on brand; hours of filming, a person's image rights, clips must be replaced together if the style changes |
| C. License a library | Contract, `expo-video`, a host or their API | Fast and vivid; recurring cost, foreign look, and written rights for in-app use must be checked |
| D. Link out to YouTube | `Linking` only | Already turned down in decision #8 |

Prices found on 2026-11-02, unchecked offers only, check before relying on them: Hyperhuman lists API plans of several hundred USD per month ([exercise video API](https://hyperhuman.cc/exercise-video-api), [pricing](https://hyperhuman.cc/pricing)); one-off animation packs exist from about 195 USD for 130 bodyweight moves ([example](https://www.upwork.com/services/product/video-audio-130-3d-bodyweight-home-fitness-library-for-apps-and-courses-2011048238385457234)). The MIT licence of the [ExerciseDB API repository](https://gb.xjqchip.workers.dev/cyberboyanmol/exercisedb-api) covers its code; whether it covers the videos and GIFs could not be confirmed.

## Rest timer
Starts on ticking a set, 90 s by default; -15, +15, Skip; unticking takes it back; keeps counting on the tiles; one short buzz at the end with "Rest over. Next set!". The length you set holds until the app closes. Memory only, nothing saved, so no data-model change. It works with the app open; on the lock screen it needs `expo-notifications`.

## Motion (gate from `animate-expo`, rules in `docs/design/rules.md` 4)
| Where | What | Why it passes the gate |
|---|---|---|
| Buttons, tiles, Today rows | Scale 0.97 in 120 ms | Press feedback, near-imperceptible |
| Tick a set | Row colour 180 ms, tick pops | State change on the main action |
| Added set, rest bar, Undo bar | Fade up 280 ms | Things arriving |
| Today ring | Turns into place 600 ms, once per app run | Today opens often, so never twice |
| Graph | Line draws itself 600 ms | Shows the direction of travel |
| Summary | Pieces arrive in turn; burst only with a new record | Rare, the delight budget |

Rejected: tab transitions (never), animated tiles in the workout grid (four moving figures distract; they stay still), a Today plan crossfade (frequent, no purpose). Every animation has a Reduce Motion path. Haptics are not in: `expo-haptics` needs Sebastian's OK (`CLAUDE.md` rule 3).

## Done when
- `npm run check` passes; `form-motion.test.ts` covers all 60 lifts: demo exists, one of a kind, constant limb lengths, stays on the grid, planted feet stay, cues and avoid in EN and DE.
- `npm run test:e2e` passes, including `Form demos` (figure moves, Pause stops it, Reduce Motion shows two still poses, Today row and workout open the sheet, German) and `Rest timer and quick logging`.
- `npx expo export --platform ios` bundles.
- Open until Sebastian does it: on the iPhone, the animation runs in Expo Go, and the poses and cues look right to someone who trains.
