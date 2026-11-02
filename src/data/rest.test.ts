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
