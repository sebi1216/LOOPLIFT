import { t } from './index';

test('values are filled in, in English and German', () => {
  expect(t('home.taps', { count: 3 }, 'en')).toBe('Taps: 3');
  expect(t('home.taps', { count: 3 }, 'de')).toBe('Angetippt: 3');
  expect(t('profile.title', {}, 'de')).toBe('Profil');
});
