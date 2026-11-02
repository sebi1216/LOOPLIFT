import { adjustRest, DEFAULT_REST, getRest, progressOf, remainingOf, REST_STEP, restTimer, startRest } from './rest';
import { DEFAULT_SETTINGS, getSettings, updateSettings } from './settings';

const T0 = 1_000_000;

test('a rest counts down in whole seconds, rounded up', () => {
  const r = startRest(T0, DEFAULT_REST);
  expect(remainingOf(r, T0)).toBe(90);
  expect(remainingOf(r, T0 + 500)).toBe(90);
  expect(remainingOf(r, T0 + 1000)).toBe(89);
  expect(remainingOf(r, T0 + 90_000)).toBe(0);
  expect(remainingOf(r, T0 + 95_000)).toBe(0);
});

test('progress goes from 1 to 0 and stays there', () => {
  const r = startRest(T0, 100);
  expect(progressOf(r, T0)).toBe(1);
  expect(progressOf(r, T0 + 25_000)).toBe(0.75);
  expect(progressOf(r, T0 + 200_000)).toBe(0);
});

test('plus and minus move the end, and the whole length with it', () => {
  const r = adjustRest(startRest(T0, 90), 15, T0 + 10_000);
  expect(r.seconds).toBe(105);
  expect(remainingOf(r, T0 + 10_000)).toBe(95);
  const less = adjustRest(r, -15, T0 + 10_000);
  expect(less.seconds).toBe(90);
  expect(remainingOf(less, T0 + 10_000)).toBe(80);
});

test('minus never goes below the shortest rest', () => {
  const r = adjustRest(startRest(T0, 15), -15, T0);
  expect(r.seconds).toBe(15);
  expect(remainingOf(r, T0)).toBe(15);
});

// ---- Settings (rest timer optional, length saved) ----

describe('the running timer follows the settings', () => {
  afterEach(() => {
    restTimer.stop();
    updateSettings(DEFAULT_SETTINGS);
  });

  test('with the rest timer off, ticking a set starts nothing', () => {
    updateSettings({ restTimer: false });
    restTimer.start();
    expect(getRest()).toBeNull();
  });

  test('a new rest starts with the saved length', () => {
    updateSettings({ restSeconds: 120 });
    restTimer.start();
    expect(getRest()?.seconds).toBe(120);
  });

  test('plus and minus save the new length for the next rest', () => {
    restTimer.start();
    restTimer.adjust(REST_STEP);
    expect(getSettings().restSeconds).toBe(DEFAULT_REST + REST_STEP);
    restTimer.stop();
    restTimer.start();
    expect(getRest()?.seconds).toBe(DEFAULT_REST + REST_STEP);
  });
});
