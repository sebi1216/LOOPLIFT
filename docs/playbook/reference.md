# Reference: dated facts

Facts that go stale. One row, one fact, one source. "Checked on" 2026-10-28 means a review agent (or the manager) checked the source that day; v3.1 applied a second fact-check the same day. **NOT VERIFIED** means nobody could confirm it; test it yourself before you rely on it. "Tested in sandbox" means a reviewer ran it on Linux, not on Windows. (E) = estimate.

Rule for Claude: before you use a row older than 30 days for a decision, re-check the source URL and update the row (date, fact). If a source now says something else, the source wins.

Not day-1 reading. On the setup day you need only three numbers: Node 22.13+, 24.3+ or 26+; Apple Developer Program 99 USD/year (later); your Claude plan. Everything else here is for when a choice comes up.

## 1. Claude Code: surfaces and preview

| Topic | Fact | Checked on | Source |
|---|---|---|---|
| Desktop Browser pane | Code tab starts dev servers from `.claude/launch.json`; Claude can click, screenshot and read the page. Windows: Ctrl+Shift+B or **Browser** in the session title bar | 2026-10-28 | https://code.claude.com/docs/en/desktop.md |
| launch.json fields | `configurations`, `name`, `runtimeExecutable`, `runtimeArgs`, `program`, `args`, `cwd`, `port`, `autoPort`, `url`, `env`; `version` and top-level `autoVerify` appear in the examples, not the field table | 2026-10-28 | https://code.claude.com/docs/en/desktop.md |
| Port clash | With the port in `runtimeArgs`, Desktop moves to the next free port; `"autoPort": false` fails with an error instead. A port hard-coded in an npm script but not in `runtimeArgs` "stays stopped" (the starter passes `--port 8081`, so it is fine) | 2026-10-28 | https://code.claude.com/docs/en/desktop.md |
| Auto-verify | On by default: Claude screenshots and checks after edits (costs tokens). `"autoVerify": false` or the Browser pane menu turns it off | 2026-10-28 | https://code.claude.com/docs/en/desktop.md |
| Browser pane on native Windows | Whether Desktop starts `npm` (`npm.cmd`) directly, and whether its server shows a QR code | **NOT VERIFIED** | day-0 preview check decides |
| Browser pane device sizes | No viewport presets documented; use the layout wall | **NOT VERIFIED** | https://code.claude.com/docs/en/desktop.md |
| Desktop and PATH | Desktop does not read PowerShell profiles; set PATH in Windows user or system variables, then quit and reopen the app | 2026-10-28 | https://code.claude.com/docs/en/desktop.md |
| iOS Simulator pane | Mac with Xcode only (not re-fetched in the second check) | 2026-10-28 | https://code.claude.com/docs/en/desktop-ios-simulator.md |
| Claude in Chrome | Browser extension for logged-in websites; not the same as the Desktop Browser pane | 2026-10-28 | https://code.claude.com/docs/en/chrome.md |
| Install on Windows | `irm https://claude.ai/install.ps1 \| iex`, then open a **new** terminal and run `claude --version`. winget does not auto-update unless `CLAUDE_CODE_PACKAGE_MANAGER_AUTO_UPDATE=1`; a winget upgrade can fail while Claude runs (file lock). `claude doctor` prints read-only diagnostics incl. settings errors | 2026-10-28 | https://code.claude.com/docs/en/setup.md |
| Git for Windows | Optional since spring 2026 (without it, shell-form hooks run in PowerShell), but the setup page now calls it "recommended" so Claude can use the Bash tool. The Monitor tool exists on Windows only with Git Bash | 2026-10-28 | https://code.claude.com/docs/en/whats-new/2026-w18.md, https://code.claude.com/docs/en/setup.md, https://code.claude.com/docs/en/hooks.md |
| Primary shell on Windows | Since Week 18 (Apr 2026), when the PowerShell tool is on it is the primary shell, even with Git Bash installed; on by default for claude.ai accounts. Write rules for both | 2026-10-28 | https://code.claude.com/docs/en/whats-new/2026-w18.md, https://code.claude.com/docs/en/tools-reference.md |
| Statusline | `/statusline` writes a script for the bottom line (context %, cost); PowerShell examples exist | 2026-10-28 | https://code.claude.com/docs/en/statusline.md |
| Tool changes under you | Three silent changes made Claude Code worse from 4 Mar to 16 Apr 2026 (resolved 20 Apr, v2.1.116); many releases a week. Log `claude --version`, model and effort | 2026-10-28 | https://www.anthropic.com/engineering/april-23-postmortem |

## 2. Claude Code: unattended, background and remote work

| Topic | Fact | Checked on | Source |
|---|---|---|---|
| Cloud scheduled tasks (formerly routines) | Research preview; Pro, Max, Team, Enterprise; `/schedule` creates them from the CLI. Run in Anthropic's cloud with the PC off; fresh clone; start in auto mode; minimum interval 1 hour. They push to a `claude/` branch **unless the prompt directs another branch**; the only hard control named is branch protection or rulesets (GitHub Pro for private repos). So the night prompt says "push only to `night/<date>`, never `main`" | 2026-10-28 | https://code.claude.com/docs/en/routines.md, https://code.claude.com/docs/en/scheduled-tasks.md |
| Desktop scheduled tasks | Run only while the app is open and the PC awake (Desktop 1.1.5368+); missed runs catch up once within 7 days; Worktree checkbox; a run in Manual mode stalls at the first prompt. Not recommended for unattended work on the unsandboxed PC | 2026-10-28 | https://code.claude.com/docs/en/desktop-scheduled-tasks.md |
| `/loop` | Repeats in an open session; expires after 7 days; fires while the session is idle and resends the full context, so it costs usage | 2026-10-28 | https://code.claude.com/docs/en/scheduled-tasks.md, https://code.claude.com/docs/en/costs.md |
| What a cloud session gets | With **one** repository: repo `CLAUDE.md`, `.claude/rules`, skills, agents, commands, `.mcp.json`, and the repo's hooks and permission rules: **yes**. Plugins enabled in repo settings (`enabledPlugins`), your `~/.claude/CLAUDE.md`, user skills, agents, settings and hooks: **no**. Several repositories: no repo hooks. A Projects cloud thread is different: `CLAUDE.md` and `.claude/rules` only, no hooks or permission rules. So the repo itself must carry the knowledge (CLAUDE.md, AGENTS.md, docs) | 2026-10-28 | https://code.claude.com/docs/en/cloud-environments.md, https://code.claude.com/docs/en/claude-projects.md |
| Cloud isolation | Cloud sessions run in isolated Anthropic VMs. The security page says pushes are "restricted to the current working branch"; the scheduled-tasks page says a prompt can direct another branch. The pages differ: rely on branch protection, not on either sentence | 2026-10-28 | https://code.claude.com/docs/en/security.md, https://code.claude.com/docs/en/routines.md |
| `/goal <condition>` | A separate small model checks the condition after each turn; it reads only what Claude showed, cannot run commands. Write a condition the output can prove and add "or stop after N turns" | 2026-10-28 | https://code.claude.com/docs/en/goal.md |
| Agent view, `--bg` | `claude agents`, `claude --bg "<prompt>"`, `/bg`, `/fork`. Research preview. Background sessions get their own worktree, push their branch, never main. Exception: a session moved to the background with `/bg` keeps editing where it was | 2026-10-28 | https://code.claude.com/docs/en/agent-view.md |
| Remote Control | `/remote-control` (`/rc`): continue a session on your PC from iPhone or iPad. Files stay local; PC awake and `claude` running; Pro, Max, Team, Enterprise (not with API keys). Permission prompts are forwarded to the phone and stay open until answered; push notification when an action is required. It continues the open session; it is not a second writer | 2026-10-28 | https://code.claude.com/docs/en/remote-control.md |
| Worktrees | `claude --worktree <name>` makes `.claude/worktrees/<name>/` on branch `worktree-<name>`; `.env` not copied unless in `.worktreeinclude`; base = remote default branch unless `worktree.baseRef` is `"head"`. Desktop toggle off by default | 2026-10-28 | https://code.claude.com/docs/en/worktrees.md |
| Checkpoints | Esc Esc or `/rewind`; last 100 prompts, about 30 days (not re-fetched in the second check); no undo of `rm`/`mv`; not a git replacement | 2026-10-28 | https://code.claude.com/docs/en/checkpointing.md |

