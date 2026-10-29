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

// The starter library: 60 common lifts. Names are translated (src/i18n, key lift.<id>)
// when the library is first created; after that they are the user's own text.
// `since`: the library version that added the lift (1 = the first 20). Saved data from an
// older version gets the newer lifts once (migrateLibrary in store.ts).
export const LIBRARY_VERSION = 2;
export const starterLifts: { id: string; muscleGroup: MuscleGroup; since?: number }[] = [
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
  { id: 'e21', muscleGroup: 'legs', since: 2 }, // Front Squat
  { id: 'e22', muscleGroup: 'legs', since: 2 }, // Bulgarian Split Squat
  { id: 'e23', muscleGroup: 'legs', since: 2 }, // Hip Thrust
  { id: 'e24', muscleGroup: 'legs', since: 2 }, // Leg Extension
  { id: 'e25', muscleGroup: 'legs', since: 2 }, // Lying Leg Curl
  { id: 'e26', muscleGroup: 'legs', since: 2 }, // Seated Leg Curl
  { id: 'e27', muscleGroup: 'legs', since: 2 }, // Goblet Squat
  { id: 'e28', muscleGroup: 'legs', since: 2 }, // Hack Squat
  { id: 'e29', muscleGroup: 'legs', since: 2 }, // Hip Adduction
  { id: 'e30', muscleGroup: 'legs', since: 2 }, // Hip Abduction
  { id: 'e31', muscleGroup: 'legs', since: 2 }, // Sumo Deadlift
  { id: 'e32', muscleGroup: 'legs', since: 2 }, // Step-up
  { id: 'e33', muscleGroup: 'chest', since: 2 }, // Incline Bench Press
  { id: 'e34', muscleGroup: 'chest', since: 2 }, // Dumbbell Bench Press
  { id: 'e35', muscleGroup: 'chest', since: 2 }, // Cable Fly
  { id: 'e36', muscleGroup: 'chest', since: 2 }, // Pec Deck
  { id: 'e37', muscleGroup: 'chest', since: 2 }, // Push-up
  { id: 'e38', muscleGroup: 'chest', since: 2 }, // Chest Press Machine
  { id: 'e39', muscleGroup: 'chest', since: 2 }, // Decline Bench Press
  { id: 'e40', muscleGroup: 'back', since: 2 }, // Dumbbell Row
  { id: 'e41', muscleGroup: 'back', since: 2 }, // T-Bar Row
  { id: 'e42', muscleGroup: 'back', since: 2 }, // Chin-up
  { id: 'e43', muscleGroup: 'back', since: 2 }, // Straight-Arm Pulldown
  { id: 'e44', muscleGroup: 'back', since: 2 }, // Back Extension
  { id: 'e45', muscleGroup: 'back', since: 2 }, // Rack Pull
  { id: 'e46', muscleGroup: 'back', since: 2 }, // Shrug
  { id: 'e47', muscleGroup: 'shoulders', since: 2 }, // Dumbbell Shoulder Press
  { id: 'e48', muscleGroup: 'shoulders', since: 2 }, // Arnold Press
  { id: 'e49', muscleGroup: 'shoulders', since: 2 }, // Rear Delt Fly
  { id: 'e50', muscleGroup: 'shoulders', since: 2 }, // Upright Row
  { id: 'e51', muscleGroup: 'shoulders', since: 2 }, // Cable Lateral Raise
  { id: 'e52', muscleGroup: 'arms', since: 2 }, // Skull Crusher
  { id: 'e53', muscleGroup: 'arms', since: 2 }, // Overhead Triceps Extension
  { id: 'e54', muscleGroup: 'arms', since: 2 }, // Close-Grip Bench Press
  { id: 'e55', muscleGroup: 'arms', since: 2 }, // Preacher Curl
  { id: 'e56', muscleGroup: 'arms', since: 2 }, // Incline Dumbbell Curl
  { id: 'e57', muscleGroup: 'arms', since: 2 }, // Cable Curl
  { id: 'e58', muscleGroup: 'core', since: 2 }, // Hanging Leg Raise
  { id: 'e59', muscleGroup: 'core', since: 2 }, // Cable Crunch
  { id: 'e60', muscleGroup: 'core', since: 2 }, // Ab Wheel Rollout
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
