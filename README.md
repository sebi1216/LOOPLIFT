# app-starter

A template repo for a new app: a running Expo SDK 58 app (iPhone, iPad, Android, web) plus everything Claude Code needs to build it with you. Made for a native Windows PC, an iPhone and the Claude desktop app.

**Start with [START-HERE.md](START-HERE.md).** Every app goes through three phases in this order: 1. strategy (`/kickoff`), 2. designs (`/designs`), 3. code (`/build-screen`, `/wrap-up`).

The guide behind it (why each part exists, first day, daily loop, design to code, fixes, words) lives in [docs/playbook/](docs/playbook/README.md) and comes with every new app.

## New app in short
1. GitHub: **Use this template** > new private repo with the app's name.
2. Clone it to `C:\DEV\<app name>` (GitHub Desktop is fine), open it in the Claude desktop app (Code tab), ask Claude to run `npm ci`. Yellow warnings are normal; never run `npm audit fix --force`.
3. Strategy files into `docs/input/`, then `/kickoff`. Next session `/designs`. Then `/build-screen` per screen. End every session with `/wrap-up`.

Plain-words tour of the repo: [docs/how-this-repo-works.md](docs/how-this-repo-works.md).

## Needs on the PC
Git for Windows, Node.js 22.13+, 24.3+ or 26+, Google Chrome, GitHub CLI (`gh`), Claude Code and the Claude desktop app, an Expo account, FigCraft (or Figma) for the design phase. Setup: [docs/playbook/guide/1-first-day.md](docs/playbook/guide/1-first-day.md). All checks were green on Linux; the first Windows run is the real test. Write what broke into [docs/playbook/troubleshooting.md](docs/playbook/troubleshooting.md).
