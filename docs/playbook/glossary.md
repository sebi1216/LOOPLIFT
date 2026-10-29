# Glossary

Plain words for the terms you will meet. Alphabetical within each group.

## Your PC and Windows

| Term | Meaning |
|---|---|
| **Execution policy** | A Windows safety setting that can stop PowerShell scripts like `npm` from running. You change it once for your user. |
| **LTS** | "Long-term support": the calm, stable version of a program like Node.js. Pick it over the newest one. |
| **PATH** | The list of folders Windows searches when you type a command. After an install, open a new terminal so it sees the new PATH. |
| **Port** | A numbered door on your PC that a server listens on. Only one server per port: Claude's preview uses 8081, your own server for the iPhone then takes 8082, web tests use 8099. |
| **PowerShell** | The Windows command window. Claude may use it or Git Bash; you type commands in PowerShell. |
| **WHPX** | Windows Hypervisor Platform, a Windows feature the Android emulator needs to run fast. |

## Git and GitHub

| Term | Meaning |
|---|---|
| **Branch** | A separate line of commits. Work there doesn't touch the main line until you merge it. |
| **Commit** | A saved snapshot of changes with a short message. You can always go back to it. |
| **Diff** | The list of lines added and removed by a change. Reading one with Claude is how you learn the code. |
| **main** | The main branch. In this playbook the app on `main` should always run. |
| **Merge** | Bring the commits of one branch into another, usually into `main`. Conflicts happen when both changed the same lines. |
| **PR** (pull request) | A request on GitHub to merge a branch, with the diff to read and checks to pass first. |
| **Push** | Send your new commits from the PC to GitHub. Until you push, GitHub doesn't have them. |
| **Repo** (repository) | The project folder plus its full history. One copy on your PC, one on GitHub. |
| **Tag** | A name stuck on one commit, like `good-2026-11-02`. "Go back to yesterday" = check out the tag. |
| **Template repo** | A GitHub repo marked so new repos can start as a copy of it ("Use this template"). `sebi1216/app-starter` is yours; it also carries this playbook in `docs/playbook/`. |
| **Worktree** | A second folder of the same repo on another branch, so a second Claude session can work without touching your files. |

## Checks

| Term | Meaning |
|---|---|
| **CI** (continuous integration) | GitHub runs the checks on every push, on its own computers. |
| **Done when** | One line in a spec or prompt that says how a machine can check the work is finished, for example "`npm run check` passes". |
| **Lint** | A tool (ESLint) that reads code for mistakes and messy patterns without running it. |
| **Test** | A small program that runs your code and checks the result. Tests only check what someone thought to test. |
| **Typecheck** | TypeScript (`tsc`) checks that values fit where they are used, for example no text where a number is expected. |

## App building

| Term | Meaning |
|---|---|
| **Apple Developer Program** | Apple's paid membership (99 USD a year). Needed for development builds, TestFlight and the App Store. |
| **Cast** | The fixed set of demo people and content (names, pictures, posts) used on every screen and screenshot, so they stay consistent. |
| **Component** | A reusable piece of screen, like a button or a card, used in many places. |
| **Dev server** | What `npm run start` runs: it builds the app and serves it to the browser and the phone while you work. |
| **Development build** | Your own version of "Expo Go", built for your app. Needed for native features. Needs the Apple Developer Program for iPhone. |
| **EAS** | Expo's cloud service: builds the iOS and Android apps (no Mac needed), sends them to stores, ships updates. |
| **`eas go`** | An Expo command that builds your own copy of Expo Go and puts it on your iPhone through TestFlight. A way out when the store Expo Go lags. Needs the Apple program. |
| **Environment variable** | A setting given to a program from outside the code, often in a `.env` file. |
| **Expo account** | Your login at expo.dev. Expo Go on the iPhone and the Expo CLI both need it. |
| **Expo Go** | A ready-made app from the App Store that opens your project by QR code. Supports only one SDK at a time. |
| **Lockfile** | `package-lock.json`: the exact version of every package. `npm ci` installs exactly that, so every PC gets the same. |
| **Monorepo** | One repo holding several apps or packages. Useful with two or more apps; extra weight with one. |
| **npm / npx** | npm installs packages and runs the scripts in `package.json`. npx downloads and runs a tool once. Prefer the npm scripts. |
| **Pin an SDK** | Stay on an older Expo version on purpose, for example because the store Expo Go doesn't support the new one yet. |
| **react-native-web** | Lets the same app run in a browser. Great preview on the PC, but not the real iPhone (no safe areas, other fonts, no native modules). |
| **RLS** (row level security) | Supabase database rules that decide who may read or change each row. Without them anyone with the public key reads everything. |
| **Route** | A screen's address. With Expo Router each file in `src/app/` is one route. |
| **SDK** | A version of Expo's toolkit (for example SDK 58). All Expo packages must match it. |
| **Secret** | A key or password. Never in code, chats or commits. Lives in a password manager and in the service's dashboard. Anything starting `EXPO_PUBLIC_` is NOT secret: it ships inside the app. |
| **TestFlight** | Apple's app for installing test versions of an app on an iPhone before it is in the App Store. |
| **Token (AI)** | A small piece of text the model reads or writes. Plans and limits are counted in these. Long docs cost tokens in every session. |
| **Token (design)** | A named design value, like `accent` = a colour or `space-4` = 16. Screens use names, never raw values. |
| **Tunnel** | A way for the phone to reach your PC through the internet when the Wi-Fi blocks direct contact (`npx expo start --tunnel`). Slower. |
| **UGC** (user-generated content) | Posts, videos or comments made by users. Apple requires filtering, reporting, blocking of users and published contact info. |

