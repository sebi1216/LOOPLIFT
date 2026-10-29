---
name: wrap-up
description: End-of-session wrap-up for this repo in 7 steps (check, teach-back, commit and push, tag, now.md, log line with hours, one ratchet question). Sebastian runs it with /wrap-up.
disable-model-invocation: true
---

# Wrap up (7 steps, about 3 minutes of Sebastian's time)

The bigger checks (duplication via `/simplify`, branches and worktrees, config diff, doc sizes, security checklist) are in the weekly review in `docs/how-this-repo-works.md`, not here.

1. **Check.** Run `npm run check`. If it fails, fix it or tell Sebastian exactly what is broken. Never leave `main` red.
2. **Teach-back.** Ask Sebastian for 2 or 3 sentences: what changed today and why. Ask one question about the diff. Weak answer: a 5-minute walk-through, then continue. It never blocks the commit.
3. **Commit and push.** Commit what is left in small commits (`feat:`, `fix:`, `docs:`, `chore:`; say so if a test and its code changed together). If code changed (not only `docs/`), run `/code-review` on the unpushed commits for correctness bugs (if you cannot start it, ask Sebastian to type it; if it asks for a pull request, review `git log origin/main..HEAD` instead). Auth, RLS, storage, payments or Edge Functions changed: `/security-review` too. Fix or list the findings, then push (Claude Code asks first). No `origin` yet: give him `gh repo create <name> --private --source . --push` and skip the push.
4. **Tag.** App runs and checks are green: tag `good-YYYY-MM-DD` (today) and `git push origin good-YYYY-MM-DD`. If today's tag exists, leave it; never move or force-push a tag.
5. **now.md and changed facts.** Re-read `docs/now.md` from disk, then rewrite it (max about 60 lines, never append): status and phase line, hours logged (a record, not a cap), must-haves ticked only with evidence (never edit one), one next step, open questions. Ask once: "Did you decide anything outside this repo since last time (chat, Doc, notes)? Paste it." If a fact changed (brief, direction, a spec, how-this-repo-works), update that file. A product decision: propose the `docs/decisions.md` row with "Who decided"; add it only after he confirms the wording.
6. **Log line.** Append one entry to `docs/log.md` (newest at the bottom): date, Learn or Ship, hours (ask him), screens moved to checked-device, built, learned, problems, next.
7. **Ratchet question.** Ask: "Did Claude make the same mistake twice?" If yes, propose a test, lint rule or hook (a CLAUDE.md line only if that is impossible) and write it into `docs/now.md` open questions.

Reply in at most 8 lines: what was built (with evidence), what to try, what is next, anything that needs his attention.
