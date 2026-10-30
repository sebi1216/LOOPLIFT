const { describe, expect, it } = require('@jest/globals');

const { buildBatch } = require('./figcraft-batch');

describe('buildBatch', () => {
  it('replaces named refs with the step index FigCraft expects', () => {
    const out = buildBatch([
      { as: 'card', command: 'node.create', params: { type: 'frame' } },
      { command: 'node.create', params: { type: 'text', parent: { $ref: 'card' } } },
      { as: 'row', command: 'node.create', params: { type: 'frame', parent: { $ref: 'card' } } },
      { command: 'node.create', params: { type: 'text', parent: { $ref: 'row' } } },
    ]);
    expect(out.map((c) => c.params.parent)).toEqual([undefined, { $step: 0 }, { $step: 0 }, { $step: 2 }]);
    expect(out[0]).toEqual({ command: 'node.create', params: { type: 'frame' } });
  });

  it('finds refs nested anywhere in params and keeps a field', () => {
    const out = buildBatch([
      { as: 'a', command: 'node.create', params: {} },
      { command: 'node.set', params: { ids: [{ $ref: 'a' }], deep: { x: { $ref: 'a', field: 'id' } } } },
    ]);
    expect(out[1].params).toEqual({ ids: [{ $step: 0 }], deep: { x: { $step: 0, field: 'id' } } });
  });

  it('refuses a ref to a later or unknown step', () => {
    expect(() => buildBatch([{ command: 'node.create', params: { parent: { $ref: 'later' } } }, { as: 'later', command: 'node.create', params: {} }])).toThrow(
      'unknown step "later"',
    );
  });

  it('refuses a name used twice', () => {
    expect(() => buildBatch([{ as: 'x', command: 'a', params: {} }, { as: 'x', command: 'a', params: {} }])).toThrow('step name "x" used twice');
  });
});
