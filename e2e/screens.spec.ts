import { expect, test as base, type Page } from '@playwright/test';

import { t } from '../src/i18n';

// One test per screen and state (docs/design/screens.md). Each saves the screenshot that
// /build checks against the design: docs/design/checks/<screen>.png.
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
// Waits for arrivals to finish (ring, Summary), so the picture shows the settled screen.
const shot = async (page: Page, name: string) => {
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `docs/design/checks/${name}.png` });
};

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

test.describe('Loop on Today (the Calendar tab is gone)', () => {
  test('the loop card shows the loop and opens the Rotation editor', async ({ page }) => {
    await page.goto(`/?${LENA}`);
    await expect(page.getByTestId('edit-loop')).toContainText('Push → Pull → Rest');
    await expect(page.getByRole('tab', { name: 'Calendar' })).toHaveCount(0);
    await tapUntil(page, 'edit-loop', () => expect(page.getByTestId('rotation-editor')).toBeVisible({ timeout: 2000 }));
  });

  test('skipped (?state=skipped): three days marked as rest, one put back moves the loop', async ({ page }) => {
    await page.goto(`/?state=skipped&${DAY}`);
    await expect(page.getByTestId('skipped')).toContainText(en('today.skippedTitle'));
    await expect(page.locator('[data-testid^="put-back-"]')).toHaveCount(3);
    await expect(page.getByTestId('today-plan')).toHaveText('Push');
    await page.getByTestId('skipped').scrollIntoViewIfNeeded();
    await shot(page, 'today-skipped');
    // Wed 4 Nov back in the loop: Push was that day, so today is Pull.
    await tapUntil(page, 'put-back-2026-11-04', () => expect(page.getByTestId('today-plan')).toHaveText('Pull', { timeout: 2000 }));
    await expect(page.locator('[data-testid^="put-back-"]')).toHaveCount(2);
  });
});

test.describe('Rotation editor', () => {
  test('three days; adding Pull makes four', async ({ page }) => {
    await page.goto(`/loop?${LENA}`);
    await expect(page.getByTestId('loop-count')).toHaveText(en('loop.daysCount', { n: 3 }));
    await shot(page, 'rotation-editor');
    await tapUntil(page, 'add-slot', () => expect(page.getByTestId('add-w2')).toBeVisible({ timeout: 2000 }));
    await page.getByTestId('add-w2').click();
    await expect(page.getByTestId('loop-count')).toHaveText(en('loop.daysCount', { n: 4 }));
  });

  test('empty (?state=empty)', async ({ page }) => {
    await page.goto(`/loop?state=empty&${DAY}`);
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
    await page.getByTestId('art-e9').click();
    await expect(page.getByTestId('art-e9')).toHaveAttribute('aria-checked', 'true');
    await shot(page, 'exercise-picker-create');
    await page.getByTestId('create-legs').click();
    await expect(page.getByTestId('editor-row-4')).toContainText('Sled Push');
    // Standard reps from Settings: 8 unless changed.
    await expect(page.getByTestId('target-4')).toHaveText(en('common.setsReps', { sets: 3, reps: 8 }));
  });

  test('a lift can be removed: tap its target, then Remove from workout', async ({ page }) => {
    await page.goto(`/workouts/w1?${LENA}`);
    await expect(page.locator('[data-testid^="editor-row-"]')).toHaveCount(4);
    await tapUntil(page, 'target-0', () => expect(page.getByTestId('remove-0')).toBeVisible({ timeout: 2000 }));
    await shot(page, 'workout-editor-remove');
    await page.getByTestId('remove-0').click();
    await expect(page.locator('[data-testid^="editor-row-"]')).toHaveCount(3);
    await expect(page.getByTestId('editor-row-0')).toContainText('Incline DB Press');
  });

  test('a new lift picks its picture and keeps it', async ({ page }) => {
    await page.goto(`/exercises/edit?${LENA}`);
    await page.getByTestId('exercise-name').fill('Sled Push');
    await page.getByTestId('art-e10').click();
    await shot(page, 'exercise-new-picture');
    await page.getByTestId('exercise-save').click();
    await page.goto(`/exercises/edit?${LENA}`);
    await expect(page.getByTestId('art-none')).toHaveAttribute('aria-checked', 'true');
  });
});

