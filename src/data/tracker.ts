// The workout log: sessions with kg and reps per set. Pure functions, no state, no React, so
// tracker.test.ts covers every rule (like schedule.ts). Ids come in from the store.

import type { Workout } from './demo';

// kg null = not filled in yet; 0 = bodyweight, no extra weight.
export type LoggedSet = { kg: number | null; reps: number; done: boolean };
export type SessionExercise = { exerciseId: string; targetSets: number; targetReps: number; sets: LoggedSet[] };
// A session is its own copy of the workout: changing the workout later never touches it.
// workoutName is kept so history stays readable after a rename or delete.
export type Session = {
  id: string;
  date: string;
  workoutId: string;
  workoutName: string;
  exercises: SessionExercise[];
  finished: boolean;
};
export type Removed = { session: Session; index: number };

// "62,5" or "62.5" gives 62.5. 0 to 999.5 in steps of 0.5; anything else is null.
export function parseKg(text: string): number | null {
  const s = text.trim().replace(',', '.');
  if (!/^\d{1,3}(\.\d)?$/.test(s)) return null;
  const n = Number(s);
  return (n * 2) % 1 === 0 ? n : null;
}

// Whole reps from 0 to 99.
export function parseReps(text: string): number | null {
  const s = text.trim();
  return /^\d{1,2}$/.test(s) ? Number(s) : null;
}

export const openSession = (sessions: Session[]) => sessions.find((s) => !s.finished);

const byDate = (a: Session, b: Session) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);

function lastSets(sessions: Session[], exerciseId: string): LoggedSet[] | null {
  const done = sessions.filter((s) => s.finished).sort(byDate);
  for (let i = done.length - 1; i >= 0; i--) {
    const e = done[i].exercises.find((x) => x.exerciseId === exerciseId);
    if (e && e.sets.length > 0) return e.sets;
  }
  return null;
}

// Starts the workout on a date. Sets come from the targets, prefilled per set from the last
// finished session of that lift (fewer sets last time: its last set repeats). Only one session
// is open at a time: starting again returns that one.
export function startSession(sessions: Session[], workout: Workout, date: string, id: string): [Session[], Session] {
  const open = openSession(sessions);
  if (open) return [sessions, open];
  const exercises = workout.exercises.map((e) => {
    const last = lastSets(sessions, e.exerciseId);
    const sets = Array.from({ length: e.targetSets }, (_, i): LoggedSet => {
      const prev = last?.[Math.min(i, last.length - 1)];
      return prev ? { kg: prev.kg, reps: prev.reps, done: false } : { kg: null, reps: e.targetReps, done: false };
    });
    return { exerciseId: e.exerciseId, targetSets: e.targetSets, targetReps: e.targetReps, sets };
  });
  const session: Session = { id, date, workoutId: workout.id, workoutName: workout.name, exercises, finished: false };
  return [[...sessions, session], session];
}

function mapSession(sessions: Session[], id: string, change: (s: Session) => Session): Session[] {
  return sessions.map((s) => (s.id === id ? change(s) : s));
}

// One set of one lift, in an open or a past session.
export function editSet(sessions: Session[], id: string, exIndex: number, setIndex: number, change: Partial<LoggedSet>): Session[] {
  return mapSession(sessions, id, (s) => ({
    ...s,
    exercises: s.exercises.map((e, i) =>
      i !== exIndex ? e : { ...e, sets: e.sets.map((x, j) => (j === setIndex ? { ...x, ...change } : x)) },
    ),
  }));
}

// One more set, a copy of the lift's last one (not ticked).
export function addSet(sessions: Session[], id: string, exIndex: number): Session[] {
  return mapSession(sessions, id, (s) => ({
    ...s,
    exercises: s.exercises.map((e, i) => {
      if (i !== exIndex) return e;
      const last = e.sets[e.sets.length - 1];
      return { ...e, sets: [...e.sets, { kg: last?.kg ?? null, reps: last?.reps ?? e.targetReps, done: false }] };
    }),
  }));
}

// Keeps ticked sets only. A session with no ticked set is dropped.
export function finishSession(sessions: Session[], id: string): Session[] {
  const s = sessions.find((x) => x.id === id);
  if (!s) return sessions;
  const exercises = s.exercises
    .map((e) => ({ ...e, sets: e.sets.filter((x) => x.done) }))
    .filter((e) => e.sets.length > 0);
  if (exercises.length === 0) return sessions.filter((x) => x.id !== id);
  return mapSession(sessions, id, () => ({ ...s, exercises, finished: true }));
}

export function deleteSession(sessions: Session[], id: string): [Session[], Removed | null] {
  const index = sessions.findIndex((s) => s.id === id);
  if (index < 0) return [sessions, null];
  return [sessions.filter((s) => s.id !== id), { session: sessions[index], index }];
}

// Undo for deleteSession: back in the same place.
export function restoreSession(sessions: Session[], removed: Removed): Session[] {
  if (sessions.some((s) => s.id === removed.session.id)) return sessions;
  const at = Math.min(removed.index, sessions.length);
  return [...sessions.slice(0, at), removed.session, ...sessions.slice(at)];
}

// The heaviest set: most kg, on a tie more reps. Empty kg counts as 0.
export function topSet(sets: LoggedSet[]): LoggedSet | null {
  let best: LoggedSet | null = null;
  for (const s of sets) {
    const kg = s.kg ?? 0;
    const bestKg = best?.kg ?? 0;
    if (!best || kg > bestKg || (kg === bestKg && s.reps > best.reps)) best = s;
  }
  return best;
}

export type HistoryEntry = { session: Session; exIndex: number; sets: LoggedSet[]; top: LoggedSet };

// Every finished session of a lift, oldest first, with its heaviest set.
export function history(sessions: Session[], exerciseId: string): HistoryEntry[] {
  return sessions
    .filter((s) => s.finished)
    .sort(byDate)
    .flatMap((session) => {
      const exIndex = session.exercises.findIndex((e) => e.exerciseId === exerciseId);
      const sets = session.exercises[exIndex]?.sets ?? [];
      const top = topSet(sets);
      return top ? [{ session, exIndex, sets, top }] : [];
    });
}

export function doneDates(sessions: Session[]): Set<string> {
  return new Set(sessions.filter((s) => s.finished).map((s) => s.date));
}
