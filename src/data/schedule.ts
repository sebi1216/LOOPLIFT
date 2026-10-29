// The scheduling engine: which workout (or Rest) falls on a date. Pure functions, no state,
// no React, so the unit tests in schedule.test.ts cover every rule.
// Dates are ISO strings 'YYYY-MM-DD' in the user's local calendar; the math runs in UTC day
// numbers so daylight saving never shifts a day.

export type Plan = { kind: 'workout'; workoutId: string } | { kind: 'rest' };
// A loop slot: a workout id or 'rest'.
export type Slot = string;
export type Rotation = { startDate: string; slots: Slot[] };

export type Schedule = {
  rotation: Rotation | null;
  // Days set by hand ("Replace this day only", or a Calendar day set to a workout or Rest).
  entries: Record<string, Plan>;
  // "Push the loop back" dates: that day becomes Rest and the loop continues one day later.
  shifts: string[];
};

export type DaySource = 'loop' | 'manual' | 'shift' | 'beforeStart' | 'none';
export type ResolvedDay = {
  date: string;
  plan: Plan | null;
  source: DaySource;
  // Position in the loop (0-based) for days that come from the loop.
  slotIndex?: number;
  slotCount?: number;
};

const DAY_MS = 86_400_000;

function dayNumber(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}

export function daysBetween(from: string, to: string): number {
  return dayNumber(to) - dayNumber(from);
}

export function addDays(date: string, n: number): string {
  return new Date((dayNumber(date) + n) * DAY_MS).toISOString().slice(0, 10);
}

export function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function toIsoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function slotPlan(slot: Slot): Plan {
  return slot === 'rest' ? { kind: 'rest' } : { kind: 'workout', workoutId: slot };
}

export function resolveDay(s: Schedule, date: string): ResolvedDay {
  const manual = s.entries[date];
  if (manual) return { date, plan: manual, source: 'manual' };

  const r = s.rotation;
  if (!r || r.slots.length === 0) return { date, plan: null, source: 'none' };
  if (date < r.startDate) return { date, plan: null, source: 'beforeStart' };
  if (s.shifts.includes(date)) return { date, plan: { kind: 'rest' }, source: 'shift' };

  // slot = (days since start - push-backs before this date) mod n
  const shiftsBefore = s.shifts.filter((d) => d >= r.startDate && d < date).length;
  const n = r.slots.length;
  const slotIndex = (((daysBetween(r.startDate, date) - shiftsBefore) % n) + n) % n;
  return { date, plan: slotPlan(r.slots[slotIndex]), source: 'loop', slotIndex, slotCount: n };
}

export function resolveRange(s: Schedule, from: string, count: number): ResolvedDay[] {
  return Array.from({ length: count }, (_, i) => resolveDay(s, addDays(from, i)));
}

export function replaceDay(s: Schedule, date: string, plan: Plan): Schedule {
  return { ...s, entries: { ...s.entries, [date]: plan } };
}

// Back to the loop: removes a hand-set plan and a push-back on that date.
export function clearDay(s: Schedule, date: string): Schedule {
  const { [date]: _removed, ...entries } = s.entries;
  return { ...s, entries, shifts: s.shifts.filter((d) => d !== date) };
}

export function pushBack(s: Schedule, date: string): Schedule {
  const { [date]: _removed, ...entries } = s.entries;
  const shifts = s.shifts.includes(date) ? s.shifts : [...s.shifts, date].sort();
  return { ...s, entries, shifts };
}

export function samePlan(a: Plan | null, b: Plan | null): boolean {
  if (a === null || b === null) return a === b;
  if (a.kind !== b.kind) return false;
  return a.kind === 'rest' || (b.kind === 'workout' && a.workoutId === b.workoutId);
}
