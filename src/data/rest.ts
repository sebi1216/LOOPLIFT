// The rest timer between sets: starts when you tick a set, runs across the workout screens. Kept
// in memory only, nothing is saved: after a restart there is simply no timer running. The length
// you set with plus and minus stays for the next sets until the app closes.
import { useSyncExternalStore } from 'react';
import { Vibration } from 'react-native';

export const DEFAULT_REST = 90;
export const REST_STEP = 15;
const MIN_REST = 15;
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
let length = DEFAULT_REST;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

// One short buzz the moment it ends, then "Rest over" stays a few seconds. Here and not in the
// bar, because a bar is mounted on each workout screen in the stack.
function arm() {
  clearTimeout(timer);
  if (!current) return;
  timer = setTimeout(
    () => {
      Vibration.vibrate();
      timer = setTimeout(restTimer.stop, OVER_MS);
    },
    Math.max(0, current.endsAt - Date.now()),
  );
}

export const restTimer = {
  start() {
    current = startRest(Date.now(), length);
    arm();
    emit();
  },
  adjust(delta: number) {
    if (!current) return;
    current = adjustRest(current, delta, Date.now());
    length = current.seconds;
    arm();
    emit();
  },
  stop() {
    clearTimeout(timer);
    if (!current) return;
    current = null;
    emit();
  },
};

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
