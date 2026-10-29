// The app's data while it runs: exercises, workouts and the schedule. Screens read it with
// useAppData() and change it only through `actions`. The changes are pure functions (`ops`),
// tested in store.test.ts. Slice 1 keeps everything in memory (decision #4: storage later),
// so a restart brings back the demo data.

import { AppState, Platform } from 'react-native';
import { useSyncExternalStore } from 'react';

import { getLocale, t, type Locale, type StringKey } from '@/i18n';

import { cast, demoSchedule, demoToday, demoWorkouts, muscleGroups, starterLifts, type Exercise, type MuscleGroup, type Workout, type WorkoutExercise } from './demo';
import { clearDay, isIsoDate, pushBack, replaceDay, toIsoDate, type Plan, type Rotation, type Schedule } from './schedule';

export type AppData = {
  userName: string;
  exercises: Exercise[];
  workouts: Workout[];
  schedule: Schedule;
};

function starterLibrary(locale: Locale): Exercise[] {
  return starterLifts.map((l) => ({ ...l, name: t(`lift.${l.id}` as StringKey, {}, locale) }));
}

// Lena: the filled state on every screen.
export function lenaData(locale: Locale): AppData {
  return {
    userName: cast.hero.name,
    exercises: starterLibrary(locale),
    workouts: demoWorkouts.map((w) => ({ ...w, exercises: w.exercises.map((e) => ({ ...e })) })),
    schedule: { ...demoSchedule, entries: { ...demoSchedule.entries }, shifts: [...demoSchedule.shifts] },
  };
}

// Mia: first launch (?state=empty). The starter library is there; no workouts, no loop.
export function emptyData(locale: Locale): AppData {
  return { userName: cast.newcomer.name, exercises: starterLibrary(locale), workouts: [], schedule: { rotation: null, entries: {}, shifts: [] } };
}

