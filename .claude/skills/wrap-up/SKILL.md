---
name: wrap-up
description: End-of-session wrap-up for this repo in 3 steps (check and push, now.md and log line, next-chat prompts). Sebastian runs it with /wrap-up.
disable-model-invocation: true
---

# Wrap up (3 steps)

## 1. Check, commit, push
- Run `npm run check`. If it fails, fix it or tell Sebastian exactly what is broken. Never leave `main` red.
- Only if code outside `docs/` changed: run `/code-review low` on the unpushed commits (if it asks for a pull request, review `git log origin/main..HEAD` instead). Fix or list the findings.
- Commit what is left in small commits (`feat:`, `fix:`, `docs:`, `chore:`; say so if a test and its code changed together).
- Push. No `origin` yet: give him `gh repo create <name> --private --source . --push` and skip the push.

## 2. now.md and log
- Re-read `docs/now.md` from disk, then rewrite it (max about 60 lines, never append): status, next step (one line), open questions. Tick a must-have only with evidence. No hours, no waivers.
- If a fact changed (brief, direction, a spec, how-this-repo-works), update that file.
- Append one line to `docs/log.md` without hours: date, what was built, what is next.

## 3. Next chat
End the reply with a section `## Next chat`: 1 to 3 ready-to-paste prompts, one per sensible continuation. Put each prompt in its own code block, with one line saying what it leads to.