## 3. Claude Code: permissions and safety

| Topic | Fact | Checked on | Source |
|---|---|---|---|
| Default start mode | Since v2.1.283 **auto mode** is the start mode in terminal and VS Code, on all plans incl. Pro (`claude -p` and the SDK start in Manual, v2.1.302+). Classifier blocks curl-pipe-bash, force push, `git reset --hard`, production deploys and migrations; allows pushes to any branch, including the default branch (`main`). Pauses after 3 blocks in a row or 20 in total (not configurable) | 2026-10-28 | https://code.claude.com/docs/en/permission-modes.md |
| Manual for learning | `"permissions": {"defaultMode": "default"}` in `~/.claude/settings.json` (user level). `auto` or `bypassPermissions` in a project file are ignored. The Desktop mode selector is remembered per folder and wins over `defaultMode`: set it there too. Desktop's own default with no setting: **NOT VERIFIED** | 2026-10-28 | https://code.claude.com/docs/en/permission-modes.md |
| Auto mode accuracy | Anthropic's own number (n = 52, post of 25 Mar 2026): the pipeline misses about 17% of real "overeager" dangerous actions; false positives 0.4% | 2026-10-28 | https://www.anthropic.com/engineering/claude-code-auto-mode |
| Prompts are weak safety | Users approved about 93% of permission prompts; enforced boundaries work better | 2026-10-28 | https://www.anthropic.com/engineering/how-we-contain-claude |
| `ask` and `deny` | Ask rules prompt in every mode, even bypass. Deny rules still block in bypass. `disableBypassPermissionsMode: "disable"` works from any settings file | 2026-10-28 | https://code.claude.com/docs/en/permission-modes.md |
| Deny-rule limits | Bash rules match command text only (`git -C . push` slips past `Bash(git push *)`). "Isn't a security boundary". `Read` deny does not cover `grep -r pattern .` or a Node script; `grep` and `echo` run without a prompt | 2026-10-28 | https://code.claude.com/docs/en/permissions.md |
| Wildcard trap | `Bash(git fetch*)` also matches `git fetchX`; use `Bash(git status *)` style. `git fetch --upload-pack=...` ran a command and `npm run env` printed a secret (tested in sandbox) | 2026-10-28 | https://code.claude.com/docs/en/permissions.md, tested in sandbox (engineering review) |
| Guard hook reality | Text matching lets creative bypasses through; against the v2 guard `git push -fu` force-pushed. Current result: see the starter's test output (`npm run test:hooks`). The v3.1 guard also blocks credential printers by text (`gh auth token`, `gh auth status --show-token`, `git credential fill`, `cmdkey /list`) and, as a known false positive, any command text that mentions `.env` (for example a commit message). A seatbelt against accidents, not a wall against attacks | 2026-10-28 | tested in sandbox (engineering and walkthrough reviews); https://code.claude.com/docs/en/permissions.md |
| `.env` patterns | `Read(.env)` = `Read(**/.env)`; `./.env` = current folder only; `Read(!.env.example)` carves out an exception, but only for rules from the same settings source | 2026-10-28 | https://code.claude.com/docs/en/permissions.md |
| PowerShell rules | `PowerShell(...)` rules exist; aliases are canonicalised (docs example: `Get-ChildItem` also matches `gci`, `ls`, `dir`). With Git Bash installed, a scoped Bash deny rule with no matching PowerShell rule turns the PowerShell tool off: keep them in pairs | 2026-10-28 | https://code.claude.com/docs/en/permissions.md, https://code.claude.com/docs/en/tools-reference.md |
| Project trust | Project **allow** rules wait until you trust the folder. Deny and ask rules apply anyway, and hooks do **not** wait: they run even when only a parent folder is trusted, and in `claude -p` | 2026-10-28 | https://code.claude.com/docs/en/permissions.md |
| Sandbox | OS sandbox only on macOS, Linux, WSL2; covers Bash, PowerShell, Monitor; hooks and MCP run outside it. Native Windows runs commands unsandboxed | 2026-10-28 | https://code.claude.com/docs/en/sandboxing.md |
| Hooks on Windows | Exec form (`"command": "node", "args": [...]`); `.cmd` shims can't start in exec form. A timed-out PreToolUse hook does **not** block unless `"onFailure": "block"` (v2.1.295+). Exit 2 or JSON deny blocks. `claude doctor` accepts `"onFailure": "block"` and reports other values as invalid (tested v2.1.312, Linux, 28 Oct 2026). `${CLAUDE_PROJECT_DIR}` in `args` is valid but does not follow Claude into a worktree | 2026-10-28 | https://code.claude.com/docs/en/hooks.md, https://code.claude.com/docs/en/worktrees.md, tested in sandbox (walkthrough) |
| Hook matcher | Hooks match by tool name: `Bash\|PowerShell` misses the Monitor tool, which runs shell commands under Bash rules (on Windows Monitor exists only with Git Bash). The docs advise only `Bash\|PowerShell`; the starter adds `Monitor` | 2026-10-28 | https://code.claude.com/docs/en/tools-reference.md |
| Hook events | 33 events incl. `PostToolBatch` (after a batch of parallel tool calls, no matcher), `PermissionDenied`, `WorktreeCreate` | 2026-10-28 | https://code.claude.com/docs/en/hooks.md |
| Protected paths | Writes to `.git`, `.claude`, `.vscode`, `.mcp.json`, `.npmrc` are never auto-approved (except bypass). `.github/` is not protected. Does not stop an npm package | 2026-10-28 | https://code.claude.com/docs/en/permission-modes.md |
| Personal settings file | `machine/user-settings.json`, copied to `~/.claude/settings.json`: `"defaultMode": "default"` = Manual mode for week 1 (Claude asks before each edit or command; learning, not safety), then `"auto"`. `disableBypassPermissionsMode` = nothing can switch on "bypass all permissions". `ask` for `git push` = you approve every push, in every mode. `deny` = Claude's file tools can't read credential folders or `.env` files; force push, `git reset --hard` and credential printers are blocked. All of it matches text: it catches mistakes, not a determined bypass | suggestion | (this playbook), https://code.claude.com/docs/en/permissions.md |
| gh token on Windows | `gh auth login` stores the token in the system credential store by default, so a `Read(~/.config/gh/**)` deny rule does not protect it; `gh auth token` prints it. The guard and the personal settings block credential printers by text (best effort) | 2026-10-28 | https://cli.github.com/manual/gh_auth_login |
| Subagents | Bash in a subagent "isn't strictly read-only" (not re-fetched in the second check); it inherits acceptEdits or auto mode. Set `tools`, `model`, `maxTurns` | 2026-10-28 | https://code.claude.com/docs/en/sub-agents.md |

