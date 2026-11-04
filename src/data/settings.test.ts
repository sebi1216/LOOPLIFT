import { DEFAULT_SETTINGS, parseSettings, schemeFor, serializeSettings, withRestSeconds } from './settings';

test('nothing saved gives the defaults: rest timer on, 90 s, system look, haptics on, no alert', () => {
  expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
  expect(DEFAULT_SETTINGS).toEqual({ restTimer: true, restSeconds: 90, theme: 'system', haptics: true, restAlert: false, unit: 'kg', showBoth: true, defaultReps: 8 });
});

test('saved settings come back as they were', () => {
  const s = { restTimer: false, restSeconds: 120, theme: 'dark' as const, haptics: false, restAlert: true, unit: 'lb' as const, showBoth: true, defaultReps: 5 };
  expect(parseSettings(serializeSettings(s))).toEqual(s);
});

test('broken or foreign text gives the defaults instead of a crash', () => {
  expect(parseSettings('not json')).toEqual(DEFAULT_SETTINGS);
  expect(parseSettings('[1,2]')).toEqual(DEFAULT_SETTINGS);
  expect(parseSettings(JSON.stringify({ v: 99, data: { restTimer: false } }))).toEqual(DEFAULT_SETTINGS);
});

test('each bad field falls back alone; the good ones stay', () => {
  const raw = JSON.stringify({ v: 1, data: { restTimer: false, restSeconds: 'x', theme: 'purple', haptics: 0 } });
  expect(parseSettings(raw)).toEqual({ ...DEFAULT_SETTINGS, restTimer: false });
});

test('a saved rest length is kept between 15 s and 10 min, on 15 s steps', () => {
  const at = (n: number) => parseSettings(JSON.stringify({ v: 1, data: { restSeconds: n } })).restSeconds;
  expect(at(5)).toBe(15);
  expect(at(9999)).toBe(600);
  expect(at(100)).toBe(105);
  expect(withRestSeconds(DEFAULT_SETTINGS, 0).restSeconds).toBe(15);
  expect(withRestSeconds(DEFAULT_SETTINGS, 135).restSeconds).toBe(135);
});

test('the look: system follows the phone, light and dark override it', () => {
  expect(schemeFor('system', 'dark')).toBe('dark');
  expect(schemeFor('system', 'light')).toBe('light');
  expect(schemeFor('system', null)).toBe('light');
  expect(schemeFor('light', 'dark')).toBe('light');
  expect(schemeFor('dark', 'light')).toBe('dark');
});

test('weight unit and default reps: kg, one unit shown, 8 reps; a bad value falls back alone', () => {
  expect(DEFAULT_SETTINGS).toMatchObject({ unit: 'kg', showBoth: true, defaultReps: 8 });
  const at = (data: object) => parseSettings(JSON.stringify({ v: 1, data }));
  expect(at({ unit: 'lb', showBoth: true, defaultReps: 12 })).toMatchObject({ unit: 'lb', showBoth: true, defaultReps: 12 });
  expect(at({ unit: 'stone', showBoth: 1, defaultReps: 'x' })).toMatchObject({ unit: 'kg', showBoth: true, defaultReps: 8 });
  expect(at({ defaultReps: 500 }).defaultReps).toBe(99);
  expect(at({ defaultReps: 0 }).defaultReps).toBe(1);
});