test.describe('Exercises', () => {
  test('grouped library, last time, next-weight chip, search', async ({ page }) => {
    await page.goto(`/exercises?${LENA}`);
    await expect(page.getByTestId('exercise-e1')).toContainText(en('exercises.last', { kg: '65 kg · 143.5 lb', reps: 6, date: '2 Nov' }));
    await expect(page.getByTestId('next-e1')).toContainText(en('exercises.next', { kg: '67.5 kg · 149 lb' }));
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
    await expect(page.getByTestId('tile-0')).toContainText(en('session.last', { sets: 4, reps: 6, kg: '65 kg · 143.5 lb' }));
    await expect(page.getByTestId('tile-0-hint')).toContainText(en('hint.try', { kg: '67.5 kg · 149 lb' }));
    await expect(page.getByTestId('tile-1-hint')).toHaveText(en('hint.stay', { kg: '24 kg · 53 lb' }));
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

  test('Finish workout: Summary with the new record and the next loop day, then Done on Today and in Progress', async ({ page }) => {
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
    await expect(page.getByTestId('summary-volume')).toContainText(en('summary.volume'));
    await expect(page.getByTestId('record-e1')).toContainText(en('summary.recordBody', { kg: '67.5 kg · 149 lb', reps: 6, over: '2.5 kg · 5.5 lb' }));
    await expect(page.getByTestId('summary-next-day')).toHaveText(en('summary.nextLoop', { plan: 'Pull', when: en('summary.tomorrow') }));
    await shot(page, 'summary');
    await page.getByTestId('summary-done').click();
    await expect(page.getByTestId('today-done')).toBeVisible();
    await expect(page.getByTestId('lets-go')).toHaveCount(0);
    await shot(page, 'today-done');
    // In-app navigation: a new page load would reset Lena's demo data.
    await page.getByRole('tab', { name: en('tab.progress') }).click();
    await expect(page.getByTestId('gym-year-2026')).toHaveAttribute('aria-label', en('progress.yearA11y', { year: 2026, n: 29 }));
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
    await expect(page.getByTestId('hint-use')).toHaveText(en('hint.use', { kg: '57.5 kg · 127 lb' }));
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
    await expect(page.getByTestId('chart')).toHaveAttribute('aria-label', /to 67.5\skg · 149\slb on 2 Nov/);

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
    ['rotation-editor-de', `/loop?${LENA}`, 'Dein Loop'],
    ['today-skipped-de', `/?state=skipped&${DAY}`, 'Als Pause eingetragen'],
    ['settings-de', `/settings?${LENA}`, 'Standard-Wiederholungen'],
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

const figure = (page: Page, id: string) =>
  page.getByTestId(id).locator('svg path').evaluateAll((paths) => paths.map((p) => p.getAttribute('d')).join('|'));

test.describe('Form demos', () => {
  test('a lift without history shows the moving figure, cues and what to avoid; Pause stops it', async ({ page }) => {
    await page.goto(`/exercises/e9?${LENA}`);
    await expect(page.getByTestId('form-demo')).toBeVisible();
    await expect(page.getByTestId('form-avoid')).toContainText(en('avoid.e9'));
    await expect(page.getByText(en('cue.e9').split('|')[0])).toBeVisible();
    const before = await figure(page, 'form-demo');
    await expect.poll(() => figure(page, 'form-demo')).not.toBe(before);
    await page.getByTestId('form-demo-toggle').click();
    await page.waitForTimeout(100);
    const paused = await figure(page, 'form-demo');
    await page.waitForTimeout(400);
    expect(await figure(page, 'form-demo')).toBe(paused);
    await shot(page, 'form-demo');
  });

  test('every lift in the library has one, here in the last and a machine lift', async ({ page }) => {
    for (const id of ['e60', 'e28']) {
      await page.goto(`/exercises/${id}?${LENA}`);
      await expect(page.getByTestId('form-demo')).toBeVisible();
      await expect(page.getByTestId('form-avoid')).toContainText(en(`avoid.${id}` as Parameters<typeof t>[0]));
    }
  });

  test('a row on Today opens the form sheet', async ({ page }) => {
    await page.goto(`/?${LENA}`);
    await tapUntil(page, 'today-ex-e1', () => expect(page.getByTestId('form-sheet')).toBeVisible({ timeout: 2000 }));
    await expect(page.getByTestId('form-demo')).toBeVisible();
    await expect(page.getByText(en('cue.e1').split('|')[0])).toBeVisible();
    await shot(page, 'form-sheet');
  });

  test('in a workout the small figure opens the sheet and the sets stay as they were', async ({ page }) => {
    await page.goto(`/session?start=w1&${LENA}`);
    await tapUntil(page, 'tile-0', () => expect(page.getByTestId('session-exercise')).toBeVisible({ timeout: 2000 }));
    await tapUntil(page, 'show-form', () => expect(page.getByTestId('form-sheet')).toBeVisible({ timeout: 2000 }));
  });

  test('Reduce Motion: first and last pose side by side, nothing moves', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/exercises/e9?${LENA}`);
    await expect(page.getByText(en('form.start'), { exact: true })).toBeVisible();
    await expect(page.getByText(en('form.end'), { exact: true })).toBeVisible();
    await expect(page.getByTestId('form-demo-toggle')).toHaveCount(0);
    const before = await figure(page, 'form-demo');
    await page.waitForTimeout(500);
    expect(await figure(page, 'form-demo')).toBe(before);
    await shot(page, 'form-demo-reduced');
  });

  test.describe('German', () => {
    test.use({ locale: 'de-DE' });
    test('cues and the moment in words are in German', async ({ page }) => {
      await page.goto(`/form?id=e9&${LENA}`);
      await expect(page.getByTestId('form-avoid')).toContainText(t('avoid.e9', {}, 'de'));
      await expect(page.getByText(t('cue.e9', {}, 'de').split('|')[0])).toBeVisible();
      await shot(page, 'form-sheet-de');
    });
  });
});

test.describe('Rest timer and quick logging', () => {
  test('ticking a set starts the rest; plus, tiles, skip', async ({ page }) => {
    await page.goto(`/session?start=w1&${LENA}`);
    await tapUntil(page, 'tile-0', () => expect(page.getByTestId('session-exercise')).toBeVisible({ timeout: 2000 }));
    await expect(page.getByTestId('rest-bar')).toHaveCount(0);
    await page.getByTestId('set-0-0-tick').click();
    await expect(page.getByTestId('rest-time')).toHaveText(/^1:[23]\d$/);
    await shot(page, 'rest-timer');
    await page.getByTestId('rest-plus').click();
    await expect(page.getByTestId('rest-time')).toHaveText(/^1:[34]\d$/);
    // It keeps counting on the tiles, one level up.
    await page.getByTestId('finish-exercise').click();
    await expect(page.getByTestId('session')).toBeVisible();
    await expect(page.getByTestId('rest-bar')).toBeVisible();
    await page.getByTestId('rest-skip').click();
    await expect(page.getByTestId('rest-bar')).toHaveCount(0);
  });

  test('unticking takes the rest back', async ({ page }) => {
    await page.goto(`/session?start=w1&${LENA}`);
    await tapUntil(page, 'tile-0', () => expect(page.getByTestId('session-exercise')).toBeVisible({ timeout: 2000 }));
    await page.getByTestId('set-0-0-tick').click();
    await expect(page.getByTestId('rest-bar')).toBeVisible();
    await page.getByTestId('set-0-0-tick').click();
    await expect(page.getByTestId('rest-bar')).toHaveCount(0);
  });

  test('a new weight on the first set carries to the open sets below', async ({ page }) => {
    await page.goto(`/session?start=w1&${LENA}`);
    await tapUntil(page, 'tile-0', () => expect(page.getByTestId('session-exercise')).toBeVisible({ timeout: 2000 }));
    await page.getByTestId('set-0-0-kg').fill('70');
    await expect(page.getByTestId('set-0-1-kg')).toHaveValue('70');
    await expect(page.getByTestId('set-0-3-kg')).toHaveValue('70');
  });
});

test.describe('Settings', () => {
  const settingsBg = (page: Page) => page.getByTestId('settings').evaluate((el) => getComputedStyle(el).backgroundColor);

  test('notifications refused: the note and a way to the phone Settings', async ({ page }) => {
    await page.goto('/settings?state=denied');
    await expect(page.getByText(en('settings.restAlertDenied'))).toBeVisible();
    await expect(page.getByTestId('open-phone-settings')).toBeVisible();
    await shot(page, 'settings-denied');
  });

  test('the gear on Today opens Settings', async ({ page }) => {
    await page.goto(`/?${LENA}`);
    await tapUntil(page, 'open-settings', () => expect(page.getByTestId('settings')).toBeVisible({ timeout: 2000 }));
    await expect(page.getByTestId('setting-rest-length-plus')).toBeVisible();
    await expect(page.getByText(en('settings.restAlertWeb'))).toBeVisible();
    await shot(page, 'settings');
  });

  test('pounds with both units: weights read in lb then kg, typing 135 lb fills 61.2 kg, hints round to 5 lb', async ({ page }) => {
    await page.goto(`/settings?${LENA}`);
    await expect(page.getByTestId('setting-reps-value')).toHaveText(en('settings.repsValue', { n: 8 }));
    await page.getByText(en('settings.unitLb'), { exact: true }).click();
    // Show both units is on by default, so it is not touched here.
    await page.getByTestId('setting-reps-minus').click();
    await expect(page.getByTestId('setting-reps-value')).toHaveText(en('settings.repsValue', { n: 7 }));
    await shot(page, 'settings-weights');
    // Settings are not demo data: they stay while Lena's data loads again.
    await page.goto(`/?${LENA}`);
    await tapUntil(page, 'lets-go', () => expect(page.getByTestId('session')).toBeVisible({ timeout: 2000 }));
    await expect(page.getByTestId('tile-0-hint')).toContainText(en('hint.try', { kg: '150 lb · 68 kg' }));
    await tapUntil(page, 'tile-0', () => expect(page.getByTestId('session-exercise')).toBeVisible({ timeout: 2000 }));
    await page.getByLabel(en('session.lbA11y', { n: 1 })).fill('135');
    await expect(page.getByLabel(en('session.kgA11y', { n: 1 }))).toHaveValue('61.2');
    await shot(page, 'exercise-lb');
  });

  test('rest timer off: ticking a set starts no rest, and it stays off after a restart', async ({ page }) => {
    await page.goto('/settings');
    await tapUntil(page, 'setting-rest', () => expect(page.getByTestId('setting-rest-length-plus')).toHaveCount(0, { timeout: 2000 }));
    await page.goto(`/session?start=w1&${LENA}`);
    await tapUntil(page, 'tile-0', () => expect(page.getByTestId('session-exercise')).toBeVisible({ timeout: 2000 }));
    await page.getByTestId('set-0-0-tick').click();
    await expect(page.getByTestId('set-0-0-tick')).toHaveAttribute('aria-checked', 'true');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('rest-bar')).toHaveCount(0);
  });

  test('a longer rest length is used by the next rest', async ({ page }) => {
    await page.goto('/settings');
    await tapUntil(page, 'setting-rest-length-plus', () => expect(page.getByText('1:45', { exact: true })).toBeVisible({ timeout: 2000 }));
    await page.goto(`/session?start=w1&${LENA}`);
    await tapUntil(page, 'tile-0', () => expect(page.getByTestId('session-exercise')).toBeVisible({ timeout: 2000 }));
    await page.getByTestId('set-0-0-tick').click();
    await expect(page.getByTestId('rest-time')).toHaveText(/^1:[34]\d$/);
  });

  test('Dark turns the app dark and stays after a restart; System follows the browser', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/settings');
    await expect(page.getByTestId('settings')).toBeVisible();
    expect(await settingsBg(page)).toBe('rgb(242, 245, 247)');
    await expect(async () => {
      await page.getByText(en('settings.themeDark'), { exact: true }).click();
      expect(await settingsBg(page)).toBe('rgb(10, 18, 21)');
    }).toPass({ timeout: 30_000 });
    await shot(page, 'settings-dark');
    await page.goto(`/?${LENA}`);
    await page.reload();
    await expect(page.getByTestId('today-hero')).toBeVisible();
    await shot(page, 'today-dark-setting');
    await page.goto('/settings');
    expect(await settingsBg(page)).toBe('rgb(10, 18, 21)');
    await page.getByText(en('settings.themeSystem'), { exact: true }).click();
    await expect.poll(() => settingsBg(page)).toBe('rgb(242, 245, 247)');
  });

  test.describe('German', () => {
    test.use({ locale: 'de-DE' });
    test('labels wrap, nothing is cut', async ({ page }) => {
      await page.goto('/settings');
      await expect(page.getByText(t('settings.restTimerSub', {}, 'de'))).toBeVisible();
      await shot(page, 'settings-de');
    });
  });
});

test.describe('Progress', () => {
  test('gym days: one row per year, only years with a workout', async ({ page }) => {
    await page.goto(`/progress?${LENA}`);
    await expect(page.locator('[data-testid^="gym-year-"]')).toHaveCount(1);
    await expect(page.getByTestId('gym-year-2026')).toHaveAttribute('aria-label', en('progress.yearA11y', { year: 2026, n: 28 }));
    await expect(page.getByTestId('stat-streak')).toContainText(en('progress.streak', { n: 7 }));
    await shot(page, 'progress');
  });

  test('strength balance: now against start, no fake 0 kg for groups without data, the period changes it', async ({ page }) => {
    await page.goto(`/progress?${LENA}`);
    const strength = page.getByTestId('strength');
    await strength.scrollIntoViewIfNeeded();
    await expect(page.getByTestId('strength-change')).toContainText(/\+\d+\s?%/);
    await expect(page.getByTestId('group-legs')).toContainText(en('progress.noData'));
    await expect(page.getByTestId('group-chest')).toContainText('kg');
    await expect(page.getByTestId('strength-callout')).toContainText(en('progress.missing', { group: en('muscle.core') }));
    await page.waitForTimeout(900);
    await strength.screenshot({ path: 'docs/design/checks/progress-strength.png' });
    const all = await page.getByTestId('strength-period').textContent();
    await page.getByText(en('progress.period.week'), { exact: true }).click();
    await expect(page.getByTestId('strength-period')).not.toHaveText(all ?? '');
  });

  test('a group with only bodyweight lifts shows reps, not "no data", and no "nothing for Back" callout', async ({ page }) => {
    await page.addInitScript(() => {
      const session = (id: string, date: string, reps: number) => ({
        id,
        date,
        workoutId: 'w1',
        workoutName: 'Pull',
        finished: true,
        exercises: [{ exerciseId: 'e5', targetSets: 1, targetReps: reps, sets: [{ kg: 0, reps, done: true }] }],
      });
      const data = {
        userName: null,
        libraryVersion: 2,
        exercises: [{ id: 'e5', name: 'Pull-up', muscleGroup: 'back' }],
        workouts: [{ id: 'w1', name: 'Pull', exercises: [{ exerciseId: 'e5', targetSets: 1, targetReps: 8 }] }],
        schedule: { rotation: null, entries: {}, shifts: [] },
        sessions: [session('a', '2026-09-01', 6), session('b', '2026-10-20', 10)],
      };
      localStorage.setItem('looplift.data', JSON.stringify({ v: 1, data }));
    });
    await page.goto('/progress');
    await page.getByTestId('strength').scrollIntoViewIfNeeded();
    const back = page.getByTestId('group-back');
    await expect(back).toContainText(en('progress.reps', { n: 10 }));
    await expect(back).not.toContainText(en('progress.noData'));
    await expect(page.getByTestId('strength-callout')).not.toContainText(en('muscle.back'));
    await expect(page.getByTestId('strength-change')).toHaveCount(0);
  });

  test('first launch: Strength balance is there with a friendly note, no chart, no gym days', async ({ page }) => {
    await page.goto('/progress?state=empty');
    await expect(page.getByTestId('progress-empty')).toContainText(en('progress.strength'));
    await expect(page.getByTestId('gym-years')).toHaveCount(0);
    await expect(page.getByTestId('strength')).toHaveCount(0);
    await shot(page, 'progress-empty');
  });

  test('dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`/progress?${LENA}`);
    await expect(page.getByTestId('gym-years')).toBeVisible();
    await shot(page, 'progress-dark');
  });

  test.describe('German', () => {
    test.use({ locale: 'de-DE' });
    test('labels in German, Kraftverteilung', async ({ page }) => {
      await page.goto(`/progress?${LENA}`);
      await expect(page.getByText(t('progress.strength', {}, 'de'))).toBeVisible();
      await page.getByTestId('strength').scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);
      await page.getByTestId('strength').screenshot({ path: 'docs/design/checks/progress-strength-de.png' });
    });
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