## 4. Claude Code: context, commands, plugins

| Topic | Fact | Checked on | Source |
|---|---|---|---|
| CLAUDE.md | Target under 200 lines; imports do not reduce cost; reads AGENTS.md only via `@AGENTS.md` when CLAUDE.md exists (v2.1.277+) | 2026-10-28 | https://code.claude.com/docs/en/memory.md |
| Auto memory | On by default, machine-local; first 200 lines or 25 KB load each session; check in `/memory` | 2026-10-28 | https://code.claude.com/docs/en/memory.md |
| Output styles | Default, Proactive, Concise, Explanatory, Learning (case-sensitive in JSON). Explanatory and Learning use more tokens | 2026-10-28 | https://code.claude.com/docs/en/output-styles.md |
| Review | `/code-review` (alias `/review`), `--fix`; `ultra` runs in the cloud. It reviews for **correctness** bugs; depending on model and effort it also covers cleanup. Duplication and reuse of existing helpers is what `/simplify` covers. `/security-review` compares with **origin's** default branch (needs an `origin` remote), so run it before you push. A synced plugin skill `code-review@synced` ("review a pull request") may answer instead: check `/help` once; without a PR, ask it to review the unpushed commits on `main` | 2026-10-28 | https://code.claude.com/docs/en/commands.md |
| Ultrareview | Cloud multi-agent review; 3 free runs once per account (Pro, Max), then about 5 to 25 USD each with usage credits turned on | 2026-10-28 | https://code.claude.com/docs/en/ultrareview.md |
| `/usage` | Plan usage broken down by skill, subagent, plugin, MCP; press `f` to apply fix suggestions (v2.1.305+; hidden while Remote Control is connected). `/cost`, `/stats` are aliases | 2026-10-28 | https://code.claude.com/docs/en/costs.md |
| Other commands | `/plan`, `/context`, `/simplify`, `/verify`, `/powerup`, `/fewer-permission-prompts`, `/doctor`, `/clear`, `/rename`. `/verify` is a bundled skill that infers the launch from `package.json`; with Expo: **NOT VERIFIED** | 2026-10-28 | https://code.claude.com/docs/en/commands.md |
| Skills | `disable-model-invocation: true` = only you can start it (use for side-effect skills). Description + `when_to_use` cut at 1,536 characters | 2026-10-28 | https://code.claude.com/docs/en/skills.md |
| `/skill-doctor` | Shows what each skill costs and how often it is used (v2.1.252+, needs feature-flag fetching); flags never-used skills | 2026-10-28 | https://code.claude.com/docs/en/skills.md |
| Plugin install | `claude plugin install expo@claude-plugins-official --scope local`: writes the git-ignored `settings.local.json`, so the repo stays clean. `--scope project` rewrites `.claude/settings.json` (keys reordered, about 150-line diff, tested in sandbox): use it only to share a plugin with others. On a PC with no interactive session yet: `claude plugin marketplace add anthropics/claude-plugins-official` first. One step in a session: `/plugin install <name> --marketplace owner/repo` (v2.1.275+) | 2026-10-28 | https://code.claude.com/docs/en/plugins/install.md |
| Plugin in repo | `enabledPlugins` in `.claude/settings.json` turns it on but does not download it: each PC installs once. Cloud sessions skip it | 2026-10-28 | https://code.claude.com/docs/en/plugins/install.md |
| Plugin token cost | `claude plugin details <name>`: the `Always-on` line = tokens added to every session. The `/plugin` details pane shows "Every turn" and "When invoked" for official plugins, but only when opened via the marketplace name, not from Discover | 2026-10-28 | https://code.claude.com/docs/en/plugins/install.md |
| Plugin sync | Plugins on your claude.ai account appear as `<name>@synced` (v2.1.273+); check `claude plugin list` before installing. If a machine install has the same name, the CLI says the synced one is "not loaded" and the local one "takes precedence": same plugin, fine. Official marketplace auto-updates by default | 2026-10-28 | https://code.claude.com/docs/en/plugins/install.md |
| Plugin trust | A marketplace listing is not a code review; plugins run hooks and MCP servers with your rights | 2026-10-28 | https://code.claude.com/docs/en/plugins/security.md |

## 5. Claude plans and cost

