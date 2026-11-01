// PreToolUse hook (Bash|PowerShell|Monitor): runs before every shell command Claude wants to run.
// It is a SEATBELT AGAINST ACCIDENTS, not a wall against attacks or prompt injection.
// Git and claude rules compare argv tokens per command (split on && || ; | & newlines and brackets).
// Secret, download and delete rules still match TEXT on purpose, so they see hidden forms (.e""nv).
// A determined bypass (base64, string tricks) can still get through: tools/guard-cases.mjs lists the
// known gaps. Native Windows has no sandbox. Real protection:
// no production secrets on this PC, dev-only data, cloud sessions for unattended work.
// Fail closed: if this script cannot read its input or crashes, the command is blocked
// (exit 2 here, plus "onFailure": "block" in .claude/settings.json for timeouts and a missing node).
// onFailure is in the official hooks docs (v2.1.295+) and `claude doctor` accepts it (28 Oct 2026), but the
// SchemaStore schema lacks it, so settings.json has no "$schema" line (an editor warning would invite removing it).
import { readFileSync } from 'node:fs';

function block(why) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `Blocked by .claude/hooks/guard.mjs: ${why}. If Sebastian wants this, he runs it himself in a terminal.`,
      },
    })
  );
  process.exit(0);
}

let cmd = '';
try {
  const input = JSON.parse(readFileSync(0, 'utf8'));
  cmd = String(input?.tool_input?.command ?? ''); // Monitor with a WebSocket has no command: nothing to check
} catch {
  process.stderr.write('guard.mjs could not read the command, so it is blocked (fail closed).');
  process.exit(2);
}

