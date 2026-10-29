# Spec NNN: <feature>   Status: draft | building | done

Slice: <n> · Why: <one line, from the core loop>

## Flow
1. User ...
2. ...

## Acceptance checks (3 to 7; each says how it is checked)
- When I <action or condition>, the app shows <result>. Check: <Jest test | Playwright test | screenshot | device tap>
- ...

## Logic built red/green
<rules, calculations, data changes: name the failing test written first, for example `src/data/score.test.ts`>

## Done when (a machine can check it; paste into /goal for longer runs)
<e.g. `npm run check` and `npm run test:e2e` pass, and `e2e/screenshots/<screen>.png` exists>

## Out of scope
- ...

## Design and data
Design: <Claude Design bundle | Figma or FigCraft frame link | code-first, follow docs/design/direction.md>
Demo data: <which cast members and content from src/data/demo.ts>
States: empty, loading, error, filled (each reachable with ?state=<name>)

## Files and interfaces (Claude fills this in during plan mode)
- ...

## Open questions
- ...
