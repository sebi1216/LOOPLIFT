// All user-facing text lives here, in English and German. Screens call t('key').
// German is often about 30% longer (E): check each new screen once in German.
const en = {
  'tab.today': 'Today',
  'tab.calendar': 'Calendar',
  'tab.workouts': 'Workouts',
  'tab.exercises': 'Exercises',

  'common.rest': 'Rest',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.save': 'Save',
  'common.done': 'Done',
  'common.close': 'Close',
  'common.moveUp': 'Move up',
  'common.moveDown': 'Move down',
  'common.dragHandle': 'Drag to reorder {name}',
  'common.exercises': '{n} exercises',
  'common.setsReps': '{sets} × {reps}',
  'common.setsRepsA11y': '{sets} sets of {reps} reps',

  'today.morning': 'Morning, {name}',
  'today.afternoon': 'Afternoon, {name}',
  'today.evening': 'Evening, {name}',
  'today.welcome': 'Welcome, {name}',
  'today.dayOf': 'Day {n} of {total}',
  'today.setByYou': 'Set by you',
  'today.pushedBack': 'Loop pushed back',
  'today.restBody': 'Recover today. Next up: {next}.',
  'today.freeTitle': 'Free',
  'today.beforeStart': 'Your loop starts {date}.',
  'today.noExercises': 'No exercises in this workout yet.',
  'today.strip': 'Next 7 days',
  'today.dayA11y': '{date}: {plan}',
  'today.letsGo': "Let's go",
  'today.changeDay': 'Change day',
  'today.noLoop': 'No loop yet',
  'today.noLoopSub': 'Today is free',
  'today.intro': 'Set up your training once. LoopLift then shows today and the next 7 days, every day.',
  'today.step1': 'Create a workout',
  'today.step1Sub': 'For example Push: bench and overhead press',
  'today.step2': 'Build your loop',
  'today.step2Sub': 'Push, Pull, Rest, and it repeats',
  'today.step3': 'Check Today',
  'today.step3Sub': 'Every morning, one glance',
  'today.stepDone': 'Done',
  'today.ctaWorkout': 'Create your first workout',
  'today.ctaLoop': 'Build your loop',

  'change.title': 'Change {date}',
  'change.subLoop': '{plan}, day {n} of {total} in your loop',
  'change.subToday': 'Today is {plan}, day {n} of {total} in your loop',
  'change.today': 'Today',
  'change.subManual': '{plan}, set by you',
  'change.subShift': 'Rest, the loop was pushed back here',
  'change.subNone': 'Nothing planned',
  'change.replace': 'Replace this day only',
  'change.replaceBody': 'Pick another workout or Rest for this day. The loop stays as it is.',
  'change.replaceWith': 'Replace with {plan}',
  'change.push': 'Push the loop back',
  'change.pushBody': '{day} becomes Rest. {plan} moves to {next} and every day after shifts by one.',
  'change.clear': 'Back to the loop',
  'change.clearBody': 'Remove your change. The loop decides this day again.',
  'change.footer': 'Both keep the rest of your loop correct. Highlighted days change.',
  'change.preview': 'Preview: {days}',

  'calendar.loop': 'Loop',
  'calendar.edit': 'Edit',
  'calendar.prev': 'Previous month',
  'calendar.next': 'Next month',
  'calendar.legend': 'Set by you, outside the loop. Dashed = rest.',
  'calendar.empty': 'No loop yet. Build one and it shows up here, repeating.',
  'calendar.build': 'Build your loop',

  'loop.title': 'Your loop',
  'loop.sub': '{n} days, then it repeats',
  'loop.subEmpty': 'No days yet',
  'loop.startsOn': 'Starts on',
  'loop.earlier': 'One day earlier',
  'loop.later': 'One day later',
  'loop.days': 'Days in your loop · drag to reorder',
  'loop.add': 'Add workout or Rest',
  'loop.addThis': 'Add {name}',
  'loop.recovery': 'Recovery',
  'loop.remove': 'Remove {name}',
  'loop.next7': 'Next 7 days with this loop',
  'loop.empty': 'Add a workout or Rest to start your loop.',

  'workouts.title': 'Workouts',
  'workouts.add': 'New workout',
  'workouts.newName': 'New workout',
  'workouts.meta': '{n} exercises · {sets} sets',
  'workouts.loopDay': 'Day {n} in your loop',
  'workouts.notInLoop': 'Not in your loop',
  'workouts.hint': 'Tap a workout to edit it. Use the ••• menu to duplicate or delete.',
  'workouts.more': 'More for {name}',
  'workouts.duplicate': 'Duplicate',
  'workouts.copyName': '{name} copy',
  'workouts.deleteTitle': 'Delete {name}?',
  'workouts.deleteBody': 'It also leaves your loop.',
  'workouts.empty': 'No workouts yet',
  'workouts.emptyBody': 'Create your first, for example Push: bench and overhead press.',

  'editor.title': 'Edit workout',
  'editor.name': 'Name',
  'editor.exercises': 'Exercises · drag to reorder',
  'editor.sets': '{n} sets',
  'editor.reps': '{n} reps',
  'editor.fewerSets': 'Fewer sets',
  'editor.moreSets': 'More sets',
  'editor.fewerReps': 'Fewer reps',
  'editor.moreReps': 'More reps',
  'editor.add': 'Add exercise',
  'editor.hint': 'Use − and + to change sets and reps. Swipe left on a row to remove it.',
  'editor.remove': 'Remove',
  'editor.removeA11y': 'Remove {name}',
  'editor.empty': 'No exercises yet. Add the first one.',
  'editor.missing': 'This workout no longer exists.',

  'pick.title': 'Add exercise',
  'pick.already': 'Added',

  'exercises.title': 'Exercises',
  'exercises.search': 'Search exercises',
  'exercises.add': 'New exercise',
  'exercises.inWorkouts': 'In {names}',
  'exercises.noMatch': 'No exercise matches "{q}".',
  'exercises.hint': 'Tap an exercise to rename it. Swipe left to delete.',
  'exercises.deleteTitle': 'Delete {name}?',
  'exercises.deleteUsed': 'It is in {names} and will be removed there too.',
  'exercises.deleteBody': 'This cannot be undone.',

  'exerciseEdit.new': 'New exercise',
  'exerciseEdit.edit': 'Edit exercise',
  'exerciseEdit.name': 'Name',
  'exerciseEdit.placeholder': 'For example Hip Thrust',
  'exerciseEdit.group': 'Muscle group',

  'muscle.arms': 'Arms',
  'muscle.back': 'Back',
  'muscle.chest': 'Chest',
  'muscle.core': 'Core',
  'muscle.legs': 'Legs',
  'muscle.shoulders': 'Shoulders',

  'lift.e1': 'Bench Press',
  'lift.e2': 'Incline DB Press',
  'lift.e3': 'Overhead Press',
  'lift.e4': 'Triceps Pushdown',
  'lift.e5': 'Pull-up',
  'lift.e6': 'Barbell Row',
  'lift.e7': 'Face Pull',
  'lift.e8': 'Biceps Curl',
  'lift.e9': 'Back Squat',
  'lift.e10': 'Deadlift',
  'lift.e11': 'Romanian Deadlift',
  'lift.e12': 'Leg Press',
  'lift.e13': 'Walking Lunge',
  'lift.e14': 'Calf Raise',
  'lift.e15': 'Lat Pulldown',
  'lift.e16': 'Seated Cable Row',
  'lift.e17': 'Lateral Raise',
  'lift.e18': 'Dips',
  'lift.e19': 'Hammer Curl',
  'lift.e20': 'Plank',
} as const;

