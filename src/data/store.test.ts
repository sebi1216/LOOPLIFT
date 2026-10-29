import { emptyData, lenaData, ops, type AppData } from './store';

const lena = () => lenaData('en');

test('Lena starts with 20 lifts, Push and Pull, and her loop; Mia starts empty', () => {
  const d = lena();
  expect(d.exercises).toHaveLength(20);
  expect(d.exercises[0].name).toBe('Bench Press');
  expect(d.workouts.map((w) => w.name)).toEqual(['Push', 'Pull']);
  const mia = emptyData('en');
  expect(mia.workouts).toEqual([]);
  expect(mia.schedule.rotation).toBeNull();
  expect(mia.exercises).toHaveLength(20); // the starter library is there from the first launch
});

test('German starter names', () => {
  expect(lenaData('de').exercises[0].name).toBe('Bankdrücken');
});

test('addWorkout returns the new id; duplicate copies exercises with a new id', () => {
  const [d1, id] = ops.addWorkout(lena(), 'Legs');
  expect(d1.workouts.find((w) => w.id === id)?.name).toBe('Legs');
  const [d2, copyId] = ops.duplicateWorkout(d1, 'w1', 'Push copy');
  const copy = d2.workouts.find((w) => w.id === copyId)!;
  expect(copy.name).toBe('Push copy');
  expect(copy.exercises).toEqual(d2.workouts[0].exercises);
  expect(copy.exercises).not.toBe(d2.workouts[0].exercises);
  expect(new Set(d2.workouts.map((w) => w.id)).size).toBe(d2.workouts.length);
});

test('deleting a workout removes it from the loop and from days set by hand', () => {
  let d: AppData = lena();
  d = ops.setDay(d, '2026-11-10', { kind: 'workout', workoutId: 'w2' });
  d = ops.deleteWorkout(d, 'w2');
  expect(d.workouts.map((w) => w.id)).toEqual(['w1']);
  expect(d.schedule.rotation!.slots).toEqual(['w1', 'rest']);
  expect(d.schedule.entries['2026-11-10']).toBeUndefined();
});

test('deleting an exercise removes it from workouts; usedIn names the workouts', () => {
  const d0 = lena();
  expect(ops.usedIn(d0, 'e1')).toEqual(['Push']);
  expect(ops.usedIn(d0, 'e9')).toEqual([]);
  const d = ops.deleteExercise(d0, 'e1');
  expect(d.exercises.find((e) => e.id === 'e1')).toBeUndefined();
  expect(d.workouts[0].exercises.map((e) => e.exerciseId)).toEqual(['e2', 'e3', 'e4']);
});

test('move reorders and keeps every item', () => {
  expect(ops.move(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  expect(ops.move(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  expect(ops.move(['a', 'b'], 0, 5)).toEqual(['b', 'a']);
});

test('setTarget keeps sets and reps between 1 and 99', () => {
  let d = ops.setTarget(lena(), 'w1', 0, { targetSets: 0, targetReps: 120 });
  expect(d.workouts[0].exercises[0]).toMatchObject({ targetSets: 1, targetReps: 99 });
  d = ops.setTarget(d, 'w1', 0, { targetSets: 5 });
  expect(d.workouts[0].exercises[0]).toMatchObject({ targetSets: 5, targetReps: 99 });
});

test('a new exercise gets a unique id; empty names are refused', () => {
  const [d, id] = ops.addExercise(lena(), '  Hip Thrust ', 'legs');
  expect(d.exercises.find((e) => e.id === id)).toMatchObject({ name: 'Hip Thrust', muscleGroup: 'legs' });
  expect(ops.addExercise(d, '   ', 'legs')[1]).toBeNull();
});

test('a workout name is never saved empty', () => {
  const d = ops.updateWorkout(lena(), 'w1', { name: '   ' });
  expect(d.workouts[0].name).toBe('Push');
  expect(ops.updateWorkout(d, 'w1', { name: 'Push A' }).workouts[0].name).toBe('Push A');
});