const flatten = (s) => s.replace(/["'`^\\]/g, '');

// Splits a command into its parts, respecting quotes: [{ raw, sep, argv }]. Single & also splits,
// except inside a redirect like 2>&1. Brackets split too, so (git push -f) is seen as git.
function parse(text, useQuotes = true) {
  const parts = [];
  let raw = '';
  let argv = [];
  let tok = null;
  let quote = '';
  const endTok = () => {
    if (tok !== null) argv.push(tok);
    tok = null;
  };
  const endPart = (sep) => {
    endTok();
    parts.push({ raw, sep, argv });
    raw = '';
    argv = [];
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      raw += c;
      if ((c === '\\' || c === '`') && quote === '"' && i + 1 < text.length) {
        raw += text[++i];
        tok += c === '\\' && text[i] === '"' ? '"' : c + text[i];
      } else if (c === quote) quote = '';
      else tok += c;
    } else if (useQuotes && (c === '"' || c === "'")) {
      raw += c;
      quote = c;
      tok ??= '';
    } else if (text.startsWith('&&', i) || text.startsWith('||', i)) {
      endPart(text.slice(i, i + 2));
      i++;
    } else if (';|\n()'.includes(c) || (c === '&' && !/[<>]$/.test(raw))) {
      endPart(c);
    } else {
      raw += c;
      if (/\s/.test(c)) endTok();
      else tok = (tok ?? '') + c;
    }
  }
  if (quote && useQuotes) return parse(text, false); // an open quote hides nothing: read it without quotes
  endPart('');
  return parts;
}

// Program name of a token: C:\Git\bin\git.exe and g`it and gi\t all give git.
const names = (t) => {
  const base = t.split(/[\\/]/).pop();
  return [base, flatten(t)].map((n) => flatten(n).replace(/\.(exe|cmd)$/i, '').toLowerCase());
};
const isProgram = (t, ...want) => t !== undefined && names(t).some((n) => want.includes(n));
const WRAPPERS = ['env', 'command', 'exec', 'sudo', 'nohup', 'time', 'xargs', 'nice', 'timeout', 'watch', 'npx', 'bunx', 'call', 'start'];
const SHELLS = ['sh', 'bash', 'zsh', 'dash', 'pwsh', 'powershell', 'cmd'];
const CLAUDE = ['claude', 'claude-code'];

// Drops VAR=x in front, and wrappers (env, xargs, npx ...) up to the program we care about.
function program(argv) {
  let a = argv;
  while (a.length && /^[A-Za-z_]\w*=/.test(a[0])) a = a.slice(1);
  if (isProgram(a[0], ...WRAPPERS)) {
    const i = a.findIndex((t) => isProgram(t, 'git', ...CLAUDE, ...SHELLS));
    return i > 0 ? a.slice(i) : a;
  }
  return a;
}

// Whole-token flags. -f also matches inside a short cluster (-fu); --force also matches git's
// abbreviations (--forc), down to `min` characters.
const short = (a, letter) => /^-[a-zA-Z]+$/.test(a) && a.includes(letter);
const long = (a, full, min = full.length) => {
  const name = a.split('=')[0];
  return name.length >= min && full.startsWith(name);
};
const VALUE_FLAGS_GLOBAL = ['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path'];

// git [global options] <subcommand> [args]
function gitParts(argv) {
  const globals = [];
  let i = 1;
  while (i < argv.length && argv[i].startsWith('-')) {
    globals.push(argv[i]);
    if (VALUE_FLAGS_GLOBAL.includes(argv[i])) globals.push(argv[++i] ?? '');
    i++;
  }
  let args = argv.slice(i + 1);
  const sub = argv[i] ?? '';
  // A message or message file is a value, not a flag: git commit -m "-n" skips no checks.
  if (sub === 'commit' || sub === 'tag') {
    args = args.filter((a, n) => {
      const prev = args[n - 1] ?? '';
      return !/^(-[a-zA-Z]*[mF]|--message|--file)$/.test(prev);
    });
  }
  return { globals, sub, args };
}

function gitRisk({ globals, sub, args }) {
  const has = (...tests) => args.some((a) => tests.some((t) => t(a)));
  const s = (letter) => (a) => short(a, letter);
  const l = (full, min) => (a) => long(a, full, min);
  const dot = (a) => a === '.';

  if (sub === 'push' && has(s('f'), s('d'), (a) => a.startsWith('--for'), l('--mirror', 3), l('--delete', 4), l('--prune', 4), (a) => /^[+:]./.test(a)))
    return 'force push or deleting a remote branch';
  if (has(l('--no-verify', 6)) || (sub === 'commit' && has(s('n')))) return 'skips git checks (--no-verify)';
  const lost =
    (sub === 'reset' && has(l('--hard', 3), l('--merge', 3), l('--keep', 3))) ||
    (sub === 'clean' && has(s('f'), l('--force', 3))) ||
    (sub === 'switch' && has(s('f'), l('--force', 3), l('--discard-changes', 3))) ||
    (sub === 'checkout' && has(s('f'), l('--force', 3), dot)) ||
    (sub === 'restore' && has(s('W'), l('--worktree', 3), dot)) ||
    (sub === 'add' && has(s('f'), l('--force', 3))) ||
    (sub === 'stash' && ['drop', 'clear'].includes(args[0])) ||
    (sub === 'branch' && (has(s('D')) || (has(s('d'), l('--delete', 3)) && has(s('f'), l('--force', 3))))) ||
    (sub === 'tag' && has(s('f'), s('d'), l('--force', 3), l('--delete', 3))) ||
    sub === 'filter-branch' ||
    sub === 'filter-repo' ||
    (sub === 'reflog' && args[0] === 'expire') ||
    (sub === 'update-ref' && has(s('d'))) ||
    (sub === 'gc' && has(l('--prune', 4)));
  if (lost) return 'throws away work, rewrites history or adds ignored files';
  const all = [...globals, ...args];
  const runsProgram =
    all.some((a) => /^--(upload|receive)-pack/.test(a) || a.includes('ext::')) ||
    globals.some((a, n) => globals[n - 1] === '-c' && /^(core\.|alias\.|protocol\.|credential\.|url\.|diff\.external)/i.test(a)) ||
    (sub === 'clone' && has(s('u'))) ||
    (sub === 'config' && has((a) => /^(alias\.|core\.|credential\.|protocol\.|url\.)/i.test(a))) ||
    (['diff', 'log', 'show'].includes(sub) && has(l('--output'), l('--ext-diff')));
  if (runsProgram) return 'git option that runs a program or writes files';
  return null;
}

const claudeRisk = (args) =>
  args.some((a) => a === '-p' || long(a, '--print', 3) || ['--allowedTools', '--allowed-tools', '--permission-mode'].includes(a.split('=')[0]));

// Commands hidden inside another one: bash -c "...", cmd /c ..., $(...), `...`
function checkTokens(text, depth = 0) {
  if (depth > 4) block('command nested too deep to read');
  for (const { argv } of parse(text)) {
    const a = program(argv);
    if (isProgram(a[0], 'git')) {
      const why = gitRisk(gitParts(a));
      if (why) block(why);
    } else if (isProgram(a[0], ...CLAUDE) && claudeRisk(a.slice(1))) {
      block('publishing, deleting, going public or disabling safety checks');
    } else if (isProgram(a[0], ...SHELLS)) {
      const i = a.findIndex((t, n) => n > 0 && /^(-\w*c|-Command|-com\w*|\/c|\/k)$/i.test(t));
      if (i > 0) checkTokens(a.slice(i + 1).join(' '), depth + 1);
    }
  }
  for (const m of text.matchAll(/\$\(([^()]*)\)|`([^`]*\s[^`]*)`/g)) checkTokens(m[1] ?? m[2], depth + 1);
}

try {
  const parts = parse(cmd);
  // Views of the same command:
  // flat: quotes, backslashes, backticks and ^ removed (catches .e""nv, .e\nv, PowerShell `e`n`v, cmd ^ tricks)
  // message view (for every text rule): inside `git commit` or `git tag`, the quoted message after
  // -m or --message is removed, unless it can run code ($ or a backtick). So
  // git commit -m "docs: explain .env handling" passes, but sort -m ".env" is still blocked.
  const msgArg = /(\s(?:-m|--message)(?:=|\s+))(["'])((?:\\.|(?!\2)[^\\])*)\2/g;
  const noMsg = parts
    .map(({ raw, sep, argv }) => {
      const a = program(argv);
      const isMsg = isProgram(a[0], 'git') && ['commit', 'tag'].includes(gitParts(a).sub);
      return (isMsg ? raw.replace(msgArg, (m, pre, q, body) => (/[$`]/.test(body) ? m : `${pre}""`)) : raw) + sep;
    })
    .join('');
  const noMsgFlat = flatten(noMsg);
  // squashed: also spaces and + removed (catches '.e' + 'nv' and '.'+'env')
  const squashed = noMsgFlat.replace(/[\s+]/g, '');
  const anyNoMsg = (re) => re.test(noMsg) || re.test(noMsgFlat) || re.test(squashed);
  const any = (re) => re.test(noMsg) || re.test(noMsgFlat);
  const pieces = parse(noMsg).map((p) => p.raw);
  const segments = [...pieces, ...pieces.map(flatten)];
  // Same text test, but one command at a time: grep x && ls -r is not a recursive grep.
  const anySegment = (re) => segments.some((s) => re.test(s));

  // Git and claude: whole tokens per command
  checkTokens(cmd);

  // 1. Secrets and the environment
  const envFile = /\.env(\.[\w-]+)?\b|\.en[v?*]|\.e[*?]/i;
  if (anyNoMsg(envFile)) block('touches a .env file or process.env (secrets stay out of the chat)');
  if (
    any(
      /\bprintenv\b|\bnpm\s+(run|run-script)\s+env\b|--script-shell|(^|[|;&]\s*)(env|set|export|declare\s+-[xp]|compgen\s+-v)\s*(-0|--null)?\s*($|[|>;&])|\bcmd(\.exe)?\s+\/c\s+set\b|\$\{env:|\$env:\w+\b(?!\s*=)|\[(System\.)?Environment\]::|\b(gi|gc|gci|ls|dir|Get-Item|Get-Content|Get-ChildItem)\b[^|;]*\benv:|process\s*\[|os\.environ|\bgetenv\b|\bENV\[|Deno\.env|\/proc\/\S*environ/im
    )
  )
    block('prints environment variables');
  if (any(/\$\{?\w*(token|key|secret|password|passwd|credential|auth)\w*\}?|%\w*(token|key|secret|password|credential)\w*%/i))
    block('prints a secret variable');
  // Credential printers: on Windows the gh and git tokens sit in the Windows credential store,
  // so a file deny rule cannot protect them; these commands print them in plain text.
  if (
    anyNoMsg(
      /\bgh(\.exe)?\b.*\bauth\s+token\b|\bgh(\.exe)?\b.*\bauth\s+status\b.*(\s-\w*t\b|--show-token)|\bgit\b.*\bcredential(-[\w-]+)?\b|\bgit-credential[\w-]*|\bcmdkey(\.exe)?\b|\bvaultcmd(\.exe)?\b|\bGet-StoredCredential\b|\bPasswordVault\b|\bCredRead\b/i
    )
  )
    block('prints a saved login token or password (gh, git or Windows credentials)');
  if (anySegment(/\bgrep\b.*\s-\w*r|\bgrep\b.*--recursive|\b(Select-String|sls)\b.*-Recurse|\bfindstr\b.*\/s\b/i))
    block('searches every file, including .env (use the Grep tool, it respects the deny rules)');
  if (any(/\b(node|bun|deno|python3?|py|ruby|perl|pwsh|powershell)\b.*\s(-e|-p|-c|--eval|--print|eval|-Command)\b.*\benv\b/i))
    block('inline code that reads the environment');
  if (any(/\bbase64\b.*\s(-d|--decode|-D)\b|FromBase64String|\b(pwsh|powershell)(\.exe)?\b.*\s-(e|ec|en|enc|encodedcommand)\b/i))
    block('decodes hidden text inside a command');

  // 2. Variables that make git or the next program run other code (the flags are in gitRisk above)
  if (any(/(^|[\s;&])(GIT_\w+|PAGER|LESSOPEN|EDITOR|VISUAL|BROWSER|NODE_OPTIONS|npm_config_\w+)\s*=|\$env:(GIT_\w+|PAGER|EDITOR|NODE_OPTIONS|npm_config_\w+)\s*=/i))
    block('sets a variable that makes the next program run other code');

  // 3. Deleting outside this folder (recursive delete of /, ~, $HOME, a drive or ..)
  const outside = /(^|[\s"'=(,])(~|\$\{?HOME\b|\$env:(USERPROFILE|HOME\w*|SystemDrive|SystemRoot|APPDATA|LOCALAPPDATA)|%(USERPROFILE|HOMEPATH|SystemDrive|APPDATA)%|\/|[A-Za-z]:|\.\.)/i;
  for (const seg of segments) {
    const del = /\b(rm|rmdir|rd|del|erase|ri|Remove-Item)\b/i.test(seg);
    const recursive = /\s(-[a-zA-Z]*[rR][a-zA-Z]*|--recursive|-Recurse\b|\/s\b)/i.test(seg);
    if (del && recursive && outside.test(seg.replace(/^.*?\b(rm|rmdir|rd|del|erase|ri|Remove-Item)\b/i, ' ')))
      block('deletes a whole drive, home folder or something outside this repo');
  }
  if (any(/--no-preserve-root|\bfind\b.*\s-(delete|exec\s+rm)\b/i)) block('deletes many files at once');

  // 4. Download and run
  if (
    any(
      /\b(curl|wget|iwr|irm|Invoke-WebRequest|Invoke-RestMethod|DownloadString)\b.*(\|\s*(sh|bash|zsh|node|python3?|iex|Invoke-Expression|pwsh|powershell|cmd)\b)|\b(iex|Invoke-Expression)\b|\[scriptblock\]::Create|<\(\s*(curl|wget)|\$\(\s*(curl|wget)/i
    )
  )
    block('downloads and runs a script');
  const downloads = any(/\b(curl|wget|iwr|irm|Invoke-WebRequest|Invoke-RestMethod|Start-BitsTransfer|DownloadFile)\b/i);
  if (downloads && any(/\b(sh|bash|zsh|source)\s+\S+|\b(pwsh|powershell|node|python3?)\s+\S+\.(ps1|js|mjs|cjs|py)\b|(^|[\s;&])\.[\\/]\S+|\bchmod\s+\+x/i))
    block('downloads a file and runs it');

  // 5. Production, money, publishing, safety switches
  if (any(/\bsupabase\b.*\b(db\s+push|db\s+reset\b.*--linked|migration\s+(repair|up)\b.*--linked|functions\s+deploy|secrets\s+set|projects\s+delete|orgs\s+delete)\b/i))
    block('changes the hosted database or backend');
  if (any(/\bpsql\b|postgres(ql)?:\/\//i)) block('talks to a database directly');
  if (any(/\beas(-cli(@\S+)?)?\b.*\b(submit|update\b.*\bprod|update\b.*--auto|deploy\b.*--prod|workflow:run)/i))
    block('releases to the stores or to real users');
  if (
    any(
      /\bnpm(@\S+)?\s+(publish|unpublish|deprecate|owner|token|adduser|login)\b|\bnpm\s+audit\s+fix\b.*--force|--dangerously-skip-permissions|bypassPermissions|\bgh\s+repo\s+delete\b|\bgh\s+repo\s+edit\b.*--visibility\s*=?\s*public|\bgh\s+api\b.*(-X\s*DELETE|--method\s*=?\s*DELETE)/i
    )
  )
    block('publishing, deleting, going public or disabling safety checks');

  // 6. Changing Claude's safety settings, git hooks or CI from the shell (use the Edit tool: it asks first)
  const protectedPath = /\.claude[\\/](settings[\w.-]*\.json|hooks\b)|\.git[\\/]hooks|\.mcp\.json|\.github[\\/]workflows|\.npmrc\b/i;
  const writes =
    /(^|[^2&])>|\btee\b|\bsed\b.*\s-i|\b(rm|mv|cp|del|ri|mi|cpi|ni|sc|ac|Set-Content|Add-Content|Out-File|Remove-Item|Move-Item|Copy-Item|New-Item|Rename-Item|chmod|truncate|ln|writeFile\w*|appendFile\w*|unlink\w*|rmSync|renameSync|copyFile\w*)\b|\bgit\b.*\b(checkout|restore|rm|mv)\b/i;
  for (const seg of segments) {
    if (protectedPath.test(seg) && writes.test(seg)) block("changes Claude's safety settings, git hooks or CI from the shell (use the Edit tool)");
  }
} catch (e) {
  process.stderr.write(`guard.mjs crashed (${e?.message ?? e}), so the command is blocked (fail closed).`);
  process.exit(2);
}
process.exit(0);
