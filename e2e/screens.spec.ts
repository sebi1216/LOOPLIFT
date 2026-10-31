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
// Lena's demo data. A plain URL is the real app: empty on first launch, then saved.
const LENA = `state=filled&${DAY}`;
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
    await page.goto(`/?${LENA}`);
    await expect(page.getByTestId('today-plan')).toHaveText('Push');
    await expect(page.getByText(en('today.dayOf', { n: 1, total: 3 }))).toBeVisible();
    await expect(page.getByText('Thursday, 5 Nov')).toBeVisible();
    await expect(page.getByText('Bench Press')).toBeVisible();
    await expect(page.getByTestId('strip-2026-11-07')).toContainText('Rest');
    await shot(page, 'today');
  });

  test('dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`/?${LENA}`);
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
    await page.goto(`/change-day?day=2026-11-05&${LENA}`);
    await expect(page.getByText('Change Thursday, 5 Nov')).toBeVisible();
    await expect(page.getByTestId('option-replace')).toBeVisible();
    await expect(page.getByTestId('option-push')).toBeVisible();
    await shot(page, 'change-day-sheet');
  });

  test('Push the loop back: today becomes Rest, Push moves to Friday', async ({ page }) => {
    await page.goto(`/?${LENA}`);
    await tapUntil(page, 'change-day', () => expect(page.getByTestId('option-push')).toBeVisible({ timeout: 2000 }));
    await page.getByTestId('option-push').click();
    await expect(page.getByTestId('today-plan')).toHaveText('Rest');
    await expect(page.getByTestId('strip-2026-11-06')).toContainText('Push');
    await expect(page.getByTestId('strip-2026-11-07')).toContainText('Pull');
  });

  test('Replace this day only: today becomes Pull, tomorrow stays Pull', async ({ page }) => {
    await page.goto(`/?${LENA}`);
    await tapUntil(page, 'change-day', () => expect(page.getByTestId('replace-w2')).toBeVisible({ timeout: 2000 }));
    await page.getByTestId('replace-w2').click();
    await expect(page.getByTestId('today-plan')).toHaveText('Pull');
    await expect(page.getByText(en('today.setByYou'))).toBeVisible();
    await expect(page.getByTestId('strip-2026-11-06')).toContainText('Pull');
  });
});

test.describe('Calendar', () => {
  test('November with the loop, rest dashed, Fri 20 set by hand', async ({ page }) => {
    await page.goto(`/calendar?${LENA}`);
    await expect(page.getByTestId('month-title')).toHaveText('November');
    // Lena trained on 2 Nov (her demo history): a check in front of Push; the label says Done.
    await expect(page.getByTestId('day-2026-11-02')).toContainText('Push');
    await expect(page.getByTestId('day-2026-11-02')).toHaveAttribute('aria-label', /Push, Done/);
    await expect(page.getByTestId('loop-card')).toContainText('Push → Pull → Rest');
    await expect(page.getByTestId('day-2026-11-04')).toContainText('Rest');
    await expect(page.getByTestId('day-2026-11-20')).toHaveAttribute('aria-label', /Set by you/);
    await shot(page, 'calendar');
  });

  test('dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`/calendar?${LENA}`);
    await expect(page.getByTestId('month-title')).toHaveText('November');
    await shot(page, 'calendar-dark');
  });

  test('next month keeps the loop going', async ({ page }) => {
    await page.goto(`/calendar?${LENA}`);
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
    await page.goto(`/calendar/loop?${LENA}`);
    await expect(page.getByTestId('loop-count')).toHaveText(en('loop.daysCount', { n: 3 }));
    await shot(page, 'rotation-editor');
    await tapUntil(page, 'add-slot', () => expect(page.getByTestId('add-w2')).toBeVisible({ timeout: 2000 }));
    await page.getByTestId('add-w2').click();
    await expect(page.getByTestId('loop-count')).toHaveText(en('loop.daysCount', { n: 4 }));
  });

  test('empty (?state=empty)', async ({ page }) => {
    await page.goto(`/calendar/loop?state=empty&${DAY}`);
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await shot(page, 'rotation-editor-empty');
  });
});