let idCount = 0;
const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${(idCount++).toString(36)}`;
const clamp = (n: number) => Math.min(99, Math.max(1, Math.round(n)));

export const ops = {
  move<T>(list: T[], from: number, to: number): T[] {
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(Math.min(Math.max(to, 0), next.length), 0, item);
    return next;
  },

  addWorkout(d: AppData, name: string): [AppData, string] {
    const id = newId('w');
    return [{ ...d, workouts: [...d.workouts, { id, name, exercises: [] }] }, id];
  },

  duplicateWorkout(d: AppData, id: string, name: string): [AppData, string | null] {
    const src = d.workouts.find((w) => w.id === id);
    if (!src) return [d, null];
    const copy: Workout = { id: newId('w'), name, exercises: src.exercises.map((e) => ({ ...e })) };
    const at = d.workouts.indexOf(src) + 1;
    return [{ ...d, workouts: [...d.workouts.slice(0, at), copy, ...d.workouts.slice(at)] }, copy.id];
  },

  updateWorkout(d: AppData, id: string, change: Partial<Omit<Workout, 'id'>>): AppData {
    // A blank name is ignored: the workout keeps its last real name.
    const { name, ...rest } = change;
    const named = name !== undefined && name.trim() ? { name } : {};
    return { ...d, workouts: d.workouts.map((w) => (w.id === id ? { ...w, ...rest, ...named } : w)) };
  },

  deleteWorkout(d: AppData, id: string): AppData {
    const s = d.schedule;
    const entries = Object.fromEntries(
      Object.entries(s.entries).filter(([, p]) => !(p.kind === 'workout' && p.workoutId === id)),
    );
    const rotation = s.rotation && { ...s.rotation, slots: s.rotation.slots.filter((slot) => slot !== id) };
    return { ...d, workouts: d.workouts.filter((w) => w.id !== id), schedule: { ...s, entries, rotation } };
  },

  setTarget(d: AppData, workoutId: string, index: number, change: Partial<Omit<WorkoutExercise, 'exerciseId'>>): AppData {
    const w = d.workouts.find((x) => x.id === workoutId);
    if (!w) return d;
    const exercises = w.exercises.map((e, i) => {
      if (i !== index) return e;
      const next = { ...e, ...change };
      return { ...next, targetSets: clamp(next.targetSets), targetReps: clamp(next.targetReps) };
    });
    return ops.updateWorkout(d, workoutId, { exercises });
  },

  addExercise(d: AppData, name: string, muscleGroup: MuscleGroup): [AppData, string | null] {
    const clean = name.trim();
    if (!clean) return [d, null];
    const id = newId('e');
    return [{ ...d, exercises: [...d.exercises, { id, name: clean, muscleGroup }] }, id];
  },

  updateExercise(d: AppData, id: string, name: string, muscleGroup: MuscleGroup): AppData {
    const clean = name.trim();
    if (!clean) return d;
    return { ...d, exercises: d.exercises.map((e) => (e.id === id ? { ...e, name: clean, muscleGroup } : e)) };
  },

  deleteExercise(d: AppData, id: string): AppData {
    return {
      ...d,
      exercises: d.exercises.filter((e) => e.id !== id),
      workouts: d.workouts.map((w) => ({ ...w, exercises: w.exercises.filter((e) => e.exerciseId !== id) })),
    };
  },

  // The library by muscle group, filtered by a search text; groups with no match are left out.
  groupByMuscle(d: AppData, query: string): { group: MuscleGroup; items: Exercise[] }[] {
    const q = query.trim().toLowerCase();
    return muscleGroups
      .map((group) => ({ group, items: d.exercises.filter((e) => e.muscleGroup === group && e.name.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  },

  // Names of the workouts that use an exercise ("In Push").
  usedIn(d: AppData, exerciseId: string): string[] {
    return d.workouts.filter((w) => w.exercises.some((e) => e.exerciseId === exerciseId)).map((w) => w.name);
  },

  setDay(d: AppData, date: string, plan: Plan): AppData {
    return { ...d, schedule: replaceDay(d.schedule, date, plan) };
  },
  clearDay(d: AppData, date: string): AppData {
    return { ...d, schedule: clearDay(d.schedule, date) };
  },
  pushBack(d: AppData, date: string): AppData {
    return { ...d, schedule: pushBack(d.schedule, date) };
  },
  setRotation(d: AppData, rotation: Rotation): AppData {
    return { ...d, schedule: { ...d.schedule, rotation } };
  },
};

// ---- Runtime store (one per app run) ----

type StateParam = 'empty' | 'filled';
type Snapshot = { data: AppData; today: string | null };

let snapshot: Snapshot = { data: lenaData(getLocale()), today: null };
let lastState: StateParam | undefined;
const listeners = new Set<() => void>();

function set(next: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// URL switches, so every state has a URL: ?state=empty (Mia), ?state=filled (Lena),
// ?date=2026-11-05 (pretend today is that day; the designs show Thursday 5 Nov).
export function applyUrlParams(params: { state?: string; date?: string }) {
  const next: Partial<Snapshot> = {};
  if ((params.state === 'empty' || params.state === 'filled') && params.state !== lastState) {
    lastState = params.state;
    next.data = params.state === 'empty' ? emptyData(getLocale()) : lenaData(getLocale());
  }
  if (params.date === 'demo') next.today = demoToday;
  else if (params.date && isIsoDate(params.date) && params.date !== snapshot.today) next.today = params.date;
  if (Object.keys(next).length > 0) set(next);
}

// On web, read the first URL before the first render, so the first frame is already right.
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const q = new URLSearchParams(window.location.search);
  applyUrlParams({ state: q.get('state') ?? undefined, date: q.get('date') ?? undefined });
}

export function useAppData(): AppData {
  return useSyncExternalStore(subscribe, () => snapshot.data, () => snapshot.data);
}

// The real date is read on every store change and whenever the app comes back to the
// foreground, so Today moves on after midnight.
AppState.addEventListener('change', (s) => {
  if (s === 'active') listeners.forEach((l) => l());
});

export function useToday(): string {
  const read = () => snapshot.today ?? toIsoDate(new Date());
  return useSyncExternalStore(subscribe, read, read);
}

function update(change: (d: AppData) => AppData) {
  set({ data: change(snapshot.data) });
}
function updateWithId(change: (d: AppData) => [AppData, string | null]): string | null {
  const [data, id] = change(snapshot.data);
  set({ data });
  return id;
}

export const actions = {
  addWorkout: (name: string) => updateWithId((d) => ops.addWorkout(d, name)),
  duplicateWorkout: (id: string, name: string) => updateWithId((d) => ops.duplicateWorkout(d, id, name)),
  updateWorkout: (id: string, change: Partial<Omit<Workout, 'id'>>) => update((d) => ops.updateWorkout(d, id, change)),
  deleteWorkout: (id: string) => update((d) => ops.deleteWorkout(d, id)),
  setTarget: (workoutId: string, index: number, change: Partial<Omit<WorkoutExercise, 'exerciseId'>>) =>
    update((d) => ops.setTarget(d, workoutId, index, change)),
  addExercise: (name: string, group: MuscleGroup) => updateWithId((d) => ops.addExercise(d, name, group)),
  updateExercise: (id: string, name: string, group: MuscleGroup) => update((d) => ops.updateExercise(d, id, name, group)),
  deleteExercise: (id: string) => update((d) => ops.deleteExercise(d, id)),
  setDay: (date: string, plan: Plan) => update((d) => ops.setDay(d, date, plan)),
  clearDay: (date: string) => update((d) => ops.clearDay(d, date)),
  pushBack: (date: string) => update((d) => ops.pushBack(d, date)),
  setRotation: (rotation: Rotation) => update((d) => ops.setRotation(d, rotation)),
};
