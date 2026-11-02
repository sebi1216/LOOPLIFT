// How this week is going, for the line on Today: finished workout days against the planned ones.
// The week runs Monday to Sunday. Pure, like schedule.ts.
import { addDays, resolveRange, type Schedule } from './schedule';
import { doneDates, type Session } from './tracker';

export function weekProgress(schedule: Schedule, sessions: Session[], today: string): { done: number; total: number } {
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
  const monday = addDays(today, -((weekday + 6) % 7));
  const days = resolveRange(schedule, monday, 7);
  const planned = days.filter((x) => x.plan?.kind === 'workout').length;
  const finished = doneDates(sessions);
  const done = days.filter((x) => finished.has(x.date)).length;
  return { done, total: Math.max(planned, done) };
}
