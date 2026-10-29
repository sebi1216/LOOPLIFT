import { expect, test as base } from '@playwright/test';

import { t } from '../src/i18n';

const HELLO = t('home.hello', {}, 'en');

// Every test fails if the page throws an error (for example a red error overlay) or logs a
// console error (for example a React "missing key" warning), even when the expected text is
// still visible behind it.
const test = base.extend<{ noPageErrors: void }>({
  noPageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
      });
      await use();
      expect(errors, 'errors in the page or the browser console').toEqual([]);
    },
    { auto: true },
  ],
});

test('home loads, the button works, screenshot saved', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(HELLO)).toBeVisible();
  // The first tap can land before React is ready (always true if web.output is ever set back
  // to "server" or "static"), so retry the tap until the counter changes.
  await expect(async () => {
    await page.getByTestId('tap-button').click();
    await expect(page.getByTestId('tap-count')).not.toHaveText(t('home.taps', { count: 0 }, 'en'), { timeout: 1000 });
  }).toPass({ timeout: 30_000 });
  await page.screenshot({ path: 'e2e/screenshots/home.png' });
});

test('every state has a URL: /?state=empty shows the empty state', async ({ page }) => {
  await page.goto('/?state=empty');
  await expect(page.getByTestId('empty-state')).toBeVisible();
  await page.screenshot({ path: 'e2e/screenshots/home-empty.png' });
});

test('profile tab opens', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByText(t('profile.empty', {}, 'en'))).toBeVisible();
  await page.screenshot({ path: 'e2e/screenshots/profile.png' });
});

test.describe('German', () => {
  test.use({ locale: 'de-DE' });
  test('home in German (German text is longer: check it wraps well)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(t('home.hello', {}, 'de'))).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/home-de.png' });
  });
});

test('layout wall is served from public/ and shows the app in every frame', async ({ page }) => {
  await page.setViewportSize({ width: 1800, height: 1000 });
  await page.goto('/layout-wall.html');
  await expect(page.getByText('Sizes, not platforms.')).toBeVisible();
  const frames = page.locator('iframe');
  await expect(frames).toHaveCount(7);
  for (let i = 0; i < 7; i++) {
    await expect(frames.nth(i).contentFrame().getByText(HELLO)).toBeVisible({ timeout: 30_000 });
  }
  await page.screenshot({ path: 'e2e/screenshots/layout-wall.png', fullPage: true });
});