test.describe('Workouts', () => {
  test('Push and Pull with their loop days', async ({ page }) => {
    await page.goto(`/workouts?${LENA}`);
    await expect(page.getByTestId('workout-w1')).toContainText(en('workouts.loopDay', { n: 1 }));
    await expect(page.getByTestId('workout-w2')).toContainText(en('workouts.meta', { n: 4, sets: 13 }));
    await shot(page, 'workouts');
  });

  test('••• menu duplicates a workout', async ({ page }) => {
    await page.goto(`/workouts?${LENA}`);
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
  test('Push with target pills; tapping 4 × 6 opens the steppers, + adds a set', async ({ page }) => {
    await page.goto(`/workouts/w1?${LENA}`);
    await expect(page.getByTestId('workout-name')).toHaveValue('Push');
    await expect(page.getByTestId('target-0')).toHaveText('4 × 6');
    await shot(page, 'workout-editor');
    await tapUntil(page, 'target-0', () => expect(page.getByTestId('sets-0-value')).toBeVisible({ timeout: 2000 }));
    await expect(page.getByTestId('sets-0-value')).toHaveText(en('editor.sets', { n: 4 }));
    await tapUntil(page, 'sets-0-plus', () =>
      expect(page.getByTestId('sets-0-value')).not.toHaveText(en('editor.sets', { n: 4 }), { timeout: 1000 }),
    );
  });

  test('dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`/workouts/w1?${LENA}`);
    await expect(page.getByTestId('workout-name')).toHaveValue('Push');
    await shot(page, 'workout-editor-dark');
  });

  test('exercise picker marks lifts already in the workout', async ({ page }) => {
    await page.goto(`/workouts/add?id=w1&${LENA}`);
    await expect(page.getByTestId('pick-e1')).toContainText(en('pick.already'));
    await shot(page, 'exercise-picker');
  });

  test('a lift that is not in the library is created right in the picker', async ({ page }) => {
    await page.goto(`/workouts/w1?${LENA}`);
    await tapUntil(page, 'add-exercise', () => expect(page.getByTestId('pick-search')).toBeVisible({ timeout: 2000 }));
    await page.getByTestId('pick-search').fill('Sled Push');
    await expect(page.getByTestId('pick-create')).toContainText(en('pick.create', { name: 'Sled Push' }));
    await shot(page, 'exercise-picker-create');
    await page.getByTestId('create-legs').click();
    await expect(page.getByTestId('editor-row-4')).toContainText('Sled Push');
  });
});

test.describe('Exercises', () => {
  test('grouped library, last time, next-weight chip, search', async ({ page }) => {
    await page.goto(`/exercises?${LENA}`);
    await expect(page.getByTestId('exercise-e1')).toContainText(en('exercises.last', { kg: '65 kg', reps: 6, date: '2 Nov' }));
    await expect(page.getByTestId('next-e1')).toContainText(en('exercises.next', { kg: '67.5 kg' }));
    await expect(page.getByTestId('exercise-e9')).toContainText(en('exercises.notLogged'));
    await shot(page, 'exercises');
    await page.getByTestId('exercise-search').fill('curl');
    await expect(page.getByTestId('exercise-e8')).toBeVisible();
    await expect(page.getByTestId('exercise-e1')).toHaveCount(0);
  });

  test('add sheet', async ({ page }) => {
    await page.goto(`/exercises/edit?${LENA}`);
    await expect(page.getByTestId('exercise-name')).toBeVisible();
    await shot(page, 'exercise-edit');
  });
});

test.describe('Workout (spec 001 update 2)', () => {
  const openPush = async (page: Page) => {
    await page.goto(`/?${LENA}`);
    await tapUntil(page, 'lets-go', () => expect(page.getByTestId('session')).toBeVisible({ timeout: 2000 }));
  };
  const openTile = async (page: Page, i: number) => {
    await tapUntil(page, `tile-${i}`, () => expect(page.getByTestId('session-exercise')).toBeVisible({ timeout: 2000 }));
  };

  test('Start workout on Push: 4 tiles with last time and hints', async ({ page }) => {
    await openPush(page);
    await expect(page.locator('[data-testid^="tile-"][data-testid$="-hint"]')).toHaveCount(4);
    await expect(page.getByTestId('tile-0')).toContainText(en('session.last', { sets: 4, reps: 6, kg: '65 kg' }));
    await expect(page.getByTestId('tile-0-hint')).toContainText(en('hint.try', { kg: '67.5 kg' }));
    await expect(page.getByTestId('tile-1-hint')).toHaveText(en('hint.stay', { kg: '24 kg' }));
    await expect(page.getByTestId('session-done-count')).toHaveText(en('session.doneCount', { n: 0, total: 4 }));
    await shot(page, 'workout');
  });

  test('dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`/session?start=w1&${LENA}`);
    await expect(page.getByTestId('tile-0')).toBeVisible();
    await shot(page, 'workout-dark');
  });

  test('Bench Press: hint, Use 67.5 kg fills the sets; all ticked marks the tile done', async ({ page }) => {
    await openPush(page);
    await openTile(page, 0);
    await expect(page.getByTestId('hint-up')).toContainText(en('hint.upTitle'));
    for (let i = 0; i < 4; i++) await expect(page.getByTestId(`set-0-${i}-kg`)).toHaveValue('65');
    await page.getByTestId('hint-use').click();
    for (let i = 0; i < 4; i++) await expect(page.getByTestId(`set-0-${i}-kg`)).toHaveValue('67.5');
    await expect(page.getByTestId('hint-up')).toHaveCount(0);
    await page.getByTestId('set-0-0-tick').click();
    await page.getByTestId('set-0-1-tick').click();
    await expect(page.getByTestId('set-0-1-tick')).toHaveAttribute('aria-checked', 'true');
    await shot(page, 'exercise');
    await page.getByTestId('set-0-2-tick').click();
    await page.getByTestId('set-0-3-tick').click();
    await page.getByTestId('finish-exercise').click();
    await expect(page.getByTestId('tile-0-status')).toContainText(en('common.done'));
    await expect(page.getByTestId('session-done-count')).toHaveText(en('session.doneCount', { n: 1, total: 4 }));
  });

  test('Finish workout: Summary with the new record and the next loop day, then Done on Today and the Calendar', async ({ page }) => {
    await openPush(page);
    await openTile(page, 0);
    await page.getByTestId('hint-use').click();
    for (let i = 0; i < 4; i++) await page.getByTestId(`set-0-${i}-tick`).click();
    await page.getByTestId('finish-exercise').click();
    await openTile(page, 2);
    await page.getByTestId('set-2-0-tick').click();
    await page.getByTestId('finish-exercise').click();
    await tapUntil(page, 'finish-workout', () => expect(page.getByTestId('summary')).toBeVisible({ timeout: 2000 }));
    await expect(page.getByTestId('summary-records')).toContainText('1');
    await expect(page.getByTestId('record-e1')).toContainText(en('summary.recordBody', { kg: '67.5 kg', reps: 6, over: '2.5 kg' }));
    await expect(page.getByTestId('summary-next-day')).toHaveText(en('summary.nextLoop', { plan: 'Pull', when: en('summary.tomorrow') }));
    await shot(page, 'summary');
    await page.getByTestId('summary-done').click();
    await expect(page.getByTestId('today-done')).toBeVisible();
    await expect(page.getByTestId('lets-go')).toHaveCount(0);
    await shot(page, 'today-done');
    // In-app navigation: a new page load would reset Lena's demo data.
    await page.getByRole('tab', { name: en('tab.calendar') }).click();
    await expect(page.getByTestId('day-2026-11-05')).toHaveAttribute('aria-label', /Done/);
    await page.getByRole('tab', { name: en('tab.exercises') }).click();
    await page.getByTestId('exercise-e3').click();
    // Overhead Press: one ticked set of three is kept.
    await expect(page.getByTestId('past-2026-11-05')).toContainText('1 × 8 · 40 kg');
    await expect(page.getByTestId('chart').locator('circle')).toHaveCount(15);
  });
});