export type StringKey = keyof typeof en;

const de: Record<StringKey, string> = {
  'tab.today': 'Heute',
  'tab.calendar': 'Kalender',
  'tab.workouts': 'Workouts',
  'tab.exercises': 'Übungen',

  'common.rest': 'Pause',
  'common.cancel': 'Abbrechen',
  'common.delete': 'Löschen',
  'common.save': 'Speichern',
  'common.done': 'Fertig',
  'common.close': 'Schließen',
  'common.moveUp': 'Nach oben',
  'common.moveDown': 'Nach unten',
  'common.dragHandle': '{name} ziehen zum Sortieren',
  'common.exercises': '{n} Übungen',
  'common.setsReps': '{sets} × {reps}',
  'common.setsRepsA11y': '{sets} Sätze à {reps} Wiederholungen',

  'today.morning': 'Guten Morgen, {name}',
  'today.afternoon': 'Hallo, {name}',
  'today.evening': 'Guten Abend, {name}',
  'today.welcome': 'Willkommen, {name}',
  'today.dayOf': 'Tag {n} von {total}',
  'today.setByYou': 'Von dir gesetzt',
  'today.pushedBack': 'Loop verschoben',
  'today.restBody': 'Heute erholen. Als Nächstes: {next}.',
  'today.freeTitle': 'Frei',
  'today.beforeStart': 'Dein Loop startet am {date}.',
  'today.noExercises': 'Dieses Workout hat noch keine Übungen.',
  'today.strip': 'Die nächsten 7 Tage',
  'today.dayA11y': '{date}: {plan}',
  'today.letsGo': "Los geht's",
  'today.changeDay': 'Tag ändern',
  'today.noLoop': 'Noch kein Loop',
  'today.noLoopSub': 'Heute ist frei',
  'today.intro': 'Richte dein Training einmal ein. LoopLift zeigt dir dann jeden Tag heute und die nächsten 7 Tage.',
  'today.step1': 'Workout erstellen',
  'today.step1Sub': 'Zum Beispiel Push: Bankdrücken und Schulterdrücken',
  'today.step2': 'Loop bauen',
  'today.step2Sub': 'Push, Pull, Pause, und er wiederholt sich',
  'today.step3': 'Heute ansehen',
  'today.step3Sub': 'Jeden Morgen ein Blick',
  'today.stepDone': 'Erledigt',
  'today.ctaWorkout': 'Erstes Workout erstellen',
  'today.ctaLoop': 'Loop bauen',

  'change.title': '{date} ändern',
  'change.subLoop': '{plan}, Tag {n} von {total} in deinem Loop',
  'change.subToday': 'Heute ist {plan}, Tag {n} von {total} in deinem Loop',
  'change.today': 'Heute',
  'change.subManual': '{plan}, von dir gesetzt',
  'change.subShift': 'Pause, der Loop wurde hier verschoben',
  'change.subNone': 'Nichts geplant',
  'change.replace': 'Nur diesen Tag ersetzen',
  'change.replaceBody': 'Wähle ein anderes Workout oder Pause für diesen Tag. Der Loop bleibt, wie er ist.',
  'change.replaceWith': 'Durch {plan} ersetzen',
  'change.push': 'Loop nach hinten schieben',
  'change.pushBody': '{day} wird zur Pause. {plan} rückt auf {next}, jeder Tag danach um eins weiter.',
  'change.clear': 'Zurück zum Loop',
  'change.clearBody': 'Deine Änderung entfernen. Der Loop bestimmt den Tag wieder.',
  'change.footer': 'Beides hält den Rest deines Loops richtig. Markierte Tage ändern sich.',
  'change.preview': 'Vorschau: {days}',

  'calendar.loop': 'Loop',
  'calendar.edit': 'Bearbeiten',
  'calendar.prev': 'Vorheriger Monat',
  'calendar.next': 'Nächster Monat',
  'calendar.legend': 'Von dir gesetzt, außerhalb des Loops. Gestrichelt = Pause.',
  'calendar.empty': 'Noch kein Loop. Bau einen, dann erscheint er hier und wiederholt sich.',
  'calendar.build': 'Loop bauen',

  'loop.title': 'Dein Loop',
  'loop.sub': '{n} Tage, dann wiederholt er sich',
  'loop.subEmpty': 'Noch keine Tage',
  'loop.startsOn': 'Startet am',
  'loop.earlier': 'Einen Tag früher',
  'loop.later': 'Einen Tag später',
  'loop.days': 'Tage in deinem Loop · ziehen zum Sortieren',
  'loop.add': 'Workout oder Pause hinzufügen',
  'loop.addThis': '{name} hinzufügen',
  'loop.recovery': 'Erholung',
  'loop.remove': '{name} entfernen',
  'loop.next7': 'Die nächsten 7 Tage mit diesem Loop',
  'loop.empty': 'Füge ein Workout oder eine Pause hinzu, um deinen Loop zu starten.',

  'workouts.title': 'Workouts',
  'workouts.add': 'Neues Workout',
  'workouts.newName': 'Neues Workout',
  'workouts.meta': '{n} Übungen · {sets} Sätze',
  'workouts.loopDay': 'Tag {n} in deinem Loop',
  'workouts.notInLoop': 'Nicht in deinem Loop',
  'workouts.hint': 'Tippe auf ein Workout, um es zu bearbeiten. Im •••-Menü kannst du es duplizieren oder löschen.',
  'workouts.more': 'Mehr zu {name}',
  'workouts.duplicate': 'Duplizieren',
  'workouts.copyName': '{name} Kopie',
  'workouts.deleteTitle': '{name} löschen?',
  'workouts.deleteBody': 'Es wird auch aus deinem Loop entfernt.',
  'workouts.empty': 'Noch keine Workouts',
  'workouts.emptyBody': 'Erstelle dein erstes, zum Beispiel Push: Bankdrücken und Schulterdrücken.',

  'editor.title': 'Workout bearbeiten',
  'editor.name': 'Name',
  'editor.exercises': 'Übungen · ziehen zum Sortieren',
  'editor.sets': '{n} Sätze',
  'editor.reps': '{n} Wdh.',
  'editor.fewerSets': 'Weniger Sätze',
  'editor.moreSets': 'Mehr Sätze',
  'editor.fewerReps': 'Weniger Wiederholungen',
  'editor.moreReps': 'Mehr Wiederholungen',
  'editor.add': 'Übung hinzufügen',
  'editor.hint': 'Mit − und + änderst du Sätze und Wiederholungen. Wische eine Zeile nach links, um sie zu entfernen.',
  'editor.remove': 'Entfernen',
  'editor.removeA11y': '{name} entfernen',
  'editor.empty': 'Noch keine Übungen. Füge die erste hinzu.',
  'editor.missing': 'Dieses Workout gibt es nicht mehr.',

  'pick.title': 'Übung hinzufügen',
  'pick.already': 'Drin',

  'exercises.title': 'Übungen',
  'exercises.search': 'Übungen suchen',
  'exercises.add': 'Neue Übung',
  'exercises.inWorkouts': 'In {names}',
  'exercises.noMatch': 'Keine Übung passt zu „{q}“.',
  'exercises.hint': 'Tippe auf eine Übung, um sie umzubenennen. Nach links wischen zum Löschen.',
  'exercises.deleteTitle': '{name} löschen?',
  'exercises.deleteUsed': 'Sie steckt in {names} und wird dort auch entfernt.',
  'exercises.deleteBody': 'Das lässt sich nicht rückgängig machen.',

  'exerciseEdit.new': 'Neue Übung',
  'exerciseEdit.edit': 'Übung bearbeiten',
  'exerciseEdit.name': 'Name',
  'exerciseEdit.placeholder': 'Zum Beispiel Hip Thrust',
  'exerciseEdit.group': 'Muskelgruppe',

  'muscle.arms': 'Arme',
  'muscle.back': 'Rücken',
  'muscle.chest': 'Brust',
  'muscle.core': 'Rumpf',
  'muscle.legs': 'Beine',
  'muscle.shoulders': 'Schultern',

  'lift.e1': 'Bankdrücken',
  'lift.e2': 'Schrägbankdrücken KH',
  'lift.e3': 'Schulterdrücken',
  'lift.e4': 'Trizepsdrücken am Kabel',
  'lift.e5': 'Klimmzug',
  'lift.e6': 'Langhantelrudern',
  'lift.e7': 'Face Pull',
  'lift.e8': 'Bizepscurl',
  'lift.e9': 'Kniebeuge',
  'lift.e10': 'Kreuzheben',
  'lift.e11': 'Rumänisches Kreuzheben',
  'lift.e12': 'Beinpresse',
  'lift.e13': 'Ausfallschritte',
  'lift.e14': 'Wadenheben',
  'lift.e15': 'Latziehen',
  'lift.e16': 'Rudern am Kabel',
  'lift.e17': 'Seitheben',
  'lift.e18': 'Dips',
  'lift.e19': 'Hammercurl',
  'lift.e20': 'Unterarmstütz',
};

