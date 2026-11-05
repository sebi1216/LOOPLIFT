// The app's settings: rest timer on or off and its length, light / dark / system look, haptics,
// the rest alert on the lock screen, the weight unit and the reps a new lift starts with. Saved on the phone under their own key, apart from the
// training data (store.ts), so the data format there stays as it is. Listed in
// docs/data-inventory.md. Demo links (?state=) do not touch them.
import { useSyncExternalStore } from 'react';
import { Appearance, Platform } from 'react-native';

import { loadRaw, saveRaw } from './persist';
import type { Unit } from './units';

export type Theme = 'system' | 'light' | 'dark';

export type Settings = {
  // Off: ticking a set starts no rest timer.
  restTimer: boolean;
  // The rest length every new rest starts with; plus and minus on the timer change it too.
  restSeconds: number;
  theme: Theme;
  haptics: boolean;
  // A notification when the rest is over, so it reaches you with the phone locked.
  restAlert: boolean;
  // The unit you read and type weights in. showBoth adds the other one behind it, with its own field.
  unit: Unit;
  showBoth: boolean;
  // Target reps of a lift when it is added to a workout.
  defaultReps: number;
};

export const DEFAULT_SETTINGS: Settings = { restTimer: true, restSeconds: 90, theme: 'system', haptics: true, restAlert: false, unit: 'kg', showBoth: true, defaultReps: 8 };

export const MIN_REST = 15;
export const MAX_REST = 600;
export const REST_STEP = 15;

const KEY = 'looplift.settings';
const VERSION = 1;

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isTheme = (x: unknown): x is Theme => x === 'system' || x === 'light' || x === 'dark';

// Whole 15 s steps between 15 s and 10 min.
const cleanRest = (n: number) => Math.min(MAX_REST, Math.max(MIN_REST, Math.round(n / REST_STEP) * REST_STEP));

const cleanReps = (n: number) => Math.min(99, Math.max(1, Math.round(n)));

export function withRestSeconds(s: Settings, seconds: number): Settings {
  return { ...s, restSeconds: cleanRest(seconds) };
}

export function serializeSettings(s: Settings): string {
  return JSON.stringify({ v: VERSION, data: s });
}

// Saved text back to settings. Each field that is missing or broken falls back to its default
// alone, so a bad value never resets the others or crashes the launch.
export function parseSettings(raw: string | null): Settings {
  if (!raw) return DEFAULT_SETTINGS;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return DEFAULT_SETTINGS;
  }
  if (!isObj(parsed) || parsed.v !== VERSION || !isObj(parsed.data)) return DEFAULT_SETTINGS;
  const d = parsed.data;
  const D = DEFAULT_SETTINGS;
  return {
    restTimer: typeof d.restTimer === 'boolean' ? d.restTimer : D.restTimer,
    restSeconds: typeof d.restSeconds === 'number' && Number.isFinite(d.restSeconds) ? cleanRest(d.restSeconds) : D.restSeconds,
    theme: isTheme(d.theme) ? d.theme : D.theme,
    haptics: typeof d.haptics === 'boolean' ? d.haptics : D.haptics,
    restAlert: typeof d.restAlert === 'boolean' ? d.restAlert : D.restAlert,
    unit: d.unit === 'kg' || d.unit === 'lb' ? d.unit : D.unit,
    showBoth: typeof d.showBoth === 'boolean' ? d.showBoth : D.showBoth,
    defaultReps: typeof d.defaultReps === 'number' && Number.isFinite(d.defaultReps) ? cleanReps(d.defaultReps) : D.defaultReps,
  };
}

// The look to draw: "system" follows the phone (light if the phone says nothing).
export function schemeFor(theme: Theme, system: string | null | undefined): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return system === 'dark' ? 'dark' : 'light';
}

// ---- Runtime (one per app run) ----

let current = parseSettings(loadRaw(KEY));
const listeners = new Set<() => void>();

// Native chrome (tab bar, menus, date picker, alerts) follows the app's look, not only our colours.
// The web preview has no such switch; useColors() covers it there.
function applyTheme(theme: Theme) {
  if (Platform.OS === 'web') return;
  try {
    Appearance.setColorScheme(theme === 'system' ? 'auto' : theme);
  } catch {
    // An older native side without the override: our own colours still follow the setting.
  }
}
applyTheme(current.theme);

export function getSettings(): Settings {
  return current;
}

export function updateSettings(change: Partial<Settings>) {
  const next = { ...current, ...change };
  current = change.restSeconds !== undefined ? withRestSeconds(next, change.restSeconds) : next;
  if (change.defaultReps !== undefined) current = { ...current, defaultReps: cleanReps(change.defaultReps) };
  if (change.theme !== undefined) applyTheme(current.theme);
  saveRaw(KEY, serializeSettings(current));
  listeners.forEach((l) => l());
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => current,
  );
}
