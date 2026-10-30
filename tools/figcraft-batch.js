// Builds a FigCraft `batch` with named steps instead of counted `$step` numbers.
// Counting steps by hand went wrong 4 times in the 2026-10-29 /designs run (ratchet, docs/now.md).
// Input: steps like { as: 'card', command, params }; refer to an earlier step with { $ref: 'card' }
// (optional `field`, as in FigCraft). Output: the commands array for the FigCraft batch tool.
// Run: node tools/figcraft-batch.js steps.json > batch.json   (or require it and call buildBatch)

function buildBatch(steps) {
  const index = new Map();

  const resolve = (value) => {
    if (Array.isArray(value)) return value.map(resolve);
    if (value && typeof value === 'object') {
      if ('$ref' in value) {
        if (!index.has(value.$ref)) throw new Error(`unknown step "${value.$ref}" (refs must point to an earlier step)`);
        const { $ref, ...rest } = value;
        return { $step: index.get($ref), ...rest };
      }
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v)]));
    }
    return value;
  };

  return steps.map((step, i) => {
    const out = { command: step.command, params: resolve(step.params ?? {}) };
    if (step.as !== undefined) {
      if (index.has(step.as)) throw new Error(`step name "${step.as}" used twice`);
      index.set(step.as, i);
    }
    return out;
  });
}

module.exports = { buildBatch };

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node tools/figcraft-batch.js steps.json');
    process.exit(1);
  }
  const steps = JSON.parse(require('node:fs').readFileSync(file, 'utf8'));
  process.stdout.write(JSON.stringify(buildBatch(steps)));
}
