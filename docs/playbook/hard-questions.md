# Hard questions before the next project

Answer them before the next idea starts: short honest answers, or "skip" on purpose. Keep the answers next to your strategy paper so they go into `/kickoff` with it. Each question says why it matters.

**28 Oct 2026:** the questions about time caps, weekly hours, stop rules and cutting were removed (Sebastian, [decisions.md #49](decisions.md)). The product comes first; the order of work follows the biggest current problem and what is most fun.

## Why and for whom
1. **Is the next app Learn/Fun or Business, and does that fit your US period?** The modes need different rules; Clou mixed both. Clou had the rule "no business activity while in the US" (UTK until December): if Business mode starts before January, what exactly may you do from Tennessee (public signup page, store account, money), and who confirmed it? (Orientation only: ask an immigration advisor.)
2. **Business mode: which channel gives you 20 target users, with a number? Which five strangers will hold slice 1 on a real phone?** Only 17% of new subscription apps reach 1,000 USD a month in two years; the winners had an audience first. No channel, no Business mode.
3. **In one sentence: why is this app not "indistinguishable from what's already widely available"?** Apple's rule 4.3(b) (June 2026) rejects apps that are not meaningfully different, and about 560,000 new iOS apps came out in H1 2026 while downloads grew only 2 to 3%.
4. **Will users post videos, photos or comments? Who removes bad content at 2 a.m., and how fast? Under-16 users? A public home address (Impressum, Apple trader status)?** Apple rule 1.2 (June 2026) requires filtering, reporting, blocking of users and published contact info. A slice where only you post avoids most of it.

## Risk and platforms
5. **What is the one thing that could kill the idea technically, and who outside must say yes?** Clou's video engine, Strava's approval and Apple's mod rules were known by day 4 and never tested. Build and test the risky piece first, before screens sit on top of it, and ask the outside party early, in both modes.
6. **Why more than one platform in version 1? Who asked for desktop?** Every platform adds signing, stores, review and testing. Google Play alone needs 12 testers for 14 days before release.

## Money
7. **What is your monthly cap in EUR, and your rule for Pro to Max?** Costs arrive one by one: Claude, Apple 99 USD a year, EAS, Supabase Pro (about 25 USD a month once real users exist; Free has no backups). When Expo Go lags behind the SDK again, will you pay for the Apple program or wait on web and emulator? Decide now if you already know, otherwise when it happens.

## Safety and control
8. **What may Claude never do without you, even at night? What must run overnight that can't wait, and who reads the diff in the morning?** About half of agent code that passes tests is not good enough to keep. Native Windows has no sandbox; night work belongs in the cloud.
9. **Is this PC also your Accenture work machine? Are there real tokens on it (GitHub, Expo, Supabase secret keys, `ANTHROPIC_API_KEY`)?** An unsandboxed agent is a different risk on a client machine. Keys that are not on the PC can't leak: cheaper than any rule.

## Learning
10. **If you can't read the code yet, what is your proof that a feature works, and could you run and change the app without Claude for a week?** "Claude said so" is not proof: a check that ran, a screenshot and a tap on the phone are. In Anthropic's study, full delegation cost the most learning. Will you mark sessions Learn or Ship, and spend 5 minutes per wrap-up explaining the change back?
