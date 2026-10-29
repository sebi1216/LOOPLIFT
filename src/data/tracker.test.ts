import type { Workout } from './demo';
import {
  deleteSession,
  doneDates,
  editSet,
  finishSession,
  history,
  parseKg,
  parseReps,
  restoreSession,
  startSession,
  topSet,
  type Session,
} from './tracker';

const push: Workout = {
  id: 'w1',
  name: 'Push',
  exercises: [
    { exerciseId: 'e1', targetSets: 4, targetReps: 6 },
    { exerciseId: 'e3', targetSets: 3, targetReps: 8 },
  ],
};

const set = (kg: number | null, reps: number, done = true) => ({ kg, reps, done });

// A finished Push: Bench 3 sets (fewer than the 4 the workout asks for), no Overhead Press.
const lastPush: Session = {
  id: 's1',
  date: '2026-11-02',
  workoutId: 'w1',
  workoutName: 'Push',
  finished: true,
  exercises: [{ exerciseId: 'e1', targetSets: 4, targetReps: 6, sets: [set(65, 6), set(65, 6), set(62.5, 5)] }],
};
const olderPush: Session = {
  ...lastPush,
  id: 's0',
  date: '2026-10-30',
  exercises: [{ exerciseId: 'e1', targetSets: 4, targetReps: 6, sets: [set(62.5, 6), set(62.5, 6), set(62.5, 6), set(62.5, 6)] }],
};

describe('parseKg', () => {
  test('comma or point, steps of 0.5 from 0 to 999.5', () => {
    expect(parseKg('62,5')).toBe(62.5);
    expect(parseKg('62.5')).toBe(62.5);
    expect(parseKg(' 60 ')).toBe(60);
    expect(parseKg('0')).toBe(0);
    expect(parseKg('999.5')).toBe(999.5);
  });
  test('anything else is refused', () => {
    for (const bad of ['', '1000', '62.3', '-5', 'abc', '6 5', '1e2', '62,', '.5.']) expect(parseKg(bad)).toBeNull();
  });
});

test('parseReps: whole numbers from 0 to 99', () => {
  expect(parseReps('8')).toBe(8);
  expect(parseReps('0')).toBe(0);
  expect(parseReps('99')).toBe(99);
  for (const bad of ['', '100', '7.5', '-1', 'x']) expect(parseReps(bad)).toBeNull();
});

describe('startSession', () => {
  test('first time: sets from the targets, reps = target, kg empty, nothing ticked', () => {
    const [sessions, s] = startSession([], push, '2026-11-05', 'n1');
    expect(sessions).toEqual([s]);
    expect(s).toMatchObject({ id: 'n1', date: '2026-11-05', workoutId: 'w1', workoutName: 'Push', finished: false });
    expect(s.exercises[1]).toEqual({ exerciseId: 'e3', targetSets: 3, targetReps: 8, sets: [set(null, 8, false), set(null, 8, false), set(null, 8, false)] });
  });

  test('prefill per set from the last finished session of that lift; fewer sets last time repeat its last set', () => {
    const [, s] = startSession([olderPush, lastPush], push, '2026-11-05', 'n1');
    expect(s.exercises[0].sets).toEqual([set(65, 6, false), set(65, 6, false), set(62.5, 5, false), set(62.5, 5, false)]);
  });

  test('the last finished session wins by date, not by list order', () => {
    const [, s] = startSession([lastPush, olderPush], push, '2026-11-05', 'n1');
    expect(s.exercises[0].sets[0]).toEqual(set(65, 6, false));
  });

  test('only one open session: starting again returns it', () => {
    const [sessions, s] = startSession([lastPush], push, '2026-11-05', 'n1');
    const [again, same] = startSession(sessions, push, '2026-11-05', 'n2');
    expect(same).toBe(s);
    expect(again).toBe(sessions);
  });

  test('the session is its own copy: changing the workout later does not touch it', () => {
    const w: Workout = { ...push, exercises: push.exercises.map((e) => ({ ...e })) };
    const [, s] = startSession([], w, '2026-11-05', 'n1');
    w.exercises.push({ exerciseId: 'e4', targetSets: 3, targetReps: 12 });
    expect(s.exercises).toHaveLength(2);
  });
});

describe('finishSession', () => {
  test('drops unticked sets and lifts with none ticked', () => {
    const open: Session = {
      ...lastPush,
      id: 'n1',
      finished: false,
      exercises: [
        { exerciseId: 'e1', targetSets: 2, targetReps: 6, sets: [set(65, 6), set(65, 6, false)] },
        { exerciseId: 'e3', targetSets: 1, targetReps: 8, sets: [set(40, 8, false)] },
      ],
    };
    const out = finishSession([lastPush, open], 'n1');
    expect(out).toHaveLength(2);
    expect(out[1]).toMatchObject({ finished: true, exercises: [{ exerciseId: 'e1', sets: [set(65, 6)] }] });
  });

  test('a session with no ticked set is discarded', () => {
    const open: Session = { ...lastPush, id: 'n1', finished: false, exercises: [{ ...lastPush.exercises[0], sets: [set(65, 6, false)] }] };
    expect(finishSession([lastPush, open], 'n1')).toEqual([lastPush]);
  });
});

describe('history', () => {
  test('topSet: most kg, tie goes to more reps, empty kg counts as 0', () => {
    expect(topSet([set(60, 8), set(65, 5), set(65, 6), set(62.5, 10)])).toEqual(set(65, 6));
    expect(topSet([set(null, 8), set(0, 10)])).toEqual(set(0, 10));
    expect(topSet([])).toBeNull();
  });

  test('history of a lift: finished only, oldest first, with the top set', () => {
    const open: Session = { ...lastPush, id: 'open', date: '2026-11-05', finished: false };
    const h = history([lastPush, open, olderPush], 'e1');
    expect(h.map((x) => [x.session.id, x.top])).toEqual([
      ['s0', set(62.5, 6)],
      ['s1', set(65, 6)],
    ]);
    expect(history([lastPush], 'e9')).toEqual([]);
  });

  test('doneDates: dates with a finished session', () => {
    const open: Session = { ...lastPush, id: 'open', date: '2026-11-05', finished: false };
    expect(doneDates([lastPush, open, olderPush])).toEqual(new Set(['2026-11-02', '2026-10-30']));
  });
});

describe('editing past sessions', () => {
  test('editSet changes one set and leaves the rest', () => {
    const out = editSet([olderPush, lastPush], 's1', 0, 2, { kg: 65, reps: 6 });
    expect(out[1].exercises[0].sets).toEqual([set(65, 6), set(65, 6), set(65, 6)]);
    expect(out[0]).toBe(olderPush);
    expect(lastPush.exercises[0].sets[2]).toEqual(set(62.5, 5)); // the old one is untouched
  });

  test('deleteSession and restoreSession put it back in the same place', () => {
    const third: Session = { ...lastPush, id: 's2', date: '2026-11-03' };
    const all = [olderPush, lastPush, third];
    const [rest, removed] = deleteSession(all, 's1');
    expect(rest.map((s) => s.id)).toEqual(['s0', 's2']);
    expect(removed).toEqual({ session: lastPush, index: 1 });
    expect(restoreSession(rest, removed!)).toEqual(all);
    expect(deleteSession(all, 'nope')).toEqual([all, null]);
  });
});
