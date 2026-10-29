// Demo data for slice 1. Screens read it through the store (src/data/store.ts), never a backend.
// When persistence or a backend comes, only this folder changes, not the screens.

import { addDays, type Schedule } from './schedule';
import type { Session } from './tracker';

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

// Lena's last 6 weeks: Push every 3 days from Thu 24 Sep to Mon 2 Nov, Pull the day after each
// (her loop's rhythm), all finished. Every lift climbs slowly, so the graphs have a story:
// Bench Press 57.5 to 65 kg, and Thu 5 Nov prefills 4 x 65 kg x 6. Pull-up is bodyweight (0 kg).
const demoProgress: Record<string, { from: number; to: number; step: number; reps?: [number, number] }> = {
  e1: { from: 57.5, to: 65, step: 2.5 },
  e2: { from: 20, to: 24, step: 2 },
  e3: { from: 35, to: 40, step: 2.5 },
  e4: { from: 22.5, to: 27.5, step: 2.5 },
  e5: { from: 0, to: 0, step: 1, reps: [6, 8] },
  e6: { from: 50, to: 57.5, step: 2.5 },
  e7: { from: 15, to: 20, step: 2.5 },
  e8: { from: 10, to: 12, step: 1 },
};
const DEMO_WEEKS = 14;

function demoSession(w: Workout, i: number, date: string, id: string): Session {
  const level = (levels: number) => Math.min(levels - 1, Math.floor((i * levels) / DEMO_WEEKS));
  return {
    id,
    date,
    workoutId: w.id,
    workoutName: w.name,
    finished: true,
    exercises: w.exercises.map((e) => {
      const p = demoProgress[e.exerciseId];
      const kg = p.from + p.step * level(Math.round((p.to - p.from) / p.step) + 1);
      const reps = p.reps ? p.reps[0] + level(p.reps[1] - p.reps[0] + 1) : e.targetReps;
      return { ...e, sets: Array.from({ length: e.targetSets }, () => ({ kg, reps, done: true })) };
    }),
  };
}

export function demoSessions(): Session[] {
  const [push, pull] = demoWorkouts;
  return Array.from({ length: DEMO_WEEKS }, (_, i) => {
    const day = addDays('2026-09-24', i * 3);
    return [demoSession(push, i, day, `d${i * 2 + 1}`), demoSession(pull, i, addDays(day, 1), `d${i * 2 + 2}`)];
  }).flat();
}
