// Shared helper for the hooks in this folder (Node only, works the same on Windows, macOS, Linux).
// Finds a tool (eslint, typescript) inside node_modules and runs it with node directly.
// Why: on Windows, npx/eslint/tsc in node_modules/.bin are .cmd files that a hook
// cannot start without a shell. Running "node <script>" works everywhere.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

export function readHookInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

export function projectRoot(input) {
  return process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
}

// Path of a package's CLI script, for example binPath(root, 'eslint', 'eslint').
// Returns null when the package is not installed.
export function binPath(fromDir, pkg, binName) {
  try {
    const req = createRequire(path.join(fromDir, 'package.json'));
    const pkgJsonPath = req.resolve(`${pkg}/package.json`);
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    const rel = typeof pkgJson.bin === 'string' ? pkgJson.bin : pkgJson.bin?.[binName];
    return rel ? path.join(path.dirname(pkgJsonPath), rel) : null;
  } catch {
    return null;
  }
}

export function runNodeScript(script, args, cwd, timeoutMs) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: timeoutMs,
    windowsHide: true,
  });
}

// First n lines of a long output, so Claude's context stays small.
export function head(text, n) {
  const lines = (text || '').trim().split(/\r?\n/);
  const more = lines.length > n ? `\n... (${lines.length - n} more lines)` : '';
  return lines.slice(0, n).join('\n') + more;
}
