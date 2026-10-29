import { cast, demoSchedule, demoWorkouts, starterLifts } from './demo';

test('the starter library has 60 lifts with unique ids', () => {
  expect(starterLifts.length).toBe(60);
  expect(new Set(starterLifts.map((l) => l.id)).size).toBe(starterLifts.length);
});

test('demo workouts and the loop only use lifts and workouts that exist', () => {
  const lifts = new Set(starterLifts.map((l) => l.id));
  for (const w of demoWorkouts) for (const e of w.exercises) expect(lifts.has(e.exerciseId)).toBe(true);
  const workouts = new Set(demoWorkouts.map((w) => w.id));
  for (const slot of demoSchedule.rotation!.slots) expect(slot === 'rest' || workouts.has(slot)).toBe(true);
});

test('the cast has unique ids and names', () => {
  const people = Object.values(cast);
  expect(new Set(people.map((p) => p.id)).size).toBe(people.length);
  expect(new Set(people.map((p) => p.name)).size).toBe(people.length);
});
