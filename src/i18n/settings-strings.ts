// Texts for the 2026-11-03 batch: weight unit and standard reps in Settings, skipped days on
// Today, removing a lift from a workout, a picture for a lift you add, gym days per year.
// English and German, merged into index.ts.
export const batchEn = {
  'settings.weights': 'Weights',
  'settings.unitA11y': 'Weight unit',
  'settings.unitKg': 'kg',
  'settings.unitLb': 'lb',
  'settings.showBoth': 'Show both units',
  'settings.showBothSub': 'Shows {other} too, and lets you type in either one.',
  'settings.defaultReps': 'Standard reps',
  'settings.defaultRepsSub': 'A lift you add to a workout starts with this.',
  'settings.repsValue': '{n} reps',
  'settings.fewerReps': 'Fewer standard reps',
  'settings.moreReps': 'More standard reps',

  'exercise.lb': '{kg} lb',
  'session.lb': 'lb',
  'session.lbA11y': 'Set {n}, lb',
  'summary.volumeLb': 'lb moved',

  'today.skippedTitle': 'Marked as rest',
  'today.skippedBody': 'No workout logged, so your loop waited. Trained after all? Put the day back.',
  'today.putBack': 'Put back',
  'today.putBackA11y': 'Put {date} back into the loop',

  'editor.removeButton': 'Remove from workout',

  'exerciseEdit.picture': 'Picture',
  'exerciseEdit.pictureA11y': 'Picture of {name}',
  'exerciseEdit.pictureNone': 'Dumbbell',

  'progress.yearA11y': '{year}: {n} gym days',
  'progress.yearCount': '{n} gym days',
} as const;

export const batchDe: Record<keyof typeof batchEn, string> = {
  'settings.weights': 'Gewichte',
  'settings.unitA11y': 'Gewichtseinheit',
  'settings.unitKg': 'kg',
  'settings.unitLb': 'lb',
  'settings.showBoth': 'Beide Einheiten zeigen',
  'settings.showBothSub': 'Zeigt auch {other} und du kannst in beiden eintippen.',
  'settings.defaultReps': 'Standard-Wiederholungen',
  'settings.defaultRepsSub': 'Damit startet eine Übung, die du ins Workout nimmst.',
  'settings.repsValue': '{n} Wdh.',
  'settings.fewerReps': 'Weniger Standard-Wiederholungen',
  'settings.moreReps': 'Mehr Standard-Wiederholungen',

  'exercise.lb': '{kg} lb',
  'session.lb': 'lb',
  'session.lbA11y': 'Satz {n}, lb',
  'summary.volumeLb': 'lb bewegt',

  'today.skippedTitle': 'Als Pause eingetragen',
  'today.skippedBody': 'Kein Training eingetragen, also hat dein Loop gewartet. Doch trainiert? Hol den Tag zurück.',
  'today.putBack': 'Zurückholen',
  'today.putBackA11y': '{date} zurück in den Loop holen',

  'editor.removeButton': 'Aus dem Workout entfernen',

  'exerciseEdit.picture': 'Bild',
  'exerciseEdit.pictureA11y': 'Bild von {name}',
  'exerciseEdit.pictureNone': 'Hantel',

  'progress.yearA11y': '{year}: {n} Gym-Tage',
  'progress.yearCount': '{n} Gym-Tage',
};