| Topic | Fact | Checked on | Source |
|---|---|---|---|
| Pro | 20 USD/month, or 17 USD/month billed yearly (200 USD); excl. tax; includes Claude Code. The page shows no EUR prices | 2026-10-28 | https://claude.com/pricing |
| Max | From 100 USD/month (5x Pro per 5-hour window); a 20x tier exists (price not shown on the page) | 2026-10-28 | https://claude.com/pricing |
| Limits | One usage pool shared by claude.ai, Claude Code and Desktop (extra-usage article); Claude Design shares it too (Claude Design help page). After a limit, Pro and Max can buy usage credits at standard API rates with a monthly spend limit: set the limit first. 5-hour plus weekly windows are stated on the costs page for Team/Enterprise seats; assume the same for Pro (E) | 2026-10-28 | https://support.claude.com/en/articles/12429409-extra-usage-for-paid-claude-plans, https://support.claude.com/en/articles/14604416-get-started-with-claude-design, https://code.claude.com/docs/en/costs.md |
| `ANTHROPIC_API_KEY` pitfall | If this variable is set on the PC, Claude Code bills API rates instead of your subscription | 2026-10-28 | https://support.claude.com/en/articles/11145838 |
| Quiet spenders | Long sessions and cache misses after breaks, `/loop`, `/goal` check-ins, cross-session messages, subagents, workflows, agent teams (about 7x for teammates in plan mode, otherwise "significantly more"), compaction | 2026-10-28 | https://code.claude.com/docs/en/costs.md |
| API-rate benchmark | Enterprise average about 13 USD per developer per active day, 150 to 250 USD/month | 2026-10-28 | https://code.claude.com/docs/en/costs.md |
| Projects cloud threads | Default Opus at high effort; use limits faster | 2026-10-28 | https://code.claude.com/docs/en/claude-projects.md |

## 6. claude.ai Projects

| Topic | Fact | Checked on | Source |
|---|---|---|---|
| Plain claude.ai Project | Chat Project with files; fine as scratch paper and thinking partner | 2026-10-28 (not re-fetched) | https://support.claude.com/en/articles/10167454-using-the-github-integration |
| GitHub sync | You pick files of one branch; **manual** ("Sync now"); read-only; no history | 2026-10-28 (not re-fetched) | https://support.claude.com/en/articles/10167454-using-the-github-integration |
| Redesigned Projects | A **Claude Code** beta (Pro/Max, announced 17 Sep 2026, rolling out; not on Team/Enterprise yet): a coordinator that starts cloud threads. Not the same as a claude.ai chat Project | 2026-10-28 | https://code.claude.com/docs/en/claude-projects.md, https://claude.com/resources/articles/projects-redesigned |
| Cloud threads | New branch each, can open PRs; load `CLAUDE.md` and `.claude/rules` but not repo skills, settings, hooks, permission rules or `.mcp.json`. Never use one for a night task | 2026-10-28 | https://code.claude.com/docs/en/claude-projects.md |
| Local threads | Run on your PC via Remote Control (desktop app open, v2.1.280+) | 2026-10-28 | https://code.claude.com/docs/en/claude-projects.md |

## 7. Expo

| Topic | Fact | Checked on | Source |
|---|---|---|---|
| Store Expo Go today | App Store Expo Go **58.0.5** "adds support for SDK 58" (listing showed it "5d ago" on 28 Oct, so about 23 Oct). Google Play listing updated 19 Oct 2026: **NOT VERIFIED** | 2026-10-28 | https://apps.apple.com/us/app/expo-go/id982107779, https://play.google.com/store/apps/details?id=host.exp.exponent |
| How to check | 1. App Store listing "What's New" (trust it). 2. Expo changelog. expo.dev/go shows the newest SDK, not the store app's. Expo's troubleshooting page still said "App Store stops at SDK 54" (stale) | 2026-10-28 | https://expo.dev/changelog, https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/ |
| Expo Go lag pattern | 2026: in May, SDK 56 was only in a TestFlight beta and the simulator, and SDK 55 waited for Apple; that 56 never reached the App Store is not confirmed by a later page (E). SDK 57 came 3 Sep, with login; SDK 58 about 8 days (E). Expo calls Expo Go "an educational tool". About 3 SDKs a year, so SDK 59 around early 2027 (E): if the store app moves ahead of the project mid-slice, see troubleshooting | 2026-10-28 | https://expo.dev/changelog/expo-go-and-app-store-may-2026, https://expo.dev/changelog/expo-go-57-login |
| Expo Go login | iOS: logged in to **both** Expo CLI (`npx expo login`) and the app | 2026-10-28 | https://expo.dev/changelog/expo-go-57-login |
| SDK 58 | Stable 15 Oct 2026; RN 0.88; native tabs and data loaders stable; new tunnel without ngrok (needs `npx expo login`); `@expo/agent-cli` (experimental: `status`, `smoke`); `expo-device-hub`. npm `expo` latest 58.0.20 | 2026-10-28 | https://expo.dev/changelog/sdk-58 |
| Node | Node 22.13+, 24.3+ or 26+; odd versions unsupported | 2026-10-28 | https://expo.dev/changelog/sdk-58 |
| New Architecture | Mandatory since SDK 55 (E: not confirmed on a primary page in the second check); legacy-only libraries are out | 2026-10-28 | https://docs.expo.dev/guides/new-architecture.md |
| Expo Router | No longer depends on React Navigation since SDK 56 (`@react-navigation/*` imports may break; Expo recommends its codemod) | 2026-10-28 | https://expo.dev/changelog/sdk-56 |
| React Compiler | On in the template; no `useMemo`/`useCallback` by habit | 2026-10-28 | https://docs.expo.dev/guides/react-compiler/ |
| Native tabs | `expo-router/native-tabs` stable from SDK 58 (SDK 54 to 57: `expo-router/unstable-native-tabs`); iOS 26+ ignores background/blur props; Android max 5 tabs | 2026-10-28 | https://docs.expo.dev/router/advanced/native-tabs/ |
| Expo Agent shut down | Expo's own AI app builder closed after 31 Jul 2026; Expo now points to "Claude Code or Codex" plus the Expo MCP server and skills | 2026-10-28 | https://expo.dev/changelog/expo-agent-ending-the-closed-beta-and-winding-the-project-down |
| Expo with agents | Expo's guide: `create-expo-app`, `claude plugin install expo@claude-plugins-official`, `/mcp` to sign in, commit `AGENTS.md` | 2026-10-28 | https://docs.expo.dev/agents.md |
| Expo plugin | 23 skills (16 expo, 7 eas) plus the Expo MCP server. The skills page gives no MCP URL and no token figure: measure the always-on cost with `claude plugin details expo` | 2026-10-28 | https://docs.expo.dev/skills/ |
| Expo connector in Claude | Expo MCP in Claude's connector directory since 13 Aug 2026 (builds, TestFlight, crashes, reviews; works from the phone). Plugin + connector = Expo twice: keep the plugin in Claude Code, the connector for claude.ai and phone | 2026-10-28 | https://expo.dev/changelog/connect-expo-in-claude.md |
| Expo MCP plan | Free plan since 26 May 2026, "fair use". MCP page says `search_documentation` needs a paid plan, but it answered on Sebastian's account: low-stakes conflict, still on the docs | 2026-10-28 | https://expo.dev/changelog/the-expo-mcp-server-is-now-available-on-the-free-plan, https://docs.expo.dev/mcp.md |
| Expo MCP local taps | iOS local capabilities need macOS. Android emulator on Windows: **NOT VERIFIED** (not documented) | 2026-10-28 | https://docs.expo.dev/mcp.md |
| EAS Build | Free: 15 iOS + 15 Android builds/month, low priority, 45 min timeout. Starter 19 USD/month | 2026-10-28 | https://expo.dev/pricing |
| EAS Observe | Performance, errors, native crashes; GA 20 Aug 2026 (date not re-checked); Free plan 100K events/month | 2026-10-28 | https://expo.dev/changelog, https://expo.dev/pricing |
| Expo Launch | Paste a GitHub repo, sign in with Apple, it builds and submits to TestFlight; Play "coming soon"; no price shown | 2026-10-28 | https://expo.dev/services/launch |
| Dev builds, `eas go` | Need the Apple Developer Program. A newly registered device on a new or renewed membership can take 24 to 72 h before it can be in a build: enrol 3 days early | 2026-10-28 | https://docs.expo.dev/tutorial/eas/ios-development-build-for-devices/ |
| Env vars | Every `EXPO_PUBLIC_` value is plain text in the built app | 2026-10-28 | https://docs.expo.dev/guides/environment-variables/ |
| Windows long paths | "Filename longer than 260 characters" only in **local** Android builds; keep the project in a short path like `C:\DEV\app` | 2026-10-28 | https://docs.expo.dev/troubleshooting/windows-long-paths/ |
| Android emulator setup | JDK 17, Android SDK Platform 36; `ANDROID_HOME` and platform-tools in Windows **user variables** | 2026-10-28 | https://docs.expo.dev/workflow/android-studio-emulator/ |

