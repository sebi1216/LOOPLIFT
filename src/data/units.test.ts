import { inUnit, lbToKg, otherUnit, parseWeight } from './units';

test('135 lb typed in comes back as exactly 135 lb, and as 61.2 kg', () => {
  const kg = parseWeight('135', 'lb')!;
  expect(inUnit(kg, 'lb')).toBe(135);
  expect(inUnit(kg, 'kg')).toBe(61.2);
});

test('every half pound survives the trip through kg', () => {
  for (let lb = 0; lb <= 999.5; lb += 0.5) expect(inUnit(lbToKg(lb), 'lb')).toBe(lb);
});

test('kg stays as typed, and shows in pounds to the nearest half', () => {
  expect(parseWeight('62,5', 'kg')).toBe(62.5);
  expect(inUnit(62.5, 'kg')).toBe(62.5);
  expect(inUnit(62.5, 'lb')).toBe(138);
});

test('the same input rules in both units: half steps, up to 999.5, nothing else', () => {
  for (const unit of ['kg', 'lb'] as const) {
    expect(parseWeight('62.3', unit)).toBeNull();
    expect(parseWeight('1000', unit)).toBeNull();
    expect(parseWeight('abc', unit)).toBeNull();
    expect(parseWeight('0', unit)).toBe(0);
  }
});

test('otherUnit', () => {
  expect(otherUnit('kg')).toBe('lb');
  expect(otherUnit('lb')).toBe('kg');
});
