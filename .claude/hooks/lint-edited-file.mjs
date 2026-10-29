// PostToolUse hook (Edit|Write): runs ESLint on the one file Claude just changed.
// Exit 0 = nothing to report. Exit 2 = Claude sees the problems (stderr) and fixes them.
// Quiet when the file is not JS/TS, is outside the repo, or ESLint is not installed.
import fs from 'node:fs';
import path from 'node:path';
import { readHookInput, projectRoot, binPath, runNodeScript, head } from './run-tool.mjs';

const input = readHookInput();
const file = input.tool_input?.file_path;
if (!file || !/\.(ts|tsx|js|jsx|mjs|cjs)$/i.test(file)) process.exit(0);

const root = path.resolve(projectRoot(input));
const abs = path.resolve(root, file);
const rel = path.relative(root, abs);
if (rel.startsWith('..') || path.isAbsolute(rel) || !fs.existsSync(abs)) process.exit(0);

const eslint = binPath(root, 'eslint', 'eslint');
if (!eslint) process.exit(0);

// The cache makes repeat runs on Windows faster; it lives in node_modules, so git never sees it.
const cache = ['--cache', '--cache-location', path.join(root, 'node_modules', '.cache', 'eslint-hook') + path.sep];
const r = runNodeScript(eslint, ['--no-warn-ignored', ...cache, abs], root, 50_000);
// ESLint exit codes: 0 clean, 1 lint errors, 2 config problem or crash (not caused by the edit, stay quiet).
if (r.status === 1) {
  process.stderr.write(`ESLint reported problems in ${rel}:\n${head(r.stdout, 30)}\n`);
  process.exit(2);
}
process.exit(0);
