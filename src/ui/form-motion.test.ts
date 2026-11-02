import { starterLifts } from '@/data/demo';
import { hasString, t, type StringKey } from '@/i18n';

import { demos } from './form-demos';
import { LIMBS, pathsAt, poseAt, VIEW_H, VIEW_W } from './form-motion';

const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const moments = [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 1];
const ids = starterLifts.map((l) => l.id);

test('every starter lift has a demo, and no demo is left over', () => {
  expect(Object.keys(demos).sort()).toEqual([...ids].sort());
});

test('no two lifts move the same (decision #14)', () => {
  const seen = new Map<string, string>();
  for (const id of ids) {
    const d = demos[id];
    const look = JSON.stringify([d.frames, d.props, d.front ?? false]);
    expect(seen.get(look)).toBeUndefined();
    seen.set(look, id);
  }
});

describe.each(ids)('%s', (id) => {
  const d = demos[id];

  test('elbows and knees keep the limb lengths at every moment', () => {
    for (const at of moments) {
      const p = poseAt(d, at);
      expect(dist(p.shoulderR, p.elbow)).toBeCloseTo(LIMBS.UPPER_ARM, 1);
      expect(dist(p.elbow, p.hand)).toBeCloseTo(LIMBS.FOREARM, 1);
      expect(dist(p.hipR, p.knee)).toBeCloseTo(LIMBS.THIGH, 1);
      expect(dist(p.knee, p.foot)).toBeCloseTo(LIMBS.SHIN, 1);
    }
  });

  test('the figure stays on the grid at every moment', () => {
    for (const at of moments) {
      const p = poseAt(d, at);
      for (const q of [p.hip, p.shoulder, p.head, p.hand, p.elbow, p.foot, p.knee]) {
        expect(q[0]).toBeGreaterThanOrEqual(0);
        expect(q[0]).toBeLessThanOrEqual(VIEW_W);
        expect(q[1]).toBeGreaterThanOrEqual(0);
        expect(q[1]).toBeLessThanOrEqual(VIEW_H);
      }
    }
  });

  test('a foot planted in every pose does not slide', () => {
    const planted = d.frames.every((f) => f.foot[0] === d.frames[0].foot[0] && f.foot[1] === d.frames[0].foot[1]);
    if (!planted) return;
    const want = poseAt(d, 0).foot;
    for (const at of moments) expect(dist(poseAt(d, at).foot, want)).toBeLessThan(1.5);
  });

  test('it really moves, and the paths are drawable', () => {
    const a = pathsAt(d, 0);
    const b = pathsAt(d, 1);
    expect(a.body + a.head).not.toEqual(b.body + b.head);
    for (const s of [a.body, a.head, b.body, b.head]) expect(s).not.toMatch(/NaN|undefined/);
  });

  test('it has words: phases, three cues and one thing to avoid, in both languages', () => {
    for (const locale of ['en', 'de'] as const) {
      for (const phase of d.phases) expect(t(`form.phase.${phase}` as StringKey, {}, locale)).not.toBe('');
      expect(t(`cue.${id}` as StringKey, {}, locale).split('|')).toHaveLength(3);
      expect(hasString(`avoid.${id}`)).toBe(true);
      expect(t(`avoid.${id}` as StringKey, {}, locale).length).toBeGreaterThan(5);
    }
  });
});
