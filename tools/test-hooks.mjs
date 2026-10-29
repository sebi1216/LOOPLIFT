// Tests the three hooks in .claude/hooks with sample inputs. No Claude session needed.
// Run: npm run test:hooks   (works in PowerShell, Git Bash and CI)
// 1. guard.mjs: everyday commands pass, risky ones are blocked, the 74-case bypass suite,
//    broken input is blocked (fail closed). Cases live in tools/guard-cases.mjs.
// 2. lint-edited-file.mjs with a clean file and a file with a lint error
// 3. typecheck-on-stop.mjs with a type error (and the "only once per turn" rule)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { allowed, blocked, bypasses } from './guard-cases.mjs';

const root = path.join(import.meta.dirname, '..');
const hooks = path.join(root, '.claude', 'hooks');
const run = (script, input) =>
  spawnSync(process.execPath, [path.join(hooks, script)], {
    input: typeof input === 'string' ? input : JSON.stringify(input),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: root },
  });
const guard = (tool, command) => {
  const r = run('guard.mjs', { hook_event_name: 'PreToolUse', tool_name: tool, tool_input: { command } });
  return { r, blocked: r.status === 0 && r.stdout.includes('Blocked by .claude/hooks/guard.mjs') };
};

let failed = 0;
let checks = 0;
const tools = ['Bash', 'PowerShell', 'Monitor'];

// 1a. allowed and blocked lists, for every shell tool
for (const [list, shouldBlock] of [[allowed, false], [blocked, true]]) {
  for (const command of list) {
    for (const tool of tools) {
      checks++;
      const { r, blocked: b } = guard(tool, command);
      if (r.status !== 0 || b !== shouldBlock) {
        failed++;
        console.log(`FAIL [${tool}] ${command}  expected ${shouldBlock ? 'blocked' : 'allowed'}, exit ${r.status}`);
      }
    }
  }
}

// 1b. bypass suite (known gaps are listed, not failed)
let gapsOpen = 0;
for (const [why, command, gap] of bypasses) {
  checks++;
  const { blocked: b } = guard('Bash', command);
  if (!b && gap) {
    gapsOpen++;
    console.log(`known gap (text matching cannot catch it): ${why} | ${command}`);
  } else if (!b) {
    failed++;
    console.log(`FAIL bypass not blocked: ${why} | ${command}`);
  } else if (gap) {
    console.log(`note: known gap "${why}" is blocked now; set gap: false in tools/guard-cases.mjs`);
  }
}

// 1c. fail closed: broken input exits 2 with a message, and the Monitor WebSocket form (no command) passes
checks += 2;
const bad = run('guard.mjs', 'not json');
if (bad.status !== 2 || !bad.stderr.includes('blocked')) {
  failed++;
  console.log(`FAIL broken input must exit 2 (blocked), got exit ${bad.status}`);
}
const ws = run('guard.mjs', { hook_event_name: 'PreToolUse', tool_name: 'Monitor', tool_input: { ws: { url: 'ws://localhost:8081' } } });
if (ws.status !== 0 || ws.stdout) {
  failed++;
  console.log('FAIL Monitor without a command must pass');
}

console.log(
  `guard.mjs: ${checks} checks, ${failed} failed; bypass suite: ${bypasses.length - gapsOpen} of ${bypasses.length} blocked, ${gapsOpen} known gap(s)`
);

// 2 and 3 use a temporary file inside src/ that is always deleted again.
const tmp = path.join(root, 'src', '__hook-test__.ts');
const check = (name, ok) => {
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`);
};
const session = `hooktest${process.pid}`;
try {
  fs.writeFileSync(tmp, 'export const answer: number = 42;\n');
  let r = run('lint-edited-file.mjs', { tool_name: 'Write', tool_input: { file_path: tmp } });
  check('lint hook: clean file gives exit 0', r.status === 0);
  r = run('lint-edited-file.mjs', { tool_name: 'Write', tool_input: { file_path: path.join(root, 'README.md') } });
  check('lint hook: Markdown file is skipped', r.status === 0);

  // A hook called inside an if: an ESLint error in eslint-config-expo (warnings are not reported).
  fs.writeFileSync(tmp, "import { useState } from 'react';\nexport function f(x: boolean) {\n  if (x) useState(0);\n  return 1;\n}\n");
  r = run('lint-edited-file.mjs', { tool_name: 'Edit', tool_input: { file_path: tmp } });
  check('lint hook: lint problem gives exit 2 and a message', r.status === 2 && r.stderr.includes('ESLint reported problems'));

  fs.writeFileSync(tmp, 'export const answer: number = "forty-two";\n');
  r = run('typecheck-on-stop.mjs', { hook_event_name: 'Stop', stop_hook_active: false, session_id: session });
  check('stop hook: type error sends Claude back once', r.status === 0 && r.stdout.includes('"decision":"block"'));
  r = run('typecheck-on-stop.mjs', { hook_event_name: 'Stop', stop_hook_active: true, session_id: session });
  check('stop hook: second time in the same turn it lets Claude stop', r.status === 0 && r.stdout === '');

  fs.writeFileSync(tmp, 'export const answer: number = 42;\n');
  r = run('typecheck-on-stop.mjs', { hook_event_name: 'Stop', stop_hook_active: false, session_id: session });
  check('stop hook: fixed file gives no output', r.status === 0 && r.stdout === '');
  const t0 = Date.now();
  r = run('typecheck-on-stop.mjs', { hook_event_name: 'Stop', stop_hook_active: false, session_id: session });
  check(`stop hook: unchanged files skip the check (${Date.now() - t0} ms)`, r.status === 0 && r.stdout === '' && Date.now() - t0 < 2000);
} finally {
  fs.rmSync(tmp, { force: true });
}
const r = run('typecheck-on-stop.mjs', { hook_event_name: 'Stop', stop_hook_active: false, session_id: session });
check('stop hook: clean project gives no output', r.status === 0 && r.stdout === '');

console.log(failed ? `${failed} hook checks failed` : 'All hook checks passed');
process.exit(failed ? 1 : 0);
