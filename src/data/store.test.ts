import { history } from './tracker';
import { actions, applyUrlParams, emptyData, firstLaunchData, lenaData, migrateLibrary, ops, parseSaved, serialize, type AppData } from './store';

// The phone storage is native; unit tests never touch it. mockSaveRaw records the writes.
const mockSaveRaw = jest.fn();
jest.mock('./persist', () => ({ loadRaw: () => null, saveRaw: (...args: unknown[]) => mockSaveRaw(...args) }));

const lena = () => lenaData('en');

test('Lena starts with 20 lifts, Push and Pull, and her loop; Mia starts empty', () => {
  const d = lena();
  expect(d.exercises).toHaveLength(60);
  expect(d.exercises[0].name).toBe('Bench Press');
  expect(d.workouts.map((w) => w.name)).toEqual(['Push', 'Pull']);
  const mia = emptyData('en');
  expect(mia.workouts).toEqual([]);
  expect(mia.schedule.rotation).toBeNull();
  expect(mia.exercises).toHaveLength(60); // the starter library is there from the first launch
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

test('groupByMuscle: groups in library order, search ignores case, empty groups dropped', () => {
  const all = ops.groupByMuscle(lena(), '');
  expect(all.map((g) => g.group)).toEqual(['arms', 'back', 'chest', 'core', 'legs', 'shoulders']);
  const curl = ops.groupByMuscle(lena(), '  CURL ');
  expect(curl.map((g) => [g.group, g.items.map((e) => e.id)])).toEqual([
    ['arms', ['e8', 'e19', 'e55', 'e56', 'e57']],
    ['legs', ['e25', 'e26']],
  ]);
});

describe('workout log', () => {
  test('Lena has 6 weeks of finished Push and Pull; Bench goes from 57.5 to 65 kg; Mia has none', () => {
    const s = lena().sessions;
    expect(s).toHaveLength(28);
    expect(s.every((x) => x.finished)).toBe(true);
    expect(s[0].date).toBe('2026-09-24');
    expect(s.at(-1)!.date).toBe('2026-11-03');
    const bench = history(s, 'e1');
    expect(bench).toHaveLength(14);
    expect(bench[0].top.kg).toBe(57.5);
    expect(bench.at(-1)!.top).toMatchObject({ kg: 65, reps: 6 });
    expect(emptyData('en').sessions).toEqual([]);
    expect(firstLaunchData('en').sessions).toEqual([]);
  });

  test("Let's go on Lena's Push: 4 lifts, Bench 4 sets of 65 kg x 6; starting again returns it", () => {
    const [d, id] = ops.startSession(lena(), 'w1', '2026-11-05');
    const open = d.sessions.find((x) => x.id === id)!;
    expect(open.exercises).toHaveLength(4);
    expect(open.exercises[0].sets).toEqual(Array(4).fill({ kg: 65, reps: 6, done: false }));
    expect(ops.startSession(d, 'w2', '2026-11-05')).toEqual([d, id]);
    expect(ops.startSession(lena(), 'nope', '2026-11-05')[1]).toBeNull();
  });

  test('deleting a workout keeps its sessions', () => {
    const d = ops.deleteWorkout(lena(), 'w1');
    expect(d.sessions).toHaveLength(28);
  });
});

describe('saved data', () => {
  test('first launch: no name, the starter library, no workouts, no loop', () => {
    const d = firstLaunchData('en');
    expect(d.userName).toBeNull();
    expect(d.exercises).toHaveLength(60);
    expect(d.workouts).toEqual([]);
    expect(d.schedule.rotation).toBeNull();
  });

  test('what is saved comes back the same', () => {
    let d = ops.pushBack(lena(), '2026-11-05');
    d = ops.setDay(d, '2026-11-10', { kind: 'rest' });
    expect(parseSaved(serialize(d))).toEqual(d);
  });

  test('a save from before the workout log loads with no sessions', () => {
    const { sessions: _s, ...old } = lena();
    expect(parseSaved(JSON.stringify({ v: 1, data: old }))?.sessions).toEqual([]);
  });

  test('sessions are saved and come back the same; a broken list is refused', () => {
    let d = ops.startSession(lena(), 'w1', '2026-11-05')[0];
    d = ops.setSet(d, d.sessions.at(-1)!.id, 0, 0, { kg: 67.5, done: true });
    expect(parseSaved(serialize(d))).toEqual(d);
    expect(parseSaved(JSON.stringify({ v: 1, data: { ...lena(), sessions: 'x' } }))).toBeNull();
    for (const bad of [null, {}, { id: 's', date: '2026-11-05', finished: false }, { id: 's', date: 5, finished: true, exercises: [] }]) {
      expect(parseSaved(JSON.stringify({ v: 1, data: { ...lena(), sessions: [bad] } }))).toBeNull();
    }
    expect(parseSaved(JSON.stringify({ v: 1, data: { ...lena(), sessions: [{ ...lena().sessions[0], exercises: [{ exerciseId: 'e1', sets: 'x' }] }] } }))).toBeNull();
  });

  test('broken or foreign data is ignored, never crashes the app', () => {
    expect(parseSaved(null)).toBeNull();
    expect(parseSaved('')).toBeNull();
    expect(parseSaved('{not json')).toBeNull();
    expect(parseSaved('42')).toBeNull();
    expect(parseSaved(JSON.stringify({ v: 99, data: lena() }))).toBeNull();
    expect(parseSaved(JSON.stringify({ v: 1, data: { exercises: 'x' } }))).toBeNull();
    expect(parseSaved(JSON.stringify({ v: 1, data: { ...lena(), schedule: { rotation: null } } }))).toBeNull();
  });
});

describe('library update for saved data', () => {
  // Data saved before the library grew: only the first 20 lifts, no libraryVersion.
  const oldSave = (): AppData => {
    const { libraryVersion: _v, ...rest } = lena();
    return { ...rest, exercises: rest.exercises.slice(0, 20) };
  };

  test('adds the new starter lifts once, keeps renamed and own ones', () => {
    const old = oldSave();
    old.exercises[0] = { ...old.exercises[0], name: 'Flat Bench' };
    old.exercises.push({ id: 'emine', name: 'Sled Push', muscleGroup: 'legs' });
    const d = migrateLibrary(old, 'en');
    expect(d.exercises).toHaveLength(61);
    expect(d.exercises[0].name).toBe('Flat Bench');
    expect(d.exercises.find((e) => e.id === 'emine')).toBeDefined();
    expect(d.exercises.find((e) => e.id === 'e23')?.name).toBe('Hip Thrust');
  });

  test('a lift deleted after the update stays deleted', () => {
    let d = migrateLibrary(oldSave(), 'en');
    d = ops.deleteExercise(d, 'e23');
    expect(migrateLibrary(d, 'en')).toBe(d);
  });

  test('new data needs no update', () => {
    const d = firstLaunchData('en');
    expect(migrateLibrary(d, 'en')).toBe(d);
  });
});

// Last test: it switches the shared store into demo mode.
test('URL switches (?state=, ?date=) are demo mode: nothing is saved after them', () => {
  actions.addWorkout('Legs');
  expect(mockSaveRaw).toHaveBeenCalledTimes(1);
  applyUrlParams({ date: '2026-11-05' });
  actions.addWorkout('Arms');
  expect(mockSaveRaw).toHaveBeenCalledTimes(1);
});
