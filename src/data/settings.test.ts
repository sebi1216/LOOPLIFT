import { DEFAULT_SETTINGS, parseSettings, stepRest } from './settings';

jest.mock('./persist', () => ({ loadRaw: () => null, saveRaw: jest.fn() }));

test('nothing saved, broken or foreign text gives the defaults', () => {
  for (const raw of [null, '', 'not json', '[]', '5', 'null']) expect(parseSettings(raw)).toEqual(DEFAULT_SETTINGS);
});

test('the rest timer is on, 90 s, dark mode follows the phone, no lock-screen reminder until asked', () => {
  expect(DEFAULT_SETTINGS).toEqual({ theme: 'system', restEnabled: true, restSeconds: 90, restReminder: false, haptics: true });
});

test('good values are kept', () => {
  const saved = { theme: 'dark', restEnabled: false, restSeconds: 120, restReminder: true, haptics: false };
  expect(parseSettings(JSON.stringify(saved))).toEqual(saved);
});

test('one bad field falls back alone; unknown fields are dropped', () => {
  const raw = JSON.stringify({ theme: 'pink', restEnabled: 'yes', restSeconds: 7, restReminder: 1, haptics: false, extra: 'x' });
  expect(parseSettings(raw)).toEqual({ ...DEFAULT_SETTINGS, haptics: false });
  expect(parseSettings(JSON.stringify({ restSeconds: 100000 })).restSeconds).toBe(90);
});

test('the rest length moves in 15 s steps between 15 s and 5 min', () => {
  expect(stepRest(90, 1)).toBe(105);
  expect(stepRest(90, -1)).toBe(75);
  expect(stepRest(15, -1)).toBe(15);
  expect(stepRest(300, 1)).toBe(300);
});
