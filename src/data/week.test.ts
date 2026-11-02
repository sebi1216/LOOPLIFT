import type { Schedule } from './schedule';
import type { Session } from './tracker';
import { weekProgress } from './week';

const schedule: Schedule = { rotation: { startDate: '2026-11-02', slots: ['w1', 'w2', 'rest'] }, entries: {}, shifts: [] };
const done = (date: string, finished = true): Session => ({ id: date, date, workoutId: 'w1', workoutName: 'Push', exercises: [], finished });

test('the week runs Monday to Sunday and counts planned workouts', () => {
  // Mon 2 to Sun 8 Nov: Push Pull Rest Push Pull Rest Push = 5 workouts.
  expect(weekProgress(schedule, [], '2026-11-05')).toEqual({ done: 0, total: 5 });
  expect(weekProgress(schedule, [], '2026-11-08')).toEqual({ done: 0, total: 5 });
});

test('finished workouts this week count; open ones and other weeks do not', () => {
  const sessions = [done('2026-11-02'), done('2026-11-03'), done('2026-11-01'), done('2026-11-05', false)];
  expect(weekProgress(schedule, sessions, '2026-11-05')).toEqual({ done: 2, total: 5 });
});

test('two workouts on one day count once', () => {
  expect(weekProgress(schedule, [done('2026-11-02'), { ...done('2026-11-02'), id: 'x' }], '2026-11-05').done).toBe(1);
});

test('more workouts than planned raise the total, so it never reads 6 of 5', () => {
  const none: Schedule = { rotation: { startDate: '2026-11-02', slots: ['rest'] }, entries: {}, shifts: [] };
  expect(weekProgress(none, [done('2026-11-02')], '2026-11-05')).toEqual({ done: 1, total: 1 });
});
