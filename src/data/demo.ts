// Demo data for slice 1. Screens read it through the store (src/data/store.ts), never a backend.
// When persistence or a backend comes, only this folder changes, not the screens.

import type { Schedule } from './schedule';

// CAST (story bible light): the same few made-up people and things on every screen, test and
// screenshot, so screens tell one consistent story. Rules: invented names only, no real people,
// no real emails or photos. Change the cast here, never inline in a screen.
export const cast = {
  hero: { id: 'u1', name: 'Lena', role: 'trains Push, Pull, Rest on a 3-day loop and checks Today every morning' },
  traveller: { id: 'u2', name: 'Jonas', role: 'trains Upper/Lower; travels for work, so he replaces days and pushes the loop back' },
  newcomer: { id: 'u3', name: 'Mia', role: 'just installed the app, sees empty states' },
} as const;

export const muscleGroups = ['arms', 'back', 'chest', 'core', 'legs', 'shoulders'] as const;
export type MuscleGroup = (typeof muscleGroups)[number];

export type Exercise = { id: string; name: string; muscleGroup: MuscleGroup };
export type WorkoutExercise = { exerciseId: string; targetSets: number; targetReps: number };
export type Workout = { id: string; name: string; exercises: WorkoutExercise[] };

// The starter library: about 20 common lifts. Names are translated (src/i18n, key lift.<id>)
// when the library is first created; after that they are the user's own text.
export const starterLifts: { id: string; muscleGroup: MuscleGroup }[] = [
  { id: 'e1', muscleGroup: 'chest' }, // Bench Press
  { id: 'e2', muscleGroup: 'chest' }, // Incline DB Press
  { id: 'e3', muscleGroup: 'shoulders' }, // Overhead Press
  { id: 'e4', muscleGroup: 'arms' }, // Triceps Pushdown
  { id: 'e5', muscleGroup: 'back' }, // Pull-up
  { id: 'e6', muscleGroup: 'back' }, // Barbell Row
  { id: 'e7', muscleGroup: 'shoulders' }, // Face Pull
  { id: 'e8', muscleGroup: 'arms' }, // Biceps Curl
  { id: 'e9', muscleGroup: 'legs' }, // Back Squat
  { id: 'e10', muscleGroup: 'legs' }, // Deadlift
  { id: 'e11', muscleGroup: 'legs' }, // Romanian Deadlift
  { id: 'e12', muscleGroup: 'legs' }, // Leg Press
  { id: 'e13', muscleGroup: 'legs' }, // Walking Lunge
  { id: 'e14', muscleGroup: 'legs' }, // Calf Raise
  { id: 'e15', muscleGroup: 'back' }, // Lat Pulldown
  { id: 'e16', muscleGroup: 'back' }, // Seated Cable Row
  { id: 'e17', muscleGroup: 'shoulders' }, // Lateral Raise
  { id: 'e18', muscleGroup: 'chest' }, // Dips
  { id: 'e19', muscleGroup: 'arms' }, // Hammer Curl
  { id: 'e20', muscleGroup: 'core' }, // Plank
];

// HERO CONTENT SET: Lena's split.
export const demoWorkouts: Workout[] = [
  {
    id: 'w1',
    name: 'Push',
    exercises: [
      { exerciseId: 'e1', targetSets: 4, targetReps: 6 },
      { exerciseId: 'e2', targetSets: 3, targetReps: 10 },
      { exerciseId: 'e3', targetSets: 3, targetReps: 8 },
      { exerciseId: 'e4', targetSets: 3, targetReps: 12 },
    ],
  },
  {
    id: 'w2',
    name: 'Pull',
    exercises: [
      { exerciseId: 'e5', targetSets: 4, targetReps: 8 },
      { exerciseId: 'e6', targetSets: 3, targetReps: 8 },
      { exerciseId: 'e7', targetSets: 3, targetReps: 15 },
      { exerciseId: 'e8', targetSets: 3, targetReps: 12 },
    ],
  },
];

// The example loop from the concept: Push, Pull, Rest starting Monday 2 Nov 2026.
// One day set by hand (Fri 20 Nov: Rest) so the Calendar shows the "set by you" look.
export const demoSchedule: Schedule = {
  rotation: { startDate: '2026-11-02', slots: ['w1', 'w2', 'rest'] },
  entries: { '2026-11-20': { kind: 'rest' } },
  shifts: [],
};

// The day the designs show (Thursday 5 Nov). Open any screen with ?date=2026-11-05 to see it.
export const demoToday = '2026-11-05';
