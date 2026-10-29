// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // .claude/worktrees: Claude's worktrees are separate copies of the repo; never lint them from here.
    ignores: ['dist/*', 'e2e/.results/*', 'playwright-report/*', '.claude/worktrees/*'],
  },
]);
