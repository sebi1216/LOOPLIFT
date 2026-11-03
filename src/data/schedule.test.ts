import { addDays, applySkips, clearDay, daysBetween, pushBack, recentSkips, replaceDay, resolveDay, resolveRange, type Schedule } from './schedule';

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

describe('skipped days', () => {
  const start = (checkedUntil?: string): Schedule => ({
    rotation: { startDate: '2026-11-02', slots: ['w1', 'w2', 'rest'] },
    entries: {},
    shifts: [],
    ...(checkedUntil ? { checkedUntil } : {}),
  });
  const plan = (s: Schedule, date: string) => {
    const p = resolveDay(s, date).plan;
    return p?.kind === 'workout' ? p.workoutId : p?.kind;
  };

  test('a past workout day without a workout becomes Rest and the loop waits', () => {
    const s = applySkips(start('2026-11-02'), new Set(), '2026-11-03');
    expect(s.shifts).toEqual(['2026-11-02']);
    expect(plan(s, '2026-11-02')).toBe('rest');
    expect(plan(s, '2026-11-03')).toBe('w1');
    expect(s.checkedUntil).toBe('2026-11-03');
  });

  test('several days away: each one skips, and the loop is still on the same workout', () => {
    const s = applySkips(start('2026-11-02'), new Set(), '2026-11-06');
    expect(s.shifts).toEqual(['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05']);
    expect(plan(s, '2026-11-06')).toBe('w1');
  });

  test('a day you trained stays, and today is never judged', () => {
    const s = applySkips(start('2026-11-02'), new Set(['2026-11-02']), '2026-11-03');
    expect(s.shifts).toEqual([]);
    expect(plan(s, '2026-11-03')).toBe('w2');
  });

  test('a rest day in the loop is not a skip', () => {
    const s = applySkips(start('2026-11-04'), new Set(), '2026-11-05');
    expect(s.shifts).toEqual([]);
  });

  test('a day set by hand is left alone', () => {
    const s = applySkips({ ...start('2026-11-02'), entries: { '2026-11-02': { kind: 'workout', workoutId: 'w2' } } }, new Set(), '2026-11-03');
    expect(s.shifts).toEqual([]);
  });

  test('put back: the day is not skipped again and the loop moves back', () => {
    const skipped = applySkips(start('2026-11-02'), new Set(), '2026-11-03');
    const back = applySkips(clearDay(skipped, '2026-11-02'), new Set(), '2026-11-03');
    expect(back.shifts).toEqual([]);
    expect(plan(back, '2026-11-03')).toBe('w2');
    const nextDay = applySkips(back, new Set(), '2026-11-04');
    expect(nextDay.shifts).toEqual(['2026-11-03']);
  });

  test('a save from before this feature only starts counting from today', () => {
    const s = applySkips(start(), new Set(), '2026-11-10');
    expect(s.shifts).toEqual([]);
    expect(s.checkedUntil).toBe('2026-11-10');
  });

  test('nothing to do returns the same object, so nothing is saved', () => {
    const s = start('2026-11-05');
    expect(applySkips(s, new Set(), '2026-11-05')).toBe(s);
    const none: Schedule = { rotation: null, entries: {}, shifts: [] };
    expect(applySkips(none, new Set(), '2026-11-05')).toBe(none);
  });

  test('recentSkips: the last 7 days, oldest first, never today', () => {
    const s = { ...start(), shifts: ['2026-10-20', '2026-10-29', '2026-11-04', '2026-11-05'] };
    expect(recentSkips(s, '2026-11-05')).toEqual(['2026-10-29', '2026-11-04']);
  });
});
