# Decisions

Only Sebastian's explicit decisions count. Claude proposes a row ("Suggestion:") and adds it after he confirms the wording.
Newest wins: if this file and another doc disagree, the newest row here wins; fix the other doc.
Status: `decided` | `replaced by #n`.
Who decided: `Sebastian` | `Claude suggestion, accepted by Sebastian` (then name the one alternative he turned down).

| # | Date | Decision | Why (2 lines max) | Who decided | Status | Replaces |
|---|---|---|---|---|---|---|
| 1 | 2026-10-28 | Stay on Expo SDK 58 and test on the iPhone with the App Store Expo Go (58.0.5 supports SDK 58). | Same SDK as the project, no Apple Developer Program needed yet. | Sebastian | decided | |
| 2 | 2026-10-28 | Design direction C Loop Ring picked (playful, warm, visual; the loop shown as a ring). | Makes the loop idea visible and sets LoopLift apart from generic planners. | Sebastian | decided | |
| 3 | 2026-10-28 | Loop ring: "Add react-native-svg" (15.16.0, the SDK 58 pin). | Real arcs with gaps for any loop length; ships in Expo Go. | Claude suggestion, accepted by Sebastian (turned down: fake arcs with View borders) | decided | |
| 4 | 2026-10-28 | Storage: "Decide later". Screens run on an in-memory store in src/data until persistence is built. | Unblocks the screens; must-have 5 stays open. | Sebastian | replaced by #6 | |
| 5 | 2026-10-28 | /build-screen scope: "All 8, one plan", built "as planned" (Calendar tap opens Change-a-day, Let's go opens the workout, drag plus accessibility actions to reorder). | One OK for the whole set; screenshot per screen still shown. | Sebastian | decided | |
| 6 | 2026-10-29 | Storage: "Yes, add 58.0.13" (expo-sqlite, exact pin; 58.0.14 was under 7 days old). Data saved on the phone only. | Must-have 5: data survives a restart, no account. | Claude suggestion, accepted by Sebastian (turned down: test on the device first) | decided | #4 |
| 7 | 2026-10-29 | Weight tracker with graphs: "Now, as a new must-have". Lifts the slice-1 no-go "set and weight logging"; built from a /spec. | Sebastian: target sets x reps you soon know by heart; the weight you did and its trend over time is what matters. | Sebastian | decided | |
| 8 | 2026-10-29 | Exercise images: "Cues + own drawings". Per lift 2 to 3 short "watch out for" cues in our own words, then simple line drawings in the app's style; nothing copied from TikTok or YouTube. | Remember the form points at a glance. | Claude suggestion, accepted by Sebastian (turned down: cues plus YouTube links; cues only) | decided | |
| 9 | 2026-10-29 | Workout tracker answers for spec 001: logging on a workout screen from Let's go; weight + reps per set; prefilled with last time's numbers; kg only; graph "Heaviest set over time"; history by tapping an exercise; any workout, today only; finished days get "a check on that day"; edit and delete later; resume mid-workout. "Mark as done" leaves the toy box. | Sebastian's answers in the /spec interview. | Claude suggestion, accepted by Sebastian (turned down per question: Today-card logging, weight only, empty sets, lb setting, a Progress tab, past days, history only, read-only, saved only on Finish) | decided | |
