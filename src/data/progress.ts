// The Progress tab, worked out from the workout log: which days you trained (gym days), streaks,
// and strength per muscle group now against a start. Pure functions, no state, no React, so
// progress.test.ts covers every rule. Nothing new is saved; it all comes from finished sessions.
import { muscleGroups, type Exercise, type MuscleGroup } from './demo';
import { addDays, resolveDay, type Schedule } from './schedule';
import type { Session } from './tracker';

// Estimated one-rep max (Epley): kg x (1 + reps / 30), rounded to 0.5 kg. Lets 5 heavy reps and
// 12 light ones be compared on one scale. Reps above 12 add nothing: the estimate stops being
// useful there, and a light set of 30 must not beat a real heavy one. Bodyweight sets (0 kg) give
// 0: the body's weight is not known, so they count as reps instead (strengthByGroup).
const MAX_E1RM_REPS = 12;
export function e1rm(kg: number | null, reps: number): number {
  if (!kg || kg <= 0 || reps <= 0) return 0;
  if (reps === 1) return kg;
  return Math.round(kg * (1 + Math.min(reps, MAX_E1RM_REPS) / 30) * 2) / 2;
}

export type Period = 'week' | 'month' | 'year' | 'all';
export const periods: Period[] = ['week', 'month', 'year', 'all'];
const periodDays: Record<Exclude<Period, 'all'>, number> = { week: 7, month: 30, year: 365 };

export type GroupStrength = { start: number; now: number } | null;
export type Strength = {
  groups: Record<MuscleGroup, GroupStrength>;
  // Groups with bodyweight sets only: their start and now are best reps, not kg.
  repsOnly: MuscleGroup[];
  // Now against start over all groups in kg; null with no kg data.
  change: number | null;
  workouts: number;
  sets: number;
};

const sessionBest = (s: Session, exerciseId: string) =>
  s.exercises.filter((e) => e.exerciseId === exerciseId).reduce((m, e) => Math.max(m, ...e.sets.map((x) => e1rm(x.kg, x.reps))), 0);

const sessionBestReps = (s: Session, exerciseId: string) =>
  s.exercises.filter((e) => e.exerciseId === exerciseId).reduce((m, e) => Math.max(m, ...e.sets.map((x) => (x.kg === 0 ? x.reps : 0))), 0);

// Per lift: now = its best estimated max up to today. Start = its best before the period began;
// a lift first done inside the period starts at its first session. Per group: the sum over its
// lifts. A group with no set at all is null ("no data"), never a fake 0 kg. A group with only
// bodyweight sets does the same with best reps, so doing pull-ups never reads as "nothing for
// Back"; once it has a weighted lift it is in kg and the bodyweight lifts are left out.
export function strengthByGroup(sessions: Session[], exercises: Exercise[], period: Period, today: string): Strength {
  const done = sessions.filter((s) => s.finished && s.date <= today).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const from = period === 'all' ? null : addDays(today, -(periodDays[period] - 1));
  const empty = () => Object.fromEntries(muscleGroups.map((g) => [g, null])) as Record<MuscleGroup, GroupStrength>;
  const groups = empty();
  const reps = empty();

  const add = (into: Record<MuscleGroup, GroupStrength>, ex: Exercise, best: (s: Session, id: string) => number) => {
    const dated = done.map((s) => ({ date: s.date, best: best(s, ex.id) })).filter((x) => x.best > 0);
    if (dated.length === 0) return;
    const now = Math.max(...dated.map((x) => x.best));
    const before = from ? dated.filter((x) => x.date < from) : [];
    const start = before.length > 0 ? Math.max(...before.map((x) => x.best)) : dated[0].best;
    const g = into[ex.muscleGroup] ?? { start: 0, now: 0 };
    into[ex.muscleGroup] = { start: g.start + start, now: g.now + now };
  };
  for (const ex of exercises) {
    add(groups, ex, sessionBest);
    add(reps, ex, sessionBestReps);
  }

  const withData = Object.values(groups).filter((g): g is { start: number; now: number } => g !== null);
  const start = withData.reduce((n, g) => n + g.start, 0);
  const now = withData.reduce((n, g) => n + g.now, 0);
  const repsOnly = muscleGroups.filter((g) => groups[g] === null && reps[g] !== null);
  for (const g of repsOnly) groups[g] = reps[g];
  const inPeriod = done.filter((s) => !from || s.date >= from);
  return {
    groups,
    repsOnly,
    change: start > 0 ? (now - start) / start : null,
    workouts: inPeriod.length,
    sets: inPeriod.reduce((n, s) => n + s.exercises.reduce((m, e) => m + e.sets.length, 0), 0),
  };
}

// ---- Gym days ----

// Finished sessions per day, as the number of sets done (for a deeper fill on big days).
export function gymDays(sessions: Session[]): Map<string, number> {
  const days = new Map<string, number>();
  for (const s of sessions) {
    if (!s.finished) continue;
    days.set(s.date, (days.get(s.date) ?? 0) + s.exercises.reduce((n, e) => n + e.sets.length, 0));
  }
  return days;
}

const weekday = (date: string) => (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday 0

export const mondayOf = (date: string) => addDays(date, -weekday(date));

// One month as calendar cells, Monday first; null fills the gaps before day 1 and after the end.
export function monthCells(year: number, month: number): (string | null)[] {
  const first = `${year}-${String(month).padStart(2, '0')}-01`;
  const length = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days = Array.from({ length }, (_, i) => addDays(first, i));
  const cells: (string | null)[] = [...Array(weekday(first)).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// The last n weeks as columns of Monday to Sunday; the last column holds today.
export function heatWeeks(today: string, n: number): string[][] {
  const last = mondayOf(today);
  return Array.from({ length: n }, (_, i) => {
    const monday = addDays(last, -7 * (n - 1 - i));
    return Array.from({ length: 7 }, (_, d) => addDays(monday, d));
  });
}

// Weeks in a row with at least one workout, counting back from this week. This week may still
// be empty (it is not over), then the count starts at last week.
export function weekStreak(done: Set<string>, today: string): number {
  const weeks = new Set([...done].filter((d) => d <= today).map(mondayOf));
  let monday = mondayOf(today);
  if (!weeks.has(monday)) monday = addDays(monday, -7);
  let n = 0;
  while (weeks.has(monday)) {
    n++;
    monday = addDays(monday, -7);
  }
  return n;
}

export type DayStatus = 'done' | 'missed' | 'rest' | 'free' | 'today' | 'future';

// One calendar box. Done wins over everything; a past day with a planned workout and no session
// is missed; today and later days are not judged yet.
export function dayStatus(date: string, today: string, done: Set<string>, schedule: Schedule): DayStatus {
  if (done.has(date)) return 'done';
  if (date === today) return 'today';
  if (date > today) return 'future';
  const plan = resolveDay(schedule, date).plan;
  if (plan?.kind === 'workout') return 'missed';
  if (plan?.kind === 'rest') return 'rest';
  return 'free';
}