## 8. Testing on Windows: iPhone, Android, web

| Topic | Fact | Checked on | Source |
|---|---|---|---|
| iPhone without a Mac | Real iPhone + Expo Go (free) or a development build (Apple 99 USD/year). Apple's free account ("Personal Team") needs Xcode, so not usable on Windows | 2026-10-28 | https://developer.apple.com/support/compare-memberships/ |
| Cloud simulators (EAS Simulator) | **Sources conflict.** Docs: "only to select partners". Pricing: Starter+ "60 min/month until 2027", Free "coming soon", now also "limited beta" with a waitlist in batches and sessions up to 115 min. Expo skill: "rolling out". Don't plan on it. A `simulator:availability` command is not on the intro page: **NOT VERIFIED** | 2026-10-28 | https://docs.expo.dev/preview/simulators/introduction/, https://expo.dev/pricing |
| Argent Cloud | Hosted iOS simulators for agents: 299 USD per runner per month | 2026-10-28 | https://argent.swmansion.com/cloud/ |
| Appetize | 30 free min/month, sessions max 3 min; Starter 59 USD/month, or 708 USD a year | 2026-10-28 | https://appetize.io/pricing |
| Cloud Mac | AWS EC2 Mac: 24-hour minimum. MacinCloud price **NOT VERIFIED** | 2026-10-28 | https://aws.amazon.com/ec2/instance-types/mac/faqs/ |
| Argent (local) | Software Mansion, free MCP: lets Claude tap and screenshot the emulator. Windows host: **NOT VERIFIED** | 2026-10-28 | https://docs.expo.dev/agents/argent/ |
| agent-device | Callstack, MIT, Node 22.12+: screenshots, taps, logs. Windows host: **NOT VERIFIED** (worth one 30-minute test) | 2026-10-28 | https://docs.expo.dev/agents/agent-device.md |
| Maestro | Studio runs on Windows; CLI "Windows (WSL)" plus a Windows guide; Java 17+. Maestro MCP on Windows: **NOT VERIFIED** | 2026-10-28 | https://github.com/mobile-dev-inc/maestro |
| EAS Workflows + Maestro | Cloud iOS-simulator and Android tests on each PR, no Mac. Later, before outside testers | 2026-10-28 | https://docs.expo.dev/eas/workflows/examples/e2e-tests/ |
| Android emulator | Needs WHPX (Windows Hypervisor Platform); old AEHD driver ends 31 Dec 2026 | 2026-10-28 | https://developer.android.com/studio/run/emulator-acceleration |
| react-native-web gaps | Missing `Alert`, `RefreshControl`; `StatusBar`, `KeyboardAvoidingView` mocked; no native Animated driver; safe-area insets are 0 | 2026-10-28 | https://necolas.github.io/react-native-web/docs/react-native-compatibility/ |
| Device sizes | iPhone 16 393x852; 16e 390x844 (E); 17 402x874 (E); Pixel 412 wide (E) | **NOT VERIFIED** (E) | Apple and Google spec pages |

## 9. App stores

