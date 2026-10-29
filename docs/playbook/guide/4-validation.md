# 4. Validation (short)

Clou never got a market signal either way (it stopped for another reason: see the [retro](../retros/2026-10-clou.md)). Building is cheap now; attention is not. [Rule 8](../README.md#the-10-rules): **evidence never blocks coding; in Business mode it decides growing scope.**

## Two modes (pick on day 0)

| | Learn/Fun | Business |
|---|---|---|
| Goal | A working app and new skills | Users, later money |
| Style | Vibe coding is fine, on purpose | Agentic engineering: evidence, tests, review |
| Evidence track | None (the risk test still runs) | `docs/evidence.md`, next to building |
| Check question | "Still fun? Still learning? What is the biggest problem now?" | "What did strangers actually do with it?" |

Both are fine. Mixing them silently is not: if you switch mode, write it down as a decision in `docs/decisions.md`. While you are in the US (until Dec 2026), a public signup page or a store account may count as business activity: ask an immigration advisor first (orientation only, not verified).

No hour cap, timeline or stop rules in either mode ([decisions #49](../decisions.md)).

## Why reach comes first

About 560,000 new iOS apps came out in H1 2026 while downloads grew 2 to 3% ([TechSpot](https://www.techspot.com/news/113213-apple-app-store-inundated-low-quality-vibecoded-apps.html)); only 17% of new subscription apps reach 1,000 USD a month within two years ([RevenueCat](https://revenuecat.com/sosa-26-insights/)). The few that work had a channel before the app.

## The evidence track (Business mode, under 2 hours a week, E)

It lives in `docs/evidence.md` (created by `/kickoff` only in Business mode); `docs/now.md` shows the counts.

1. **Riskiest assumptions, in this order:**
   - **Reach**: where you find 20 target users. Name **one channel with a number** (for example "my club's group chat, 40 members").
   - **Want**: they have this problem today. How do they solve it now?
   - **Build**: the hardest technical piece (built and tested first, from the slice card).
   - **Permission**: who outside must say yes (an API owner, a store rule). Ask early.
2. **Five Mom Test conversations** with strangers from the target group. 15 minutes; a DM chat counts. Log 3 lines each. No talks possible? Ten short videos about the problem on your channel are an audience test too.
3. **One smoke test page** (below).
4. **One check** when slice 1 works on the iPhone (below).

## Mom Test basics

Three rules (https://www.momtestbook.com/): talk about their life, not your idea; ask about specific past behaviour, never "would you use...?"; it only counts if it ends with a commitment (time, an intro, or money).

Five questions:
1. Tell me about the last time you did <the job>. What happened?
2. What was the hardest part? What did you do about it?
3. What have you tried or paid for? Why did you stop?
4. How much time or money does it cost you now?
5. (End) I'm building something for this. Can I show you soon?

For consumer apps, behaviour beats opinion: watch what strangers do with the prototype. A feed needs a narrow start (one sport, one club, one city) or it stays empty.

## Smoke test page

One page: the promise in one sentence, 3 screenshots (with the cast), an email signup. Claude Code builds it in about an hour (E). Share it in your named channel. Set your success number **before** you look.

Legal orientation only, ask a lawyer: such a page likely needs an Impressum (§ 5 DDG), and an email list a privacy notice and double opt-in (https://e-recht24.de/artikel/datenschutz/209.html).

## Store rules that shape the slice

- **Apple 4.3(b), June 2026**: "Don't submit apps that are indistinguishable from what's already widely available." Write one sentence on why yours is different. In saturated categories (dating, flashlight, sound effects, wallpaper, simple timers, fortune telling) Apple may also remove apps that are not updated, improved or do not attract customers ([Apple guidelines](https://developer.apple.com/app-store/review/guidelines/)).
- **Apple 1.2, user-generated content**: an app with user posts needs four things before other users arrive: **filtering** of objectionable content, **reporting** with a timely response, **blocking** of users, and **published contact info** ([Apple guidelines](https://developer.apple.com/app-store/review/guidelines/)).
- **Google Play**: 25 USD once; new personal accounts need a closed test with **12 testers for 14 days in a row** before production ([Play help](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB)). Start it about 3 weeks before an Android release (E).
- **Apple Developer Program**: the triggers and "enrol 3 days early" are in [guide 1 C](1-first-day.md#c-expo-go-check).

## The check

Both modes start with one criterion you can reach alone: "Done when: I used it on my iPhone with my own real data on 3 different days."

Business mode adds strangers, but they need a way to get the app (TestFlight needs the Apple Developer Program) and, while you are in the US, an immigration advisor's OK. So this comes after January. When slice 1 works on the iPhone, look at what strangers did, for example: did 3 strangers use it twice in one week? Then you decide, with no hour or date trigger:
- **Expand**: start slice 2.
- **Change**: a new slice card on the same idea.
- **Stop**: archive the repo with a 5-line note and write a retro.

## Use the skills you already have

Don't write your own strategy method. Run these in HQ and copy the result into `docs/brief.md` or `docs/evidence.md`. Run `claude plugin list` first.

| Moment | Skill |
|---|---|
| Idea phase, sharpening the problem | `product-management:brainstorm` |
| Before the first talk; after the talks | `venture:customers` |
| Users came but don't return | `venture:pmf` |
| At the check: expand, change or stop | `venture:review` |
| After a working slice: positioning, channels | `gtm-planner:intake`, then its later steps |

Their output is a draft. Keep only what fits one page.
