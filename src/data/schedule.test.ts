import { addDays, clearDay, daysBetween, pushBack, replaceDay, resolveDay, resolveRange, type Schedule } from './schedule';

// The example loop from the brief: Push, Pull, Rest starting Monday 2 Nov 2026.
const lena: Schedule = {
  rotation: { startDate: '2026-11-02', slots: ['w1', 'w2', 'rest'] },
  entries: {},
  shifts: [],
};

const names = (s: Schedule, from: string, n: number) =>
  resolveRange(s, from, n).map((d) => (d.plan === null ? '-' : d.plan.kind === 'rest' ? 'rest' : d.plan.workoutId));

describe('date math', () => {
  test('addDays crosses month and year ends', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-11-02', -2)).toBe('2026-10-31');
  });
  test('daysBetween ignores daylight saving (EU clocks change 25 Oct 2026)', () => {
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2);
    expect(daysBetween('2026-11-02', '2026-11-02')).toBe(0);
    expect(daysBetween('2026-11-05', '2026-11-02')).toBe(-3);
  });
});

describe('resolveDay', () => {
  test('the loop repeats from the start date', () => {
    expect(names(lena, '2026-11-02', 7)).toEqual(['w1', 'w2', 'rest', 'w1', 'w2', 'rest', 'w1']);
  });

  test('Thursday 5 Nov is Push, day 1 of 3', () => {
    const d = resolveDay(lena, '2026-11-05');
    expect(d.plan).toEqual({ kind: 'workout', workoutId: 'w1' });
    expect(d.source).toBe('loop');
    expect(d.slotIndex).toBe(0);
    expect(d.slotCount).toBe(3);
  });

  test('days before the start date have no plan', () => {
    const d = resolveDay(lena, '2026-10-28');
    expect(d.plan).toBeNull();
    expect(d.source).toBe('beforeStart');
  });

  test('no loop and no entries: nothing planned', () => {
    const empty: Schedule = { rotation: null, entries: {}, shifts: [] };
    expect(resolveDay(empty, '2026-11-05')).toMatchObject({ plan: null, source: 'none' });
  });

  test('a day set by hand wins, even before the start date', () => {
    const s: Schedule = { ...lena, entries: { '2026-10-30': { kind: 'workout', workoutId: 'w2' } } };
    expect(resolveDay(s, '2026-10-30')).toMatchObject({ plan: { kind: 'workout', workoutId: 'w2' }, source: 'manual' });
  });
});

describe('Replace this day only', () => {
  test('changes one day; the loop around it stays as it is', () => {
    const s = replaceDay(lena, '2026-11-05', { kind: 'rest' });
    expect(names(s, '2026-11-04', 5)).toEqual(['rest', 'rest', 'w2', 'rest', 'w1']);
    expect(resolveDay(s, '2026-11-05').source).toBe('manual');
    expect(lena.entries).toEqual({}); // pure: the input is not changed
  });

  test('clearDay puts the loop back', () => {
    const s = clearDay(replaceDay(lena, '2026-11-05', { kind: 'rest' }), '2026-11-05');
    expect(names(s, '2026-11-05', 1)).toEqual(['w1']);
    expect(resolveDay(s, '2026-11-05').source).toBe('loop');
  });
});

describe('Push the loop back', () => {
  test('today becomes Rest and every day after shifts by one (design preview: Rest, Push, Pull, Rest)', () => {
    const s = pushBack(lena, '2026-11-05');
    expect(names(s, '2026-11-05', 4)).toEqual(['rest', 'w1', 'w2', 'rest']);
    expect(resolveDay(s, '2026-11-05').source).toBe('shift');
    expect(names(s, '2026-11-02', 3)).toEqual(['w1', 'w2', 'rest']); // days before stay
  });

  test('two push-backs stack', () => {
    const s = pushBack(pushBack(lena, '2026-11-05'), '2026-11-07');
    // 5 rest(shift), 6 Push, 7 rest(shift), 8 Pull, 9 Rest, 10 Push
    expect(names(s, '2026-11-05', 6)).toEqual(['rest', 'w1', 'rest', 'w2', 'rest', 'w1']);
  });

  test('pushing back the same day twice changes nothing more', () => {
    const once = pushBack(lena, '2026-11-05');
    expect(pushBack(once, '2026-11-05')).toEqual(once);
  });

  test('pushing back a day set by hand drops the hand-set plan', () => {
    const s = pushBack(replaceDay(lena, '2026-11-05', { kind: 'workout', workoutId: 'w2' }), '2026-11-05');
    expect(resolveDay(s, '2026-11-05')).toMatchObject({ plan: { kind: 'rest' }, source: 'shift' });
  });

  test('a hand-set day after a push-back still wins, the rest stays shifted', () => {
    const s = replaceDay(pushBack(lena, '2026-11-05'), '2026-11-06', { kind: 'rest' });
    expect(names(s, '2026-11-05', 4)).toEqual(['rest', 'rest', 'w2', 'rest']);
  });

  test('clearDay on a pushed-back day undoes the push', () => {
    const s = clearDay(pushBack(lena, '2026-11-05'), '2026-11-05');
    expect(names(s, '2026-11-05', 3)).toEqual(['w1', 'w2', 'rest']);
  });
});
