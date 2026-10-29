# <APP NAME> brief

/kickoff fills this from your files in `docs/input/` (strategy, PowerPoints, documents, notes) or an interview. Decisions: `docs/decisions.md` (newest wins). Open questions: `docs/now.md`. Last changed: <date>

## 1. Mode and idea
- Mode: <Learn/Fun | Business>. Why: <one line>. A mode switch is written as a decision in `docs/decisions.md`.
- One sentence: <who, narrow: one sport, one group, one city> can <do what> so that <outcome>.
- Core loop: opens the app and <...> -> <...> -> gets <result>. Comes back because <reason>.

## 2. Main screens (input for /designs, at most 10)
| # | Screen | What the user does there |
|---|---|---|
| 1 | <screen of the core loop> | <...> |

## 3. Slice card: slice 1
- Order of work: 1. strategy (this brief), 2. designs (`/designs`, one direction picked), 3. code, screen by screen. No hour cap, no timeline, no stop rules: the biggest current problem and what is most fun come first.
- Targets: iPhone (always; Expo Go or development build) <+ Android | iPad | web, only if named here>. Web preview is free. Android emulator checks only if Android is a target.
- Must-haves (max 5; locked: Claude ticks them only with evidence and never edits them; the live list is in `docs/now.md`):
  - [ ] ...
- No-gos: ...
- Build risk (both modes): <hardest technical piece> · built and tested first, before the screens that sit on it · result: <works | cut | change plan>
- Permission or approval risk: <store rules (Apple 4.3(b) spam, 1.2 user content), third-party API terms, platform approvals> · how we check: <...>
- Done when (behaviour, not opinion): every screen checked-web and checked on the iPhone, and "I used it on my iPhone with my own real data on 3 different days" (data may live on the device; no backend in slice 1). Strangers come in Business mode.
- New ideas go to the toy box. A must-have changes only when I say so (logged in `docs/decisions.md`).

## 4. Toy box (ideas parked with a date)
| Date | Idea | Played with? |
|---|---|---|
| | | |

## 5. Business mode only (evidence log: `docs/evidence.md`)
- Assumptions in this order: Reach (one named channel and a number) · Want · Build.
- One check when slice 1 works on the iPhone: what did strangers do? Then expand, change or stop (my call; no hour or date trigger).
- Evidence never blocks coding. It decides growing scope (slice 2, a backend, a new platform).

## 6. Budget (EUR per month; cap: <EUR>; estimates (E), check prices before paying)
| Item | Now | Trigger for paying | Note |
|---|---|---|---|
| Claude plan | <plan> | Weekly limit hit 2 weeks in a row | `/usage` weekly |
| Apple Developer Program | 0 | First of: Business mode before outside testers; a package not in Expo Go; a store Expo Go gap. Enrol 3 days early | about 99 USD per year |
| Google Play developer account | 0 | Before the first Android test; 12 testers x 14 days closed test, start 3 weeks before release | about 25 USD once |
| Design tool (FigCraft or Figma) | 0 | Only if the free plan blocks `/designs` | check the price first |
| EAS, Supabase, domain | 0 | Free tiers first | Supabase Free has no backups |

## 7. Outside constraints (orientation only)
- <e.g. study abroad, visa or work permit rules, employer approval> · may limit: <earning money, publishing, company setup> · ask: [immigration advisor] / [lawyer] / HR

## 8. Lawyer questions (bundle them for one paid hour; orientation only)
- [ ] Impressum (§ 5 DDG) once the app or a smoke test page is public; which address [lawyer]
- [ ] Privacy policy, consent for analytics (start without analytics SDKs) [lawyer]
- [ ] User content, minors, minimum age, DSA [lawyer]
- [ ] Payments, trader status in the stores (address becomes public) [lawyer]
- [ ] Side business next to the employment contract (approval, IP clause) [lawyer]/HR
- [ ] Gewerbe, Kleinunternehmer, VAT [tax]

## 9. Not now (no-gos for the whole first version)
- ...
