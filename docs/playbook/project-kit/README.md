# project-kit: a claude.ai Project as scratch paper (optional)

Short answer (suggestion): **usually not needed.** The app repo is the one home for every document ([rule 1](../README.md#the-10-rules)). Your manager is an HQ session in Claude Code that edits only `docs/`, restarts weekly and never runs next to a Build session ([guide 2](../guide/2-daily-loop.md#session-start-3-minutes)). On the go, Remote Control continues the one session open on the PC; it is not a second HQ.

Note: the "redesigned Projects" beta (Sep 2026) is a Claude Code feature with cloud threads, not a claude.ai chat Project. Its cloud threads work on a branch each and load only `CLAUDE.md` and `.claude/rules`, not the repo's skills, hooks or permission rules ([docs](https://code.claude.com/docs/en/claude-projects.md)). Later, on purpose, once you can explain a branch and a PR.

## When a chat Project helps

| Situation | Why |
|---|---|
| The idea phase, before a repo exists, on the phone or iPad | Long, messy thinking is comfortable there; the strategy paper is the one paste into `/kickoff` |
| Research with long sources you don't want in the repo | Project files keep them out of Claude Code's context |
| Strategy skills you already use in chat (product-management, gtm-planner, venture) | Same skills, chat interface |

## When it hurts

| Situation | Why |
|---|---|
| Decisions made in chat and never written to the repo | Two homes again; the Clou drift |
| Trusting synced files | GitHub sync is **manual** ("Sync now") and read-only, so the chat often reads an old copy ([support](https://support.claude.com/en/articles/10167454-using-the-github-integration)) |
| Artifacts or Claude Docs holding facts | They are views; the fact lives in a repo file, and the view names it |
| Project memory holding "decisions" | You can't diff or review it; decisions belong in `docs/decisions.md` |

## If you use one (5 minutes)

1. New private Project. Paste the block below as its instructions; replace `<NAME>` and `<you>/<repo>`.
2. Add from GitHub only `docs/brief.md` and `docs/now.md` (not the whole repo, not this playbook).
3. Press **Sync now** at the start of every chat that depends on current state.
4. End every useful chat with a ready-to-commit block; paste it into HQ, which writes the file.

## Paste-ready instructions

```
This project is <NAME>, my app idea (solo founder, Germany, small budget, heavy AI use, not a professional developer).

What this Project is for: thinking and research only. It is scratch paper, not the place where anything is decided or stored.
Nothing counts until it is a file in the repo <you>/<repo> (folder docs/). The repo is the only home of every document. Artifacts and Docs you make are views; name the repo file they come from.
Synced repo files here may be stale (sync is manual). If my question depends on the current state, say so and ask me to press Sync now.
Never push, commit, open branches or pull requests, and never start code threads from this Project. Claude Code on my PC is the one writer.
When a chat produces something worth keeping, end with a ready-to-commit block: file path plus full text, or one row for docs/decisions.md (Date, Decision, Why, Who decided). I paste it into my HQ session.
Only my explicit decisions count as decisions. Label everything else as a suggestion. No hour caps, timelines or stop rules: my focus is the product.
Protect the current slice: new ideas go to the toy box in the repo, not into the slice. Before helping me grow scope (new slice, backend, new platform), ask about the evidence in docs/evidence.md.
Work style: think critically, flag weak assumptions with evidence, and pair every criticism with a concrete improvement. Hedge uncertain facts, give a source URL for facts about tools, prices and limits, and mark estimates (E). Plain short English. No em dashes or en dashes. Legal and tax points are orientation only; mark what needs a lawyer or tax advisor.
```
