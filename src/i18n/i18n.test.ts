import { longDate, monthTitle, shortWeekday, t } from './index';

test('values are filled in, in English and German', () => {
  expect(t('today.dayOf', { n: 1, total: 3 }, 'en')).toBe('Day 1 of 3');
  expect(t('today.dayOf', { n: 1, total: 3 }, 'de')).toBe('Tag 1 von 3');
  expect(t('tab.exercises', {}, 'de')).toBe('Übungen');
});

test('dates match the design and never shift a day', () => {
  expect(longDate('2026-11-05', 'en')).toBe('Thursday, 5 Nov');
  expect(longDate('2026-11-05', 'de')).toBe('Donnerstag, 5. Nov.');
  expect(shortWeekday('2026-11-05', 'en')).toBe('Thu');
  expect(shortWeekday('2026-11-05', 'de')).toBe('Do');
  expect(monthTitle('2026-11-01', '2026-11-05', 'en')).toBe('November');
  expect(monthTitle('2027-01-01', '2026-11-05', 'en')).toBe('January 2027');
});
