import { expect, test as base, type Page } from '@playwright/test';

import { t } from '../src/i18n';

// One test per screen and state (docs/design/screens.md). Each saves the screenshot that
// /build-screen checks against the design: docs/design/checks/<screen>.png.
// ?date=2026-11-05 pretends today is Thursday 5 Nov (the day the designs show).
// Every test fails if the page throws or logs a console error.
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

const DAY = 'date=2026-11-05';
const en = (key: Parameters<typeof t>[0], vars: Record<string, string | number> = {}) => t(key, vars, 'en');
const shot = (page: Page, name: string) => page.screenshot({ path: `docs/design/checks/${name}.png` });

// The first tap can land before React is ready, so retry it until the expected change shows.
async function tapUntil(page: Page, testId: string, check: () => Promise<void>) {
  await expect(async () => {
    await page.getByTestId(testId).first().click();
    await check();
  }).toPass({ timeout: 30_000 });
}

test.describe('Today', () => {
  test('filled: Push, day 1 of 3, the week and the exercises', async ({ page }) => {
    await page.goto(`/?${DAY}`);
    await expect(page.getByTestId('today-plan')).toHaveText('Push');
    await expect(page.getByText(en('today.dayOf', { n: 1, total: 3 }))).toBeVisible();
    await expect(page.getByText('Thursday, 5 Nov')).toBeVisible();
    await expect(page.getByText('Bench Press')).toBeVisible();
    await expect(page.getByTestId('strip-2026-11-07')).toContainText('Rest');
    await shot(page, 'today');
  });

  test('dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`/?${DAY}`);
    await expect(page.getByTestId('today-plan')).toHaveText('Push');
    await shot(page, 'today-dark');
  });

  test('empty (?state=empty): Mia sees the three steps and one button', async ({ page }) => {
    await page.goto(`/?state=empty&${DAY}`);
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByText(en('today.welcome', { name: 'Mia' }))).toBeVisible();
    await expect(page.getByTestId('empty-cta')).toHaveText(en('today.ctaWorkout'));
    await shot(page, 'today-empty');
  });

  test('empty: the button creates a workout and opens the editor', async ({ page }) => {
    await page.goto(`/?state=empty&${DAY}`);
    await tapUntil(page, 'empty-cta', () =>
      expect(page.getByTestId('workout-name')).toHaveValue(en('workouts.newName'), { timeout: 2000 }),
    );
  });
});

test.describe('Change-a-day sheet', () => {
  test('both options, equal, each with a preview', async ({ page }) => {
    await page.goto(`/change-day?day=2026-11-05&${DAY}`);
    await expect(page.getByText('Change Thursday, 5 Nov')).toBeVisible();
    await expect(page.getByTestId('option-replace')).toBeVisible();
    await expect(page.getByTestId('option-push')).toBeVisible();
    await shot(page, 'change-day-sheet');
  });

  test('Push the loop back: today becomes Rest, Push moves to Friday', async ({ page }) => {
    await page.goto(`/?${DAY}`);
    await tapUntil(page, 'change-day', () => expect(page.getByTestId('option-push')).toBeVisible({ timeout: 2000 }));
    await page.getByTestId('option-push').click();
    await expect(page.getByTestId('today-plan')).toHaveText('Rest');
    await expect(page.getByTestId('strip-2026-11-06')).toContainText('Push');
    await expect(page.getByTestId('strip-2026-11-07')).toContainText('Pull');
  });

  test('Replace this day only: today becomes Pull, tomorrow stays Pull', async ({ page }) => {
    await page.goto(`/?${DAY}`);
    await tapUntil(page, 'change-day', () => expect(page.getByTestId('replace-w2')).toBeVisible({ timeout: 2000 }));
    await page.getByTestId('replace-w2').click();
    await expect(page.getByTestId('today-plan')).toHaveText('Pull');
    await expect(page.getByText(en('today.setByYou'))).toBeVisible();
    await expect(page.getByTestId('strip-2026-11-06')).toContainText('Pull');
  });
});

test.describe('Calendar', () => {
  test('November with the loop, rest dashed, Fri 20 set by hand', async ({ page }) => {
    await page.goto(`/calendar?${DAY}`);
    await expect(page.getByTestId('month-title')).toHaveText('November');
    await expect(page.getByTestId('day-2026-11-02')).toContainText('Push');
    await expect(page.getByTestId('day-2026-11-04')).toContainText('Rest');
    await expect(page.getByTestId('day-2026-11-20')).toHaveAttribute('aria-label', /Set by you/);
    await shot(page, 'calendar');
  });

  test('dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`/calendar?${DAY}`);
    await expect(page.getByTestId('month-title')).toHaveText('November');
    await shot(page, 'calendar-dark');
  });

  test('next month keeps the loop going', async ({ page }) => {
    await page.goto(`/calendar?${DAY}`);
    await tapUntil(page, 'month-next', () =>
      expect(page.getByTestId('month-title')).toHaveText('December', { timeout: 2000 }),
    );
    // 2 Nov + 30 days = 2 Dec: 30 mod 3 = 0, so Push again
    await expect(page.getByTestId('day-2026-12-02')).toContainText('Push');
  });

  test('empty (?state=empty)', async ({ page }) => {
    await page.goto(`/calendar?state=empty&${DAY}`);
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await shot(page, 'calendar-empty');
  });
});

