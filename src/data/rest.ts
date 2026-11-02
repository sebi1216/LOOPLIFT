// The rest timer between sets: starts when you tick a set, runs across the workout screens. The
// running rest is kept in memory only: after a restart there is simply no timer running. The
// length you set with plus and minus is saved as a setting (settings.ts) for the next rests.
// With the Rest timer setting off, ticking a set starts nothing.
import { useSyncExternalStore } from 'react';

import { haptic } from '@/ui/haptics';

import { cancelRestAlert, scheduleRestAlert } from './rest-alert';
import { DEFAULT_SETTINGS, getSettings, MIN_REST, REST_STEP, updateSettings } from './settings';

export const DEFAULT_REST = DEFAULT_SETTINGS.restSeconds;
export { REST_STEP };
const OVER_MS = 4000;

export type Rest = { endsAt: number; seconds: number };

export const startRest = (now: number, seconds: number): Rest => ({ endsAt: now + seconds * 1000, seconds });

export function remainingOf(r: Rest, now: number): number {
  return Math.max(0, Math.ceil((r.endsAt - now) / 1000));
}

export function progressOf(r: Rest, now: number): number {
  return Math.min(1, Math.max(0, (r.endsAt - now) / (r.seconds * 1000)));
}

export function adjustRest(r: Rest, delta: number, now: number): Rest {
  const seconds = Math.max(MIN_REST, r.seconds + delta);
  return { seconds, endsAt: Math.max(now, r.endsAt + (seconds - r.seconds) * 1000) };
}

// ---- Runtime: one timer per app run ----

let current: Rest | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

// One haptic the moment it ends, then "Rest over" stays a few seconds. Here and not in the
// bar, because a bar is mounted on each workout screen in the stack. The lock screen alert is
// scheduled with the phone at the same time (rest-alert.ts).
function arm() {
  clearTimeout(timer);
  if (!current) return;
  scheduleRestAlert(current.endsAt);
  timer = setTimeout(
    () => {
      haptic('restOver');
      timer = setTimeout(restTimer.stop, OVER_MS);
    },
    Math.max(0, current.endsAt - Date.now()),
  );
}

export const restTimer = {
  start() {
    if (!getSettings().restTimer) return;
    current = startRest(Date.now(), getSettings().restSeconds);
    arm();
    emit();
  },
  adjust(delta: number) {
    if (!current) return;
    current = adjustRest(current, delta, Date.now());
    updateSettings({ restSeconds: current.seconds });
    haptic('step');
    arm();
    emit();
  },
  stop() {
    clearTimeout(timer);
    cancelRestAlert();
    if (!current) return;
    current = null;
    emit();
  },
};

export const getRest = () => current;

export function useRest(): Rest | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => current,
  );
}