## Claude Code

| Term | Meaning |
|---|---|
| **Auto mode** | The default permission mode: a checker approves actions it thinks are safe. It misses some risky ones. |
| **Browser pane** | The preview window inside the Claude desktop app's Code tab. Claude can click and screenshot the web version of your app there. |
| **Cloud session** | Claude working on a copy of your repo on Anthropic's computers, not your PC. With one repository it uses the repo's CLAUDE.md, hooks and permission rules, not your plugins or personal CLAUDE.md. It ends with a branch and a PR. Safer for unattended work. |
| **Cockpit** | Where you see code (or the conversation) and the running app side by side: the Browser pane, or plain Chrome next to Claude (VS Code with F5 to read code). |
| **F5** | In VS Code: open a phone-sized Chrome on the dev server you already started (`npm run web`). |
| **`/goal`** | Tells Claude to keep working until a condition is true; a second model checks after each turn. Always add "or stop after N turns". |
| **Guard hook** | `guard.mjs`: a script that checks each shell command before it runs and blocks known dangerous ones. A seatbelt for accidents, not a wall. |
| **Harness** | Everything around the model that steers and checks it: CLAUDE.md, rules, skills, hooks, tests. You improve it when Claude repeats a mistake. |
| **Hook** | A small script Claude Code runs automatically at a moment, for example after each edit (lint) or before a command (guard). Unlike CLAUDE.md, it always runs. |
| **HQ session** | A Claude session that plans and edits only `docs/`, never code. Never open at the same time as a build session; restarted weekly. |
| **Manual mode** | Permission mode where Claude asks before every edit or command. Good for learning in week 1; not real safety, because people click yes. |
| **Marketplace** | A catalogue of plugins you install from, like `claude-plugins-official`. |
| **MCP** (Model Context Protocol) | A plug that gives Claude tools from another program, like Figma or Expo. Each server can see and do things: treat it like installed software. |
| **Permission mode** | How much Claude may do without asking: Manual, Auto, and others. Ask rules prompt in every mode. |
| **Plan mode** | Claude reads and plans but changes nothing until you say OK (Shift+Tab). |
| **Plugin** | A package of skills, hooks and MCP servers you install in one go, like the Expo plugin. |
| **Remote Control** | Continue the Claude session that is open on your PC from the Claude app on your iPhone or iPad, including its permission prompts. Not a second session. |
| **Sandbox** | A locked box that limits what commands can touch. Claude Code has none on native Windows (only macOS, Linux, WSL2). |
| **Scheduled task** | A Claude job that starts at a set time. Cloud ones run with the PC off; desktop ones need the PC on and the app open. |
| **Skill** | A saved instruction file (`SKILL.md`) Claude follows for a task, started like `/wrap-up` or picked by Claude when it fits. |
| **Subagent** | A helper Claude with its own fresh context and limited tools, for example a design reviewer that only reads. |
| **Trust dialog** | The question Claude Code asks the first time you open a folder. Until you accept, the repo's allow rules don't apply (deny rules, ask rules and hooks do). |

## Planning

| Term | Meaning |
|---|---|
| **Appetite** | No longer used since 28 Oct 2026: no hour cap or timeline ([decisions #49](decisions.md)). `docs/log.md` still records hours as a fact. Status in `now.md`: active, paused or done. |
| **Design direction** | One complete look for the app (layout idea, colours, type, mood). `/designs` makes 3, you pick one, and it becomes the tokens in code. |
| **Core loop** | The one thing a user does again and again in the app (for example: open, watch, react). Slice 1 builds only this. |
| **Gate** | Business mode only ([guide 4](guide/4-validation.md)): do strangers' actions say expand, change or stop? |
| **Layout wall** | `public/layout-wall.html`: the web app at 7 sizes side by side. Shows sizes, not platforms. |
| **Learn/Fun vs Business mode** | Picked on day 0. Learn/Fun is judged by fun and skills. Business adds the evidence track and is judged by strangers who come back. |
| **Mom Test** | A way to ask people about their real past behaviour, not about your idea, so polite answers don't fool you. |
| **Must-have** | A line in the slice card that must work for the slice to be done; at most 5. Claude may tick it only with evidence and never rewrite it. |
| **Phases** | The fixed order for every app: 1. strategy (`/kickoff`), 2. designs (`/designs`), 3. code (`/build-screen`). |
| **Preview check** | The 15-minute day-1 test of which cockpit works on your PC (Browser pane, or `npm run web` and plain Chrome). |
| **Slice** | A thin piece of the app that works end to end (one core loop). |
| **Smoke test page** | Business mode only: a simple web page that describes the app and asks for a signup, to see if strangers care. |
| **Spike** | A throwaway test of the riskiest technical piece, done first, before you build screens on top of it. |
| **Teach-back** | At wrap-up you explain in 2 to 3 sentences what changed and why; Claude asks one question. Protects your learning. |
| **Toy box** | The list in `docs/brief.md` where new ideas wait, so they don't grow the slice. One 2-hour play session a week. |