test.describe('Exercise screen (spec 001)', () => {
  test('Bench Press from the Exercises tab: hero with cues, hint, one point per finished Push, newest first', async ({ page }) => {
    await page.goto(`/exercises/e1?${LENA}`);
    await expect(page.getByText(en('cue.e1').split('|')[0])).toBeVisible();
    await expect(page.getByTestId('hint-up')).toBeVisible();
    await expect(page.getByTestId('hint-use')).toHaveCount(0);
    await expect(page.getByTestId('chart').locator('circle')).toHaveCount(14);
    await expect(page.getByTestId('chart')).toHaveAttribute('aria-label', /57.5\skg.*65\skg/);
    await expect(page.locator('[data-testid^="past-2026-"][data-testid$="-open"]').first()).toContainText('2 Nov');
    await shot(page, 'exercise-detail');
  });

  test('dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`/session?start=w1&${LENA}`);
    await tapUntil(page, 'tile-0', () => expect(page.getByTestId('session-exercise')).toBeVisible({ timeout: 2000 }));
    await expect(page.getByTestId('chart')).toBeVisible();
    await shot(page, 'exercise-dark');
  });

  test('comeback (?state=comeback): Welcome back at about 90%', async ({ page }) => {
    await page.goto(`/session?start=w1&state=comeback&${DAY}`);
    await tapUntil(page, 'tile-0', () => expect(page.getByTestId('session-exercise')).toBeVisible({ timeout: 2000 }));
    await expect(page.getByTestId('hint-comeback')).toContainText(en('hint.comebackTitle'));
    await expect(page.getByTestId('hint-use')).toHaveText(en('hint.use', { kg: '57.5 kg' }));
    await shot(page, 'exercise-comeback');
  });

  test('a lift never logged shows the empty state and a placeholder drawing', async ({ page }) => {
    await page.goto(`/exercises/e9?${LENA}`);
    await expect(page.getByText(en('exercise.empty'))).toBeVisible();
    await expect(page.getByTestId('chart')).toHaveCount(0);
    await shot(page, 'exercise-detail-empty');
  });

  test('editing a past set updates history and graph; Undo brings a deleted workout back', async ({ page }) => {
    await page.goto(`/exercises/e1?${LENA}`);
    await tapUntil(page, 'past-2026-11-02-open', () =>
      expect(page.getByTestId('past-2026-11-02-set-0-kg')).toBeVisible({ timeout: 2000 }),
    );
    await page.getByTestId('past-2026-11-02-set-0-kg').fill('67,5');
    await page.getByTestId('past-2026-11-02-done').click();
    await expect(page.getByTestId('past-2026-11-02')).toContainText('4 × 6 · 67.5 kg');
    await expect(page.getByTestId('chart')).toHaveAttribute('aria-label', /to 67.5\skg on 2 Nov/);

    await page.getByTestId('past-2026-11-02-more').click();
    await page.getByRole('menuitem', { name: en('exercise.deleteSession') }).click();
    await expect(page.getByTestId('past-2026-11-02')).toHaveCount(0);
    await expect(page.getByTestId('chart').locator('circle')).toHaveCount(13);
    await page.getByTestId('undo-bar-undo').click();
    await expect(page.getByTestId('past-2026-11-02')).toContainText('67.5 kg');
    await expect(page.getByTestId('chart').locator('circle')).toHaveCount(14);
    await expect(page.getByTestId('undo-bar')).toHaveCount(0);
  });
});

