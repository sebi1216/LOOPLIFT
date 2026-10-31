import { comebackSessions, demoSessions } from './demo';
import { hintFor, newRecords, roundKg } from './hints';
import { history, type Session } from './tracker';

// One finished session of one lift: sets as [kg, reps] pairs, target 4 x 6 unless given.
function s(id: string, date: string, sets: [number, number][], target: [number, number] = [4, 6], exerciseId = 'e1'): Session {
  return {
    id,
    date,
    workoutId: 'w1',
    workoutName: 'Push',
    finished: true,
    exercises: [
      { exerciseId, targetSets: target[0], targetReps: target[1], sets: sets.map(([kg, reps]) => ({ kg, reps, done: true })) },
    ],
  };
}
const four = (kg: number, reps = 6): [number, number][] => [[kg, reps], [kg, reps], [kg, reps], [kg, reps]];
const hint = (sessions: Session[], today: string, group: 'chest' | 'legs' = 'chest') => hintFor(history(sessions, 'e1'), group, today);

describe('roundKg', () => {
  it('rounds to the nearest 2.5 kg, or down when asked', () => {
    expect(roundKg(26.5)).toBe(27.5);
    expect(roundKg(66.5)).toBe(67.5);
    expect(roundKg(58.5, 'down')).toBe(57.5);
    expect(roundKg(52, 'down')).toBe(50);
  });
});

describe('hintFor', () => {
  it('gives no hint without history', () => {
    expect(hint([], '2026-11-05')).toBeNull();
  });

  it('adds 2.5 kg (upper body) after every rep in the last 2 sessions at the same weight', () => {
    const h = hint([s('a', '2026-10-30', four(65)), s('b', '2026-11-02', four(65))], '2026-11-05');
    expect(h).toEqual({ kind: 'up', kg: 67.5, from: 65, sessions: 2, reps: 6 });
  });

  it('adds 5 kg for legs', () => {
    const h = hint([s('a', '2026-10-30', four(100)), s('b', '2026-11-02', four(100))], '2026-11-05', 'legs');
    expect(h).toMatchObject({ kind: 'up', kg: 105 });
  });

  it('counts all the sessions in a row at that weight with every rep', () => {
    const h = hint([s('a', '2026-10-27', four(65)), s('b', '2026-10-30', four(65)), s('c', '2026-11-02', four(65))], '2026-11-05');
    expect(h).toMatchObject({ kind: 'up', sessions: 3 });
  });

  it('stays the same after only one full session at a new weight', () => {
    const h = hint([s('a', '2026-10-30', four(62.5)), s('b', '2026-11-02', four(65))], '2026-11-05');
    expect(h).toEqual({ kind: 'same', kg: 65 });
  });

  it('does not add weight when a set missed its reps or a set is missing', () => {
    const missed: [number, number][] = [[65, 6], [65, 6], [65, 6], [65, 5]];
    expect(hint([s('a', '2026-10-30', four(65)), s('b', '2026-11-02', missed)], '2026-11-05')).toMatchObject({ kind: 'same' });
    const three: [number, number][] = [[65, 6], [65, 6], [65, 6]];
    expect(hint([s('a', '2026-10-30', four(65)), s('b', '2026-11-02', three)], '2026-11-05')).toMatchObject({ kind: 'same' });
  });

  it('says stay and aim for 1 more rep after 3+ sessions at one weight without every rep', () => {
    const missed: [number, number][] = [[24, 10], [24, 10], [24, 9]];
    const h = hint(
      [s('a', '2026-10-27', missed, [3, 10]), s('b', '2026-10-30', missed, [3, 10]), s('c', '2026-11-02', missed, [3, 10])],
      '2026-11-05',
    );
    expect(h).toEqual({ kind: 'stay', kg: 24, reps: 10, sessions: 3 });
  });

  it('welcomes back at about 90% after 14 to 27 days off, rounded down', () => {
    const h = hint([s('a', '2026-10-10', four(65))], '2026-11-05');
    expect(h).toEqual({ kind: 'comeback', kg: 57.5, from: 65, days: 26, percent: 90 });
    expect(hint([s('a', '2026-10-22', four(65))], '2026-11-05')).toMatchObject({ kind: 'comeback', days: 14 });
    expect(hint([s('a', '2026-10-23', four(65))], '2026-11-05')).toMatchObject({ kind: 'same' });
  });

  it('welcomes back at about 80% after 28 days or more', () => {
    expect(hint([s('a', '2026-10-08', four(65))], '2026-11-05')).toEqual({ kind: 'comeback', kg: 50, from: 65, days: 28, percent: 80 });
  });

  it('gives bodyweight lifts the same as last time', () => {
    expect(hint([s('a', '2026-10-30', four(0, 8)), s('b', '2026-11-02', four(0, 8))], '2026-11-05')).toEqual({ kind: 'same', kg: 0 });
  });
});

describe('newRecords', () => {
  it('finds a set heavier than every earlier one, with how much over the best', () => {
    const sessions = [s('a', '2026-10-30', four(65)), s('b', '2026-11-05', four(67.5))];
    expect(newRecords(sessions, 'b')).toEqual([{ exerciseId: 'e1', kg: 67.5, reps: 6, overBy: 2.5 }]);
  });

  it('counts more reps at the same weight as a record', () => {
    const sessions = [s('a', '2026-10-30', four(65)), s('b', '2026-11-05', [[65, 7]])];
    expect(newRecords(sessions, 'b')).toEqual([{ exerciseId: 'e1', kg: 65, reps: 7, overBy: 0 }]);
  });

  it('never counts the first session of a lift, or a set that only ties', () => {
    expect(newRecords([s('a', '2026-11-05', four(65))], 'a')).toEqual([]);
    expect(newRecords([s('a', '2026-10-30', four(65)), s('b', '2026-11-05', four(65))], 'b')).toEqual([]);
  });
});

describe("Lena's demo log on Thu 5 Nov", () => {
  it('gives the hints the design shows', () => {
    const sessions = demoSessions();
    const h = (id: string, group: 'chest' | 'shoulders' | 'arms') => hintFor(history(sessions, id), group, '2026-11-05');
    expect(h('e1', 'chest')).toMatchObject({ kind: 'up', kg: 67.5 });
    expect(h('e2', 'chest')).toMatchObject({ kind: 'stay', kg: 24, reps: 10 });
    expect(h('e3', 'shoulders')).toMatchObject({ kind: 'up', kg: 42.5 });
  });

  it('welcomes Lena back in the comeback state', () => {
    expect(hintFor(history(comebackSessions(), 'e1'), 'chest', '2026-11-05')).toEqual({ kind: 'comeback', kg: 57.5, from: 65, days: 26, percent: 90 });
  });
});