test.describe('Rotation editor', () => {
  test('three days; adding Pull makes four', async ({ page }) => {
    await page.goto(`/calendar/loop?${DAY}`);
    await expect(page.getByText(en('loop.sub', { n: 3 }))).toBeVisible();
    await shot(page, 'rotation-editor');
    await tapUntil(page, 'add-slot', () => expect(page.getByTestId('add-w2')).toBeVisible({ timeout: 2000 }));
    await page.getByTestId('add-w2').click();
    await expect(page.getByText(en('loop.sub', { n: 4 }))).toBeVisible();
  });

  test('empty (?state=empty)', async ({ page }) => {
    await page.goto(`/calendar/loop?state=empty&${DAY}`);
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await shot(page, 'rotation-editor-empty');
  });
});

test.describe('Workouts', () => {
  test('Push and Pull with their loop days', async ({ page }) => {
    await page.goto(`/workouts?${DAY}`);
    await expect(page.getByTestId('workout-w1')).toContainText(en('workouts.loopDay', { n: 1 }));
    await expect(page.getByTestId('workout-w2')).toContainText(en('workouts.meta', { n: 4, sets: 13 }));
    await shot(page, 'workouts');
  });

  test('••• menu duplicates a workout', async ({ page }) => {
    await page.goto(`/workouts?${DAY}`);
    const item = page.getByRole('menuitem', { name: en('workouts.duplicate') });
    await tapUntil(page, 'more-w1', () => expect(item).toBeVisible({ timeout: 2000 }));
    await item.click();
    await expect(page.getByText(en('workouts.copyName', { name: 'Push' }))).toBeVisible();
  });

  test('empty (?state=empty)', async ({ page }) => {
    await page.goto(`/workouts?state=empty&${DAY}`);
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await shot(page, 'workouts-empty');
  });
});

test.describe('Workout editor', () => {
  test('Push with steppers; + adds a set', async ({ page }) => {
    await page.goto(`/workouts/w1?${DAY}`);
    await expect(page.getByTestId('workout-name')).toHaveValue('Push');
    await expect(page.getByTestId('sets-0-value')).toHaveText(en('editor.sets', { n: 4 }));
    await shot(page, 'workout-editor');
    await tapUntil(page, 'sets-0-plus', () =>
      expect(page.getByTestId('sets-0-value')).not.toHaveText(en('editor.sets', { n: 4 }), { timeout: 1000 }),
    );
  });

  test('dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`/workouts/w1?${DAY}`);
    await expect(page.getByTestId('workout-name')).toHaveValue('Push');
    await shot(page, 'workout-editor-dark');
  });

  test('exercise picker marks lifts already in the workout', async ({ page }) => {
    await page.goto(`/workouts/add?id=w1&${DAY}`);
    await expect(page.getByTestId('pick-e1')).toContainText(en('pick.already'));
    await shot(page, 'exercise-picker');
  });
});

test.describe('Exercises', () => {
  test('grouped library, In Push labels, search', async ({ page }) => {
    await page.goto(`/exercises?${DAY}`);
    await expect(page.getByTestId('exercise-e1')).toContainText(en('exercises.inWorkouts', { names: 'Push' }));
    await shot(page, 'exercises');
    await page.getByTestId('exercise-search').fill('curl');
    await expect(page.getByTestId('exercise-e8')).toBeVisible();
    await expect(page.getByTestId('exercise-e1')).toHaveCount(0);
  });

  test('add sheet', async ({ page }) => {
    await page.goto(`/exercises/edit?${DAY}`);
    await expect(page.getByTestId('exercise-name')).toBeVisible();
    await shot(page, 'exercise-edit');
  });
});

test.describe('German (German text is longer: check it wraps well)', () => {
  test.use({ locale: 'de-DE' });
  const pages = [
    ['today-de', `/?${DAY}`, 'Donnerstag, 5. Nov.'],
    ['change-day-sheet-de', `/change-day?day=2026-11-05&${DAY}`, 'Loop nach hinten schieben'],
    ['calendar-de', `/calendar?${DAY}`, 'November'],
    ['rotation-editor-de', `/calendar/loop?${DAY}`, 'Dein Loop'],
    ['workout-editor-de', `/workouts/w1?${DAY}`, 'Bankdrücken'],
    ['exercises-de', `/exercises?${DAY}`, 'Bankdrücken'],
  ] as const;
  for (const [name, path, check] of pages) {
    test(name, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByText(check).first()).toBeVisible();
      await shot(page, name);
    });
  }
});

test('layout wall shows Today in every frame', async ({ page }) => {
  await page.setViewportSize({ width: 1800, height: 1000 });
  await page.goto('/layout-wall.html');
  await expect(page.getByText('Sizes, not platforms.')).toBeVisible();
  const frames = page.locator('iframe');
  await expect(frames).toHaveCount(7);
  for (let i = 0; i < 7; i++) {
    await expect(frames.nth(i).contentFrame().getByTestId('today-card')).toBeVisible({ timeout: 30_000 });
  }
  await page.screenshot({ path: 'e2e/screenshots/layout-wall.png', fullPage: true });
});
