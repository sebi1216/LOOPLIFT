// PreToolUse hook (Bash|PowerShell|Monitor): runs before every shell command Claude wants to run.
// It is a SEATBELT AGAINST ACCIDENTS, not a wall against attacks or prompt injection.
// It matches command TEXT, so a determined bypass (base64, string tricks) can still get through:
// tools/guard-cases.mjs lists the known gaps. Native Windows has no sandbox. Real protection:
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

try {
  // Views of the same command:
  // flat: quotes, backslashes, backticks and ^ removed (catches .e""nv, .e\nv, PowerShell `e`n`v, cmd ^ tricks)
  const flat = cmd.replace(/["'`^\\]/g, '');
  // message view (for the .env and credential rules): inside `git commit` or `git tag`, the quoted
  // message after -m or --message is removed, unless it can run code ($ or a backtick). So
  // git commit -m "docs: explain .env handling" passes, but sort -m ".env" is still blocked.
  const msgArg = /(\s(?:-m|--message)(?:=|\s+))(["'])((?:\\.|(?!\2)[^\\])*)\2/g;
  const noMsg = cmd.replace(/\bgit\b[^;&|\n]*?\b(commit|tag)\b[^;&|\n]*/g, (seg) =>
    seg.replace(msgArg, (m, pre, q, body) => (/[$`]/.test(body) ? m : `${pre}""`))
  );
  const noMsgFlat = noMsg.replace(/["'`^\\]/g, '');
  // squashed: also spaces and + removed (catches '.e' + 'nv' and '.'+'env')
  const squashed = noMsgFlat.replace(/[\s+]/g, '');
  const anyNoMsg = (re) => re.test(noMsg) || re.test(noMsgFlat) || re.test(squashed);
  // git view: quoted text removed (a commit message that mentions "push --force" is fine),
  // except quoted flags like "--force" or "+main", which are unquoted instead
  const gitView = cmd.replace(/(["'])(?![-+:])(?:\\.|(?!\1)[^\\])*\1/g, '""').replace(/["'`^\\]/g, '');
  const any = (re) => re.test(cmd) || re.test(flat);
  const split = (s) => s.split(/&&|\|\||[;|\n]/);
  const segments = [...split(cmd), ...split(flat)];

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
  if (any(/\bgrep\b.*\s-\w*r|\bgrep\b.*--recursive|\b(Select-String|sls)\b.*-Recurse|\bfindstr\b.*\/s\b/i))
    block('searches every file, including .env (use the Grep tool, it respects the deny rules)');
  if (any(/\b(node|bun|deno|python3?|py|ruby|perl|pwsh|powershell)\b.*\s(-e|-p|-c|--eval|--print|eval|-Command)\b.*\benv\b/i))
    block('inline code that reads the environment');
  if (any(/\bbase64\b.*\s(-d|--decode|-D)\b|FromBase64String|\b(pwsh|powershell)(\.exe)?\b.*\s-(e|ec|en|enc|encodedcommand)\b/i))
    block('decodes hidden text inside a command');

  // 2. Git: force push, lost work, hooks and options that run programs
  if (/\bgit\b.*\bpush\b.*(\s--for|\s--mirror|\s--delete|\s--prune|\s-[a-zA-Z]*[fd]|\s\+\S|\s:\S)/i.test(gitView))
    block('force push or deleting a remote branch');
  if (/--no-verify\b|\bgit\b.*\bcommit\b.*\s-[a-zA-Z]*n\b/i.test(gitView)) block('skips git checks (--no-verify)');
  if (
    /\bgit\b.*\b(reset\b.*--(hard|merge|keep)|clean\b.*(\s-\w*f|--force)|switch\b.*(\s-f\b|--force|--discard-changes)|checkout\b.*(\s-f\b|--force|\s\.(\s|$))|restore\b.*(--worktree|\s\.(\s|$))|add\b.*(\s-\w*f\b|--force)|stash\s+(drop|clear)|branch\b.*\s-D\b|tag\b.*\s-(f|d)\b|filter-branch|filter-repo|reflog\s+expire|update-ref\s+-d|gc\b.*--prune)/i.test(
      gitView
    )
  )
    block('throws away work, rewrites history or adds ignored files');
  if (
    any(
      /--upload-pack|--receive-pack|\bgit\b.*\bclone\b.*\s-u\b|ext::|\bgit\b.*\s-c\s+(core\.|alias\.|protocol\.|credential\.|url\.|diff\.external)|\bgit\b.*\bconfig\b.*\b(alias\.|core\.|credential\.|protocol\.|url\.)|\bgit\b.*\b(diff|log|show)\b.*--(output|ext-diff)\b/i
    )
  )
    block('git option that runs a program or writes files');
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
      /\bnpm(@\S+)?\s+(publish|unpublish|deprecate|owner|token|adduser|login)\b|\bnpm\s+audit\s+fix\b.*--force|--dangerously-skip-permissions|bypassPermissions|\bclaude\b.*(\s-p\b|--print\b|--allowedTools|--allowed-tools|--permission-mode)|\bgh\s+repo\s+delete\b|\bgh\s+repo\s+edit\b.*--visibility\s*=?\s*public|\bgh\s+api\b.*(-X\s*DELETE|--method\s*=?\s*DELETE)/i
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
