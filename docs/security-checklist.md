# Security and legal checklist

Tick items at each gate. Claude: at /wrap-up, name the next open item of the current phase.
Honest limits: native Windows has no sandbox. The deny rules and the guard hook match text: a seatbelt against accidents, not a wall against attacks or prompt injection. The real protection is what is NOT on this PC (production secrets) and where unattended work runs (cloud sessions). Legal points are orientation only.

## A. Once per PC and accounts
- [ ] 2FA (authenticator app) on GitHub, Apple, Google, Expo, Supabase, Anthropic; recovery codes in the password manager
- [ ] All keys only in the password manager and local `.env` files, never in chats or Project docs
- [ ] Slice 1: no production secrets on this PC at all (dev keys only; rotate a key at once if it ever shows up in a chat or commit)
- [ ] Git for Windows installed; Claude Code up to date (`claude doctor` shows no errors)
- [ ] `~/.claude/settings.json`: bypass mode disabled (this repo also disables it)
- [ ] Separate Chrome profile for Claude in Chrome (no bank, mail or work logins)
- [ ] Windows device encryption or BitLocker on (E: depends on your Windows edition)
- [ ] Is this PC also a work machine with client data? If yes: separate Windows user at least

## B. Skeleton (day 1)
- [ ] Trust dialog accepted (allow rules wait for it; deny rules and hooks apply anyway); `/permissions` and `/hooks` show the rules and at least the three starter hooks (plugins may add more)
- [ ] `npm run test:hooks` passes on this PC (includes the 74-case bypass suite)
- [ ] Live test (/kickoff step 5): the tool result for `cat .env` and `git push --force --dry-run` shows "Blocked by .claude/hooks/guard.mjs". A polite refusal by Claude does not count
- [ ] Know your permission mode (week 1 suggestion: `"defaultMode": "default"` in `~/.claude/settings.json`, then auto). Prompts help you learn; they are not the safety
- [ ] `.gitignore` covers `.env`, `.env.*`, `*.p8`, `*.p12`, `*.jks`, `*.keystore`; `env.example` holds names only
- [ ] `package-lock.json` committed; CI uses `npm ci`. `npm -v` known: 11.10 or newer makes the 7-day delay in `.npmrc` work; older npm ignores it (rule 3 in CLAUDE.md is the stand-in; optional `npm install -g npm@11`, never `npm@latest`)
- [ ] `npm ci` shows yellow warnings and "N vulnerabilities": normal for Expo today. Never run `npm audit fix --force` (it would install an old Expo and break the app; the guard blocks it)
- [ ] GitHub: private repo; Dependabot alerts on, version-update PRs off; gitleaks job in CI is green
- [ ] Optional now, required before the first cloud night task: GitHub Pro (maybe free with the Student Developer Pack, verify) for a ruleset that protects `main`
- [ ] `.mcp.json` (if any) lists only known servers; you can say what each one can touch

## C. Before real data (first real table or upload)
- [ ] Two Supabase projects (dev, prod), EU region; new publishable and secret keys
- [ ] RLS and policies on every table and bucket; buckets private
- [ ] RLS tests (user A cannot read or change user B's rows) run in CI and pass
- [ ] Supabase Security Advisor: zero errors
- [ ] Supabase MCP (if used): dev project only, read-only, one project
- [ ] `docs/data-inventory.md` exists (what data, why, where, how long, which SDK)
- [ ] Backup decision written down (Supabase Free has no backups)

## D. Before other people use it (TestFlight, friends)
- [ ] Full security review of `supabase/` and `src/data/`; criticals fixed
- [ ] Break it yourself: a second account tries to read and change the first account's data, in the app and with a script using the publishable key
- [ ] User content (Apple 1.2): filtering of objectionable content, reporting with a timely response, blocking users, and published contact info all work; you know who removes bad content how fast
- [ ] Impressum and privacy policy reachable in the app (max 2 taps) and as web pages [lawyer]
- [ ] In-app account deletion that really deletes data and files
- [ ] No analytics SDK without consent; crash reports without personal data
- [ ] DPAs accepted (Supabase, Expo, crash reporting, email)
- [ ] Backups on (paid plan or a tested manual dump); one restore tried
- [ ] Breach plan: who to notify within 72 hours, which keys to rotate

## E. Before store release
- [ ] Apple App Privacy and Google Data safety filled from the data inventory and SDK list
- [ ] Age rating answered; minimum age decided; user content: filter, report, block, contact [lawyer]
- [ ] Trader status decided (address becomes public if you earn money) [lawyer]
- [ ] `npm audit --omit=dev --audit-level=high` reviewed with Claude: for each high or critical, is it in code that ships inside the app, or only in Expo's build tools (for example `@expo/cli`)? Build-tool findings: accepted risk, written in `docs/decisions.md`. Shipped-code findings: fixed by a normal Expo update (`npx expo install --fix`). Never `npm audit fix --force`
- [ ] Lawyer check: Impressum address, privacy policy, terms, UGC and DSA, minors [lawyer]
- [ ] Accenture side business and IP question cleared [lawyer]/HR; Gewerbe and VAT [tax]

## Every month (15 minutes)
- [ ] Dependabot alerts, Supabase Advisor, Claude Code update
- [ ] `git log -- .claude .mcp.json .vscode .github package.json .npmrc` reviewed; `/hooks` shows only expected hooks
