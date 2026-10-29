import type { AppData } from '@/data/store';
import type { Plan, ResolvedDay } from '@/data/schedule';
import { t } from '@/i18n';

import type { DayVariant } from './day-cell';

// "Push", "Rest", or '' for a day without a plan.
export function planLabel(d: AppData, plan: Plan | null): string {
  if (!plan) return '';
  if (plan.kind === 'rest') return t('common.rest');
  return d.workouts.find((w) => w.id === plan.workoutId)?.name ?? '';
}

export function slotLabel(d: AppData, slot: string): string {
  return slot === 'rest' ? t('common.rest') : (d.workouts.find((w) => w.id === slot)?.name ?? '');
}

// How a day looks in the Today strip and the Calendar.
export function dayVariant(day: ResolvedDay, today: string): DayVariant {
  if (day.date === today) return 'today';
  if (day.source === 'manual') return 'manual';
  if (!day.plan) return 'blank';
  return day.plan.kind === 'rest' ? 'rest' : 'plain';
}
