// Stop hook: when Claude wants to finish a turn, run the TypeScript check once.
// If there are type errors, Claude gets them and keeps working (one extra round only).
// Skips when no .ts/.tsx file changed since the last clean check in this session,
// so chat-only turns cost almost nothing (one git call).
// Why Stop and not PostToolBatch: a PostToolBatch "block" stops the agentic loop, while a
// Stop "block" sends Claude back to fix the errors, which is what we want (hooks docs, Oct 2026).
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { readHookInput, projectRoot, binPath, runNodeScript, head } from './run-tool.mjs';

const input = readHookInput();
// Already sent Claude back once in this turn: let it stop, Sebastian sees the rest.
if (input.stop_hook_active) process.exit(0);

const root = path.resolve(projectRoot(input));
if (!fs.existsSync(path.join(root, 'tsconfig.json'))) process.exit(0);

// What the TypeScript files look like right now (changed and new files). git.exe starts without a shell.
const git = (args) => spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true });
const diff = git(['diff', 'HEAD', '--', '*.ts', '*.tsx']);
const untracked = git(['ls-files', '-o', '--exclude-standard', '--', '*.ts', '*.tsx']);
let signature = null;
if (diff.status === 0 && untracked.status === 0) {
  if (!diff.stdout.trim() && !untracked.stdout.trim()) process.exit(0); // nothing changed since the last commit
  const files = untracked.stdout.split(/\r?\n/).filter(Boolean);
  const contents = files.map((f) => {
    try {
      return fs.readFileSync(path.join(root, f), 'utf8');
    } catch {
      return '';
    }
  });
  signature = crypto.createHash('sha1').update(diff.stdout).update(files.join('\n')).update(contents.join('\n')).digest('hex');
}
const stamp = path.join(os.tmpdir(), `claude-tsc-ok-${String(input.session_id || 'nosession').replace(/\W/g, '')}`);
if (signature && fs.existsSync(stamp) && fs.readFileSync(stamp, 'utf8') === signature) process.exit(0);

const tsc = binPath(root, 'typescript', 'tsc');
if (!tsc) process.exit(0);

const r = runNodeScript(tsc, ['--noEmit', '--pretty', 'false', '-p', root], root, 110_000);
if (r.status === 0) {
  if (signature) fs.writeFileSync(stamp, signature);
} else if (r.status !== null) {
  // Factual wording on purpose: hook text that sounds like system orders can be ignored as injection.
  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason: `The TypeScript check (npm run typecheck) failed after this turn's changes:\n${head(r.stdout || r.stderr, 25)}`,
    })
  );
}
process.exit(0);