| Topic | Fact | Checked on | Source |
|---|---|---|---|
| Apple 4.3(b) spam (June 2026) | "Don't submit apps that are indistinguishable from what's already widely available." Removal clause covers only the named saturated categories (dating, flashlight, sound effects, wallpaper, simple timers, fortune telling): Apple "may remove these apps" if they are not updated, improved or do not attract customers. Not all apps; no warning in the text | 2026-10-28 | https://developer.apple.com/app-store/review/guidelines/ |
| Apple 1.2 UGC (June 2026) | Apps with user-generated content need: **filtering** of objectionable material, **reporting** with a timely response, **blocking** of abusive users, and **published contact info** | 2026-10-28 | https://developer.apple.com/app-store/review/guidelines/, https://www.macrumors.com/2026/06/09/app-store-guidelines-low-quality-apps/ |
| Apple review 2025 | 9.1 million submissions reviewed, about 2.1 million (23%) rejected; "Performance" (crashes, incomplete) the top reason (1.35 million) | 2026-10-28 | https://apple.com/legal/app-store/transparency/2025 |
| Apple vs builder apps | Apple blocked or pulled Replit, Vibecode, Anything apps (code that runs after review). Affects the tools, not apps built with them | 2026-10-28 | https://aiweekly.co/alerts/apple-cracks-down-on-vibecoding-apps-as-app-store-submissions-surge |
| Apple Developer Program | 99 USD/year (about 99 EUR in DE (E)) | 2026-10-28 | https://developer.apple.com/programs/ |
| Google Play account | 25 USD once plus ID check | 2026-10-28 | https://support.google.com/googleplay/android-developer/answer/6112435?hl=en |
| Google Play testing | Personal accounts created after 13 Nov 2023: closed test with **12 testers opted in for 14 days in a row** before production. Start about 3 weeks before an Android release (E) | 2026-10-28 | https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB |
| Google Play target API | From 31 Aug 2026 new apps and updates must target API 36 (extension to 1 Nov 2026 on request). User data sent to third-party AI models falls under User Data rules: secondary source only | 2026-10-28 | https://developer.android.com/google/play/requirements/target-sdk, https://dev.to/mr_manushukla/google-plays-july-2026-policy-update-5-changes-to-ship-before-the-31-august-deadline-3bie |

## 10. Evidence numbers (why the rules exist)

| Topic | Fact | Checked on | Source |
|---|---|---|---|
| METR 2025 | 16 experienced developers: 19% **slower** with AI, but believed 20% faster (not re-fetched in the second check (E)) | 2026-10-28 | https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ |
| METR 2026 | Follow-up: about 18% faster only for the 10 returning developers (CI -38% to +9%); newly recruited developers about 4% (CI -15% to +9%). Both intervals cross zero; METR calls it "very weak evidence" | 2026-10-28 | https://metr.org/blog/2026-02-24-uplift-update/ |
| METR merge study | About half of test-passing agent PRs would not be merged by maintainers (296 PRs, 4 maintainers, 3 repos) | 2026-10-28 | https://metr.org/notes/2026-03-10-many-swe-bench-passing-prs-would-not-be-merged-into-main/ |
| Veracode 2026 | Only 55% of generated code secure; flat across model sizes and generations | 2026-10-28 | https://www.veracode.com/?p=28620 |
| GitClear 2026 | Duplicated code blocks +81% vs 2023; refactoring down about 71% vs 2023 (correlational, vendor) | 2026-10-28 | https://www.gitclear.com/the_ai_code_quality_maintainability_gap |
| CodeRabbit 2025 | AI PRs 1.7x more issues; readability 3x worse (vendor) | 2026-10-28 | https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report |
| Anthropic RCT 2026 | Quiz 50% (AI) vs 67% (by hand); full delegation 39%; asking conceptual questions 65%; letting AI debug 24% | 2026-10-28 | https://www.anthropic.com/research/AI-assistance-coding-skills |
| Teach-back study | Maintenance without AI: 77% of unrestricted AI users failed vs 39% of those who had to explain the code first (N = 78, single-author preprint, not peer reviewed (E)) | 2026-10-28 | https://arxiv.org/abs/2602.20206 |
| DORA 2025 | AI amplifies what a team already does; small batches, strong version control and user focus raise the benefit (not re-fetched in the second check) | 2026-10-28 | https://cloud.google.com/blog/products/ai-machine-learning/introducing-doras-inaugural-ai-capabilities-model |
| App flood | About 560,000 new iOS apps in H1 2026, while downloads grew 3% in 2025 and 2% in 2026 (Sensor Tower via NYT, reported by TechSpot, 20 Jul 2026) | 2026-10-28 | https://www.techspot.com/news/113213-apple-app-store-inundated-low-quality-vibecoded-apps.html |
| RevenueCat 2026 | 17% of new subscription apps reach 1,000 USD/month within 2 years (down from 19%); average about 72 USD/month after 1 year | 2026-10-28 | https://revenuecat.com/sosa-26-insights/ |
| Long agent builds | Anthropic's harness builds: about 125 USD (audio app) to 200 USD (game) per app, still missed layout and feel | 2026-10-28 | https://www.anthropic.com/engineering/harness-design-long-running-apps |

## 11. Design tools

| Topic | Fact | Checked on | Source |
|---|---|---|---|
| Figma seats | Full seat (to design): 16 EUR/month yearly, 20 monthly. Dev seat (inspect only): 12 / 15 EUR | 2026-10-28 | https://help.figma.com/hc/en-us/articles/27468498501527 |
| Figma MCP limits | Starter, View, Collab: 20 calls/month. Professional (and Education) Full/Dev: 200/day, 10/min | 2026-10-28 | https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/ |
| Figma Education | Free Professional, but startups don't qualify | 2026-10-28 | https://help.figma.com/hc/en-us/articles/360041061214-verify-your-education-status |
| Code Connect | Supports React Native; Dev or Full seat on Professional+ | 2026-10-28 | https://developers.figma.com/docs/code-connect |
| Figma Variables API | REST access needs Enterprise | 2026-10-28 | https://developers.figma.com/docs/rest-api/variables/ |
| Claude Design | Inside claude.ai on all plans incl. Free; hands off to Claude Code; shares usage; output is web code (export also as standalone HTML, zip, PDF, PPTX). `/design` (v2.1.265+), `/design-sync` exist in Claude Code | 2026-10-28 | https://support.claude.com/en/articles/14604416-get-started-with-claude-design |
| Claude Design standalone | Official support page: "The standalone version at claude.ai/design closes on December 14, 2026." Export or move design systems before then | 2026-10-28 | https://support.claude.com/en/articles/14604416-get-started-with-claude-design |
| FigCraft | Status, maintainer, MCP flags | **NOT VERIFIED** | no primary source; Clou experience only |

## 12. UI libraries

| Topic | Fact | Checked on | Source |
|---|---|---|---|
| Uniwind | 1.13.0 (19 Oct 2026); free version MIT, Tailwind v4 (npm and docs). Expo Go support and "Pro needs a dev build": **NOT VERIFIED** on the docs index page | 2026-10-28 | https://docs.uniwind.dev/index.md |
| React Native Reusables | Copy-in components; site says "Nativewind or Uniwind", README only NativeWind: test Uniwind in a throwaway | 2026-10-28 | https://www.reactnativereusables.com |
| @expo/ui | SwiftUI / Jetpack Compose controls; stable since SDK 56; web experimental | 2026-10-28 | https://expo.dev/blog/expo-ui-stable-sdk-56.md |
| NativeWind | 4.2.7 stable (Tailwind 3); v5 is RC (npm `rc` tag 5.0.0-rc.0), "not intended for production" | 2026-10-28 | https://www.nativewind.dev/v5/guides/migrate-from-v4 |
| Gluestack v5 | Built on NativeWind v5 RC: avoid for now | 2026-10-28 | https://gluestack.io/blogs/gluestack-ui-v5-stable-release |
| Tamagui | 3.1.6 (27 Oct 2026); complex compiler setup (E) | 2026-10-28 | https://www.npmjs.com/package/tamagui |
| Unistyles 3 | 3.6.0; "no Expo Go" not re-checked | 2026-10-28 | https://www.unistyl.es/v3/start/getting-started |

