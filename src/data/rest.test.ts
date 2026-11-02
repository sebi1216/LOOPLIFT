import { adjustRest, DEFAULT_REST, progressOf, remainingOf, startRest } from './rest';

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

describe('the timer in the app', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockSettings.restEnabled = true;
    mockSettings.restSeconds = 90;
    mockSettings.restReminder = false;
    mockSchedule.mockClear();
    mockCancel.mockClear();
    mockBuzz.mockClear();
    restTimer.stop();
  });
  afterEach(() => jest.useRealTimers());

  test('switched off in the settings, a tick starts nothing', () => {
    mockSettings.restEnabled = false;
    restTimer.start();
    expect(currentRest()).toBeNull();
  });

  test('it starts with the length from the settings', () => {
    mockSettings.restSeconds = 120;
    restTimer.start();
    expect(currentRest()?.seconds).toBe(120);
  });

  test('plus and minus hold for the next sets, until the setting itself changes', () => {
    restTimer.start();
    restTimer.adjust(15);
    restTimer.start();
    expect(currentRest()?.seconds).toBe(105);
    mockSettings.restSeconds = 60;
    restTimer.start();
    expect(currentRest()?.seconds).toBe(60);
  });

  test('the lock-screen reminder is set only when switched on, moves with plus, goes with stop', () => {
    restTimer.start();
    expect(mockSchedule).not.toHaveBeenCalled();
    mockSettings.restReminder = true;
    restTimer.start();
    expect(mockSchedule).toHaveBeenLastCalledWith(90);
    restTimer.adjust(15);
    expect(mockSchedule).toHaveBeenLastCalledWith(105);
    mockCancel.mockClear();
    restTimer.stop();
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  test('one buzz when the rest ends, "over" stays a moment, then it is gone', () => {
    restTimer.start();
    jest.advanceTimersByTime(90_000);
    expect(mockBuzz).toHaveBeenCalledTimes(1);
    expect(currentRest()).not.toBeNull();
    jest.advanceTimersByTime(4000);
    expect(currentRest()).toBeNull();
  });
});
