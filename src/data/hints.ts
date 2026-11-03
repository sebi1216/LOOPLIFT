// Next-weight hints and new records, from the user's own history (decision #12). Rule-based,
// never AI coaching; every hint carries the numbers its reason names. Pure, like tracker.ts.

import type { MuscleGroup } from './demo';
import { daysBetween } from './schedule';
import { topSet, type HistoryEntry, type Session } from './tracker';
import { kgToLb, lbToKg, type Unit } from './units';

export type Hint =
  // Every rep at `from` kg for `sessions` sessions in a row (at least 2): try `kg`.
  | { kind: 'up'; kg: number; from: number; sessions: number; reps: number }
  // `sessions` sessions at `kg` without every rep: stay, aim for `reps`.
  | { kind: 'stay'; kg: number; reps: number; sessions: number }
  // `days` off since the last session: start at about `percent`% of `from`.
  | { kind: 'comeback'; kg: number; from: number; days: number; percent: 80 | 90 }
  | { kind: 'same'; kg: number };

const STEP = 2.5;
const STEP_LB = 5;

// To the next weight you can really load: 2.5 kg, or 5 lb when you train in pounds.
export function roundKg(kg: number, mode: 'nearest' | 'down' = 'nearest', unit: Unit = 'kg'): number {
  const whole = (n: number) => (mode === 'down' ? Math.floor(n + 1e-9) : Math.round(n));
  return unit === 'kg' ? whole(kg / STEP) * STEP : lbToKg(whole(kgToLb(kg) / STEP_LB) * STEP_LB);
}

function allReps(e: HistoryEntry): boolean {
  const ex = e.session.exercises[e.exIndex];
  return e.sets.length >= ex.targetSets && e.sets.every((s) => s.reps >= ex.targetReps);
}

// entries: history(sessions, exerciseId), oldest first.
export function hintFor(entries: HistoryEntry[], group: MuscleGroup, today: string, unit: Unit = 'kg'): Hint | null {
  const last = entries[entries.length - 1];
  if (!last) return null;
  const kg = last.top.kg ?? 0;
  if (kg === 0) return { kind: 'same', kg: 0 };

  const days = daysBetween(last.session.date, today);
  if (days >= 14) {
    const percent = days >= 28 ? 80 : 90;
    return { kind: 'comeback', kg: roundKg((kg * percent) / 100, 'down', unit), from: kg, days, percent };
  }

  // The sessions in a row (newest back) at this same top weight.
  const run: HistoryEntry[] = [];
  for (let i = entries.length - 1; i >= 0 && (entries[i].top.kg ?? 0) === kg; i--) run.push(entries[i]);

  const full = run.findIndex((e) => !allReps(e));
  const fullRun = full < 0 ? run.length : full;
  if (fullRun >= 2) {
    const add = unit === 'kg' ? (group === 'legs' ? 5 : STEP) : lbToKg(group === 'legs' ? 2 * STEP_LB : STEP_LB);
    const reps = last.session.exercises[last.exIndex].targetReps;
    return { kind: 'up', kg: roundKg(kg + add, 'nearest', unit), from: kg, sessions: fullRun, reps };
  }
  if (fullRun === 0 && run.length >= 3) {
    return { kind: 'stay', kg, reps: Math.min(...last.sets.map((s) => s.reps)) + 1, sessions: run.length };
  }
  return { kind: 'same', kg };
}

export type NewRecord = { exerciseId: string; kg: number; reps: number; overBy: number };

// Lifts in one finished session whose heaviest set beats every earlier finished set of that
// lift (tie on kg: more reps). A lift's first session is never a record.
export function newRecords(sessions: Session[], sessionId: string): NewRecord[] {
  const s = sessions.find((x) => x.id === sessionId);
  if (!s) return [];
  const earlier = sessions.filter((x) => x.finished && x.id !== s.id && x.date <= s.date);
  return s.exercises.flatMap((e) => {
    const top = topSet(e.sets);
    const best = topSet(earlier.flatMap((x) => x.exercises.filter((y) => y.exerciseId === e.exerciseId).flatMap((y) => y.sets)));
    if (!top || !best) return [];
    const kg = top.kg ?? 0;
    const bestKg = best.kg ?? 0;
    if (kg > bestKg || (kg === bestKg && top.reps > best.reps)) {
      return [{ exerciseId: e.exerciseId, kg, reps: top.reps, overBy: kg - bestKg }];
    }
    return [];
  });
}