## 13. Desktop apps

| Topic | Fact | Checked on | Source |
|---|---|---|---|
| Expo desktop | No official desktop target | 2026-10-28 | https://docs.expo.dev/modules/additional-platform-support/ |
| Electron | Build, sign, notarise on GitHub macOS runners; notarising needs the Apple program | 2026-10-28 | https://www.electron.build/docs/features/github-actions |
| Tauri | macOS CI works, but cert setup needs an Apple device | 2026-10-28 | https://v2.tauri.app/distribute/sign/macos/ |
| Windows signing, EU individual | Azure Artifact Signing open to individuals only in USA/Canada | 2026-10-28 | https://www.devclass.com/security/2026/01/14/code-signing-windows-apps-may-be-easier-and-more-secure-with-new-azure-artifact-service/4079554 |
| Microsoft Store | Free registration for individuals since Sep 2025; the Store signs packages | 2026-10-28 | https://blogs.windows.com/windowsdeveloper/2025/09/10/free-developer-registration-for-individual-developers-on-microsoft-store/ |

## 14. Accessibility

| Topic | Fact | Checked on | Source |
|---|---|---|---|
| WCAG 2.2 AA | 2.5.8: 24 x 24 CSS px; 44 x 44 is AAA (2.5.5 Target Size, Enhanced) | 2026-10-28 | https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html |
| Apple | Control 44 x 44 pt; contrast 4.5:1 (3:1 large); 200% text (not re-fetched (E)) | 2026-10-28 | https://developer.apple.com/design/human-interface-guidelines/accessibility |
| Android | Touch target 48 x 48 dp; contrast 4.5:1 / 3:1 (not re-fetched (E)) | 2026-10-28 | https://developer.android.com/guide/topics/ui/accessibility/apps |
| Android 16 tablets | Apps targeting API 36: no orientation lock on screens 600 dp+; edge-to-edge forced. A temporary per-app opt-out exists until API 37 | 2026-10-28 | https://developer.android.com/about/versions/16/behavior-changes-16 |
| iPad | `ios.supportsTablet` defaults to false: the iPad shows a scaled iPhone app unless set to true | 2026-10-28 | https://docs.expo.dev/versions/latest/config/app/#supportstablet |
| House rule | Hit area 48 everywhere (covers all three) | suggestion | (this playbook) |

## 15. Security, GitHub, npm, backend

| Topic | Fact | Checked on | Source |
|---|---|---|---|
| Missing RLS | Moltbook (Jan 2026): Supabase key in the JS bundle, no RLS, 1.5M API tokens exposed | 2026-10-28 | https://wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys |
| Missing RLS | Lovable apps, CVE-2025-48757: 170+ apps exposed | 2026-10-28 | https://www.superblocks.com/blog/lovable-rls-breach |
| Open storage | Tea app (Jul 2025): images from an open bucket | 2026-10-28 | https://simonwillison.net/2025/Jul/26/official-statement-from-tea/ |
| npm worm | Mini Shai-Hulud (May 2026) steals tokens, persists via Claude Code hooks and VS Code tasks | 2026-10-28 | https://www.akamai.com/blog/security-research/mini-shai-hulud-worm-returns-goes-public |
| Agent prompted to steal | Nx "s1ngularity" (2025) made local AI CLIs search for secrets | 2026-10-28 | https://www.okta.com/newsroom/articles/the-s1ngularity-attack--when-attackers-prompt-your-ai-agents-to- |
| Repo config attack | Cloned `.claude/settings.json` could run code (CVE-2025-59536, fixed) | 2026-10-28 | https://research.checkpoint.com/2026/rce-and-api-token-exfiltration-through-claude-code-project-files-cve-2025-59536/ |
| Malicious skills | Snyk (5 Feb 2026): 13.4% of 3,984 open-directory skills had a critical issue; 76 malicious | 2026-10-28 | https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub |
| Agent deletes prod | Replit agent deleted a production DB (Jul 2025) | 2026-10-28 | https://www.eweek.com/news/replit-ai-coding-assistant-failure/ |
| npm cooldown | `.npmrc` `min-release-age=7` works only on **npm 11.10+**; npm 10.9.9 (seen with Node 22 in the sandbox) ignores it silently. Optional fix: `npm install -g npm@11` (11.19.1 is the current 11.x). **Never `npm@latest`**: that is npm 12.2.1, which needs Node ^22.22.2, ^24.15.0 or >=26, while Expo allows Node from 22.13 / 24.3. On Windows the Node installer puts `Program Files\nodejs` before `%AppData%\npm` on PATH, so the old npm often keeps winning: check `npm -v`. If it stays old, the delay is off and CLAUDE.md rule 3 (package at least 7 days old) is the manual stand-in | 2026-10-28 | https://docs.npmjs.com/cli/v12/using-npm/config, https://docs.npmjs.com/try-the-latest-stable-version-of-npm, npm registry (`npm view npm`) |
| npm audit on Expo | Untouched starter: 16 findings, 3 high (`zod` and `deepmerge` via `@expo/cli`, `@expo/config`, `jest-config`: build tools). `npm audit fix --force` would install expo@51: never run it. Plain `npm audit fix` rewrites many lockfile entries and fixes none (tested in sandbox) | 2026-10-28 | https://docs.npmjs.com/cli/v11/commands/npm-audit, tested in sandbox |
| GitHub Free, private | No secret scanning; no rulesets or branch protection on private repos (need Pro, Team or Enterprise). Needed before any cloud night task | 2026-10-28 | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets |
| GitHub Actions Free | Private repos: 2,000 min per month; 500 MB storage shared by artifacts and Packages | 2026-10-28 | https://docs.github.com/en/billing/concepts/product-billing/github-actions |
| Student Pack | "Free GitHub Pro while you are a student" | 2026-10-28 | https://education.github.com/pack |
| gitleaks | CI action, no licence key for personal accounts | 2026-10-28 | https://github.com/gitleaks/gitleaks-action |
| Dependabot alerts | Alerts without PRs possible; "security updates" setting may open bump PRs: **NOT VERIFIED** for new private repos | 2026-10-28 | https://docs.github.com/en/code-security/dependabot/dependabot-alerts/about-dependabot-alerts |
| Supabase Free | 2 projects, 500 MB, paused after 1 week idle, **no backups**; Pro from 25 USD (daily backups, 7 days) | 2026-10-28 | https://supabase.com/pricing |
| Supabase keys | New publishable/secret keys; legacy keys removed late 2026; no RLS on migrations unless the auto-RLS trigger is on | 2026-10-28 | https://supabase.com/blog/supabase-security-2025-retro |
| Supabase MCP | Dev project only, `read_only=true`, `project_ref=` | 2026-10-28 | https://supabase.com/docs/guides/getting-started/mcp |
| Builder platform leaks | RedAccess (May 2026): about 5,000 of 380,000 builder-hosted apps leaking data; public by default (press only, primary report not found) | 2026-10-28 | https://www.axios.com/2026/05/07/loveable-replit-vibe-coding-privacy |