test.describe('German (German text is longer: check it wraps well)', () => {
  test.use({ locale: 'de-DE' });
  const pages = [
    ['today-de', `/?${LENA}`, 'Donnerstag, 5. Nov.'],
    ['change-day-sheet-de', `/change-day?day=2026-11-05&${LENA}`, 'Loop nach hinten schieben'],
    ['calendar-de', `/calendar?${LENA}`, 'November'],
    ['rotation-editor-de', `/calendar/loop?${LENA}`, 'Dein Loop'],
    ['workout-editor-de', `/workouts/w1?${LENA}`, 'Bankdrücken'],
    ['exercises-de', `/exercises?${LENA}`, 'Bankdrücken'],
    ['workout-de', `/session?start=w1&${LENA}`, 'Bankdrücken'],
    ['exercise-detail-de', `/exercises/e1?${LENA}`, 'Schulterblätter zurück und runter'],
  ] as const;
  for (const [name, path, check] of pages) {
    test(name, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByText(check).first()).toBeVisible();
      await shot(page, name);
    });
  }
});

// Plain URLs here: any ?state= or ?date= switch is demo mode and saves nothing.
test.describe('Saved on the device (web preview: localStorage)', () => {
  test('first launch is empty and has no name', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByText(en('today.welcomePlain'), { exact: true })).toBeVisible();
  });

  async function createLegs(page: Page) {
    await page.goto('/');
    await tapUntil(page, 'empty-cta', () =>
      expect(page.getByTestId('workout-name')).toHaveValue(en('workouts.newName'), { timeout: 2000 }),
    );
    await page.getByTestId('workout-name').fill('Legs');
  }

  test('a new workout survives a restart', async ({ page }) => {
    await createLegs(page);
    await page.goto('/workouts');
    await expect(page.getByText('Legs')).toBeVisible();
    await page.reload();
    await expect(page.getByText('Legs')).toBeVisible();
  });

  test('a demo URL never overwrites saved data', async ({ page }) => {
    await createLegs(page);
    await page.goto(`/workouts?${LENA}`);
    await expect(page.getByTestId('workout-w1')).toBeVisible();
    await page.goto('/workouts');
    await expect(page.getByText('Legs')).toBeVisible();
    await expect(page.getByTestId('workout-w1')).toHaveCount(0);
  });
  test('a workout in progress survives a restart: Today shows Continue workout, the set keeps its numbers', async ({ page }) => {
    // A saved app with a one-day loop (Push every day) starting on the browser's real today.
    // Only written when nothing is saved yet, so the second load reads what the app saved.
    await page.addInitScript(() => {
      if (localStorage.getItem('looplift.data')) return;
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const data = {
        userName: null,
        libraryVersion: 2,
        exercises: [{ id: 'e1', name: 'Bench Press', muscleGroup: 'chest' }],
        workouts: [{ id: 'w1', name: 'Push', exercises: [{ exerciseId: 'e1', targetSets: 2, targetReps: 5 }] }],
        schedule: { rotation: { startDate: today, slots: ['w1'] }, entries: {}, shifts: [] },
        sessions: [],
      };
      localStorage.setItem('looplift.data', JSON.stringify({ v: 1, data }));
    });
    await page.goto('/');
    await tapUntil(page, 'lets-go', () => expect(page.getByTestId('session')).toBeVisible({ timeout: 2000 }));
    await tapUntil(page, 'tile-0', () => expect(page.getByTestId('session-exercise')).toBeVisible({ timeout: 2000 }));
    await page.getByTestId('set-0-0-kg').fill('72,5');
    await page.getByTestId('set-0-0-tick').click();
    await expect(page.getByTestId('set-0-0-tick')).toHaveAttribute('aria-checked', 'true');
    await page.goto('/');
    await tapUntil(page, 'continue-workout', () => expect(page.getByTestId('session')).toBeVisible({ timeout: 2000 }));
    await tapUntil(page, 'tile-0', () => expect(page.getByTestId('session-exercise')).toBeVisible({ timeout: 2000 }));
    await expect(page.getByTestId('set-0-0-kg')).toHaveValue('72.5');
    await expect(page.getByTestId('set-0-0-tick')).toHaveAttribute('aria-checked', 'true');
  });
});

test('layout wall shows Today in every frame', async ({ page }) => {
  await page.setViewportSize({ width: 1800, height: 1000 });
  await page.goto('/layout-wall.html');
  await expect(page.getByText('Sizes, not platforms.')).toBeVisible();
  const frames = page.locator('iframe');
  await expect(frames).toHaveCount(7);
  for (let i = 0; i < 7; i++) {
    await expect(frames.nth(i).contentFrame().getByTestId('empty-state')).toBeVisible({ timeout: 30_000 });
  }
  await page.screenshot({ path: 'e2e/screenshots/layout-wall.png', fullPage: true });
});
