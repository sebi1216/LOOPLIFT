import type { Exercise } from './demo';
import { activeYears, e1rm, gymDays, mondayOf, strengthByGroup, weekStreak, yearWeeks } from './progress';
import type { Session } from './tracker';

const set = (kg: number | null, reps: number) => ({ kg, reps, done: true });
const s = (id: string, date: string, ex: [string, number | null, number][], finished = true): Session => ({
  id,
  date,
  workoutId: 'w1',
  workoutName: 'Push',
  finished,
  exercises: ex.map(([exerciseId, kg, reps]) => ({ exerciseId, targetSets: 1, targetReps: reps, sets: [set(kg, reps)] })),
});

const lib: Exercise[] = [
  { id: 'bench', name: 'Bench Press', muscleGroup: 'chest' },
  { id: 'fly', name: 'Fly', muscleGroup: 'chest' },
  { id: 'squat', name: 'Squat', muscleGroup: 'legs' },
  { id: 'pullup', name: 'Pull-up', muscleGroup: 'back' },
];

describe('e1rm (estimated one-rep max, Epley)', () => {
  test('one rep is the weight itself; more reps estimate higher, rounded to 0.5 kg', () => {
    expect(e1rm(100, 1)).toBe(100);
    expect(e1rm(60, 10)).toBe(80);
    expect(e1rm(65, 6)).toBe(78);
  });
  test('no weight or no reps gives 0 (bodyweight is unknown, so it is left out)', () => {
    expect(e1rm(0, 8)).toBe(0);
    expect(e1rm(null, 8)).toBe(0);
    expect(e1rm(50, 0)).toBe(0);
  });
  test('reps above 12 add nothing: a light set of 30 never beats a real heavy one', () => {
    expect(e1rm(20, 12)).toBe(28);
    expect(e1rm(20, 30)).toBe(28);
  });
});

describe('strengthByGroup', () => {
  const today = '2026-11-05';
  const sessions = [
    s('a', '2026-09-01', [['bench', 60, 10], ['squat', 100, 1]]),
    s('b', '2026-10-30', [['bench', 70, 10]]),
    s('c', '2026-11-04', [['bench', 75, 10], ['fly', 30, 1]]),
    s('open', '2026-11-05', [['bench', 200, 1]], false),
    s('p', '2026-11-04', [['pullup', 0, 8]]),
  ];

  test('All: start is each lift\'s first session, now its best; groups add up their lifts', () => {
    const r = strengthByGroup(sessions, lib, 'all', today);
    // bench 80 -> 100, fly 30 -> 30 (first seen this week, so it is its own start)
    expect(r.groups.chest).toEqual({ start: 110, now: 130 });
    expect(r.groups.legs).toEqual({ start: 100, now: 100 });
    expect(r.change).toBeCloseTo((230 - 210) / 210);
  });

  test('Week: start is the best before the week began', () => {
    const r = strengthByGroup(sessions, lib, 'week', today);
    // bench before 30 Oct... week starts 30 Oct (today - 6): best before it is 80 (1 Sep)
    expect(r.groups.chest).toEqual({ start: 110, now: 130 });
    const m = strengthByGroup(sessions, lib, 'month', today);
    expect(m.groups.chest).toEqual({ start: 110, now: 130 });
  });

  test('Week with an earlier best inside the window: start comes from before it', () => {
    const r = strengthByGroup(sessions, lib, 'week', '2026-11-12');
    // week starts 6 Nov: before it bench best is 100, fly 30
    expect(r.groups.chest).toEqual({ start: 130, now: 130 });
    expect(r.change).toBe(0);
  });

  test('a group with no sets has no data (null), never 0 kg; open sessions do not count', () => {
    const r = strengthByGroup(sessions, lib, 'all', today);
    expect(r.groups.core).toBeNull();
    expect(r.groups.chest?.now).toBe(130);
  });

  test('a group with only bodyweight sets counts its best reps, marked as reps, and stays out of the kg change', () => {
    const pullups = [s('p1', '2026-09-01', [['pullup', 0, 6]]), s('p2', '2026-11-04', [['pullup', 0, 10]])];
    const r = strengthByGroup([...sessions, ...pullups], lib, 'all', today);
    expect(r.groups.back).toEqual({ start: 6, now: 10 });
    expect(r.repsOnly).toEqual(['back']);
    expect(r.change).toBeCloseTo((230 - 210) / 210);
  });

  test('a group with a weighted lift stays in kg, its bodyweight lifts left out', () => {
    const backLib: Exercise[] = [...lib, { id: 'row', name: 'Row', muscleGroup: 'back' }];
    const r = strengthByGroup([s('r', '2026-11-04', [['row', 50, 1], ['pullup', 0, 8]])], backLib, 'all', today);
    expect(r.groups.back).toEqual({ start: 50, now: 50 });
    expect(r.repsOnly).toEqual([]);
  });

  test('only bodyweight sets at all: reps per group, no overall kg change', () => {
    const r = strengthByGroup([s('p', '2026-11-04', [['pullup', 0, 8]])], lib, 'all', today);
    expect(r.groups.back).toEqual({ start: 8, now: 8 });
    expect(r.change).toBeNull();
  });

  test('no sessions at all: every group null, no change', () => {
    const r = strengthByGroup([], lib, 'all', today);
    expect(Object.values(r.groups).every((g) => g === null)).toBe(true);
    expect(r.change).toBeNull();
  });

  test('workouts and sets in the period', () => {
    expect(strengthByGroup(sessions, lib, 'week', today)).toMatchObject({ workouts: 3, sets: 4 });
    expect(strengthByGroup(sessions, lib, 'all', today)).toMatchObject({ workouts: 4, sets: 6 });
  });
});