## 16. Add-ons: default, later, not now

Run `claude plugin list` first: plugins may already be synced from claude.ai (`<name>@synced`). Plugin facts: https://code.claude.com/docs/en/plugins/install.md (checked 2026-10-28).

### Default and later

| Item | Verdict | One-line reason | Source |
|---|---|---|---|
| expo (official plugin) | **Default** | First-party skills + MCP; Expo itself recommends Claude Code + MCP | https://docs.expo.dev/agents.md |
| Expo connector | Keep for claude.ai and phone only | Same server as the plugin; load Expo once per surface | https://expo.dev/changelog/connect-expo-in-claude.md |
| Built-ins: /code-review, /security-review, /context, /usage, /goal | **Default** | Already there, maintained by Anthropic | https://code.claude.com/docs/en/commands.md |
| Starter hooks (guard, lint per edit, typecheck) and 2 subagents | **Default** | Ship in app-starter, Windows exec form | https://code.claude.com/docs/en/hooks.md |
| gh CLI | **Default** | Cheaper in context than a GitHub MCP | https://cli.github.com/manual/ |
| typescript-lsp | Later (week 1) | Type errors per edit; local sessions only | https://code.claude.com/docs/en/plugins/install.md |
| Android "eyes" (Argent or agent-device) | Later: one 30-minute test, only if Android is a target | Would make the Android emulator check cheap; Windows host not verified | https://docs.expo.dev/agents/agent-device.md |
| figma | Later | Only with a paid Full seat | https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/ |
| supabase | Later | Backend day, read-only, one project | https://supabase.com/docs/guides/getting-started/mcp |
| security-guidance | Later | When auth or user data arrive; needs Python 3.10+ | https://code.claude.com/docs/en/plugins/install.md |
| EAS Workflows + Maestro | Later | Device tests on PRs, before outside testers | https://docs.expo.dev/eas/workflows/examples/e2e-tests/ |
| Ultrareview | Later, once | One run before a store release, not daily | https://code.claude.com/docs/en/ultrareview.md |
| Callstack RN skills, Chrome DevTools MCP, Context7 | Later | Only when slowness, web performance or missing docs appear; read first | https://code.claude.com/docs/en/plugins/security.md |

### Not now (with reason)

| Item | Why not now | Source |
|---|---|---|
| Agent teams | Experimental, about 7x tokens for teammates in plan mode ("significantly more" otherwise), split panes need tmux or iTerm2 (not Windows Terminal). Your bottleneck is deciding and checking, not typing | https://code.claude.com/docs/en/agent-teams |
| Workflows and `ultracode` | Fan out to dozens or hundreds of subagents; warning above 25 agents or 1.5M tokens | https://code.claude.com/docs/en/workflows.md |
| `claude agents` / `--bg` dispatch | Each background session makes its own worktree and branch: Clou's branch chaos, automated | https://code.claude.com/docs/en/agent-view.md |
| Ralph loops (and the plugin) | False "done", cost overruns. Use `/goal` with a machine check and a turn cap instead | https://ghuntley.com/ralph/, https://code.claude.com/docs/en/goal.md |
| Gas Town and other agent "factories" | Alpha; heavy users need 2 to 3 Max plans | https://heise.de/-11178824 |
| Second tools: Cursor, Kiro, Antigravity, Codex | All have the same primitives now; switching costs learning time. Trigger: a real gap Claude Code can't fill | https://developers.openai.com/codex/learn/best-practices.md, https://kiro.dev/blog/, https://cursor.com/help/ai-features/background-agents |
| AI app builders (Rork, Lovable, FlutterFlow, a0, Bolt, Replit, Vibecode, RapidNative) | Not your repo, rules or tests; merge = rewrite; Lovable and FlutterFlow make no Expo; Expo closed its own builder. Optional: one throwaway evening in the toy box, never merged | https://expo.dev/changelog/expo-agent-ending-the-closed-beta-and-winding-the-project-down, https://docs.lovable.dev/introduction/faq, https://www.flutterflow.io/pricing |
| superpowers | A whole method that pushes branches and worktrees | https://code.claude.com/docs/en/plugins/security.md |
| Playwright MCP | Browser pane does this; keep Playwright as a test runner | https://code.claude.com/docs/en/desktop.md |
| code-review / pr-review-toolkit plugins | Built-in `/code-review` exists | https://code.claude.com/docs/en/commands.md |
| frontend-design, Vercel RN skills | Web-focused or overlaps Expo; one source of RN rules | https://docs.expo.dev/skills/ |
| Unread third-party skills | Snyk found malicious ones | https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub |

### Use in the idea phase

Strategy skills you already have (product-management, gtm-planner, venture: customers, pmf, review; research-desk:llm-council for a one-round review of the brief) instead of writing your own strategy docs. Source: your installed skills list (`/help`).

Rejected stacks (Flutter, KMP, Lynx, PWA-as-app): see `decisions.md`.

## 17. Learning links

- Anthropic Academy ("Claude Code 101", "Claude Code in Action"): https://anthropic.skilljar.com/
- Claude Code best practices: https://code.claude.com/docs/en/best-practices
- `/powerup` in Claude Code, and the Learning output style: https://code.claude.com/docs/en/output-styles.md
- Shape Up, appetite: https://basecamp.com/shapeup/1.2-chapter-03
- The Mom Test: https://www.momtestbook.com/