const tables = { en, de } as const;
export type Locale = keyof typeof tables;

// Device language: German if it starts with "de", otherwise English.
function deviceLocale(): Locale {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase().startsWith('de') ? 'de' : 'en';
  } catch {
    return 'en';
  }
}

let current: Locale = deviceLocale();

export function setLocale(locale: Locale) {
  current = locale;
}

export function getLocale(): Locale {
  return current;
}

export function t(key: StringKey, vars: Record<string, string | number> = {}, locale: Locale = current): string {
  const template: string = tables[locale][key] ?? en[key];
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

// Dates arrive as ISO 'YYYY-MM-DD' and are formatted in UTC so the day never shifts.
const intlLocale = (l: Locale) => (l === 'de' ? 'de-DE' : 'en-GB');
function fmt(iso: string, opts: Intl.DateTimeFormatOptions, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { ...opts, timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
}

// "Thursday, 5 Nov" / "Donnerstag, 5. Nov."
export function longDate(iso: string, locale: Locale = current): string {
  return `${fmt(iso, { weekday: 'long' }, locale)}, ${fmt(iso, { day: 'numeric', month: 'short' }, locale)}`;
}

// "Thursday" / "Donnerstag"
export function weekdayName(iso: string, locale: Locale = current): string {
  return fmt(iso, { weekday: 'long' }, locale);
}

// "Mon, 2 Nov 2026" / "Mo., 2. Nov. 2026"
export function fullDate(iso: string, locale: Locale = current): string {
  return `${fmt(iso, { weekday: 'short' }, locale)}, ${fmt(iso, { day: 'numeric', month: 'short', year: 'numeric' }, locale)}`;
}

// "Thu" / "Do"
export function shortWeekday(iso: string, locale: Locale = current): string {
  return fmt(iso, { weekday: 'short' }, locale).replace('.', '');
}

// "M" / "M" (Monday first)
export function weekdayLetter(iso: string, locale: Locale = current): string {
  return fmt(iso, { weekday: 'narrow' }, locale);
}

// "November" or "November 2027" when the year differs from today's
export function monthTitle(iso: string, todayIso: string, locale: Locale = current): string {
  const sameYear = iso.slice(0, 4) === todayIso.slice(0, 4);
  return fmt(iso, sameYear ? { month: 'long' } : { month: 'long', year: 'numeric' }, locale);
}

export function dayOfMonth(iso: string): string {
  return String(Number(iso.slice(8, 10)));
}