describe('gym days', () => {
  test('finished sessions only, sets counted per day', () => {
    const days = gymDays([s('a', '2026-11-02', [['bench', 60, 5], ['fly', 20, 5]]), s('b', '2026-11-03', [['bench', 60, 5]], false)]);
    expect(days.get('2026-11-02')).toBe(2);
    expect(days.has('2026-11-03')).toBe(false);
  });

  test('mondayOf', () => {
    expect(mondayOf('2026-11-05')).toBe('2026-11-02');
    expect(mondayOf('2026-11-02')).toBe('2026-11-02');
    expect(mondayOf('2026-11-08')).toBe('2026-11-02');
  });

  test('a year as week columns: Monday on top, every day once, nothing from the next year', () => {
    const weeks = yearWeeks(2026);
    // 1 Jan 2026 is a Thursday: three empty cells first
    expect(weeks[0].slice(0, 4)).toEqual([null, null, null, '2026-01-01']);
    expect(weeks.flat().filter(Boolean)).toHaveLength(365);
    expect(weeks.at(-1)!.filter(Boolean).at(-1)).toBe('2026-12-31');
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(yearWeeks(2024).flat().filter(Boolean)).toHaveLength(366);
  });

  test('only the years with a workout, newest first, up to today', () => {
    const days = new Map([['2024-03-01', 5], ['2026-11-02', 5], ['2026-01-02', 5], ['2027-01-01', 5]]);
    expect(activeYears(days, '2026-11-05')).toEqual([2026, 2024]);
    expect(activeYears(new Map(), '2026-11-05')).toEqual([]);
  });

  test('week streak: weeks in a row with at least one workout; this week may still be empty', () => {
    const done = new Set(['2026-10-20', '2026-10-28', '2026-11-03']);
    expect(weekStreak(done, '2026-11-05')).toBe(3);
    // a week with none breaks it
    expect(weekStreak(new Set(['2026-10-13', '2026-11-03']), '2026-11-05')).toBe(1);
    // nothing yet this week: the streak up to last week still counts
    expect(weekStreak(new Set(['2026-10-28']), '2026-11-05')).toBe(1);
    expect(weekStreak(new Set(), '2026-11-05')).toBe(0);
  });
});
