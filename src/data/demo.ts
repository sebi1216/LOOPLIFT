// Demo data and the data "service" for slice 1. Screens call these functions, never a backend.
// When a real backend comes (for example Supabase), only this folder changes, not the screens.

// CAST (story bible light): the same few made-up people and things on every screen, test and
// screenshot, so screens tell one consistent story. Rules: invented names only, no real people,
// no real emails or photos. Change the cast here, never inline in a screen.
export const cast = {
  hero: { id: 'u1', name: 'Lena', role: 'trains Push, Pull, Rest on a 3-day loop and checks Today every morning' },
  traveller: { id: 'u2', name: 'Jonas', role: 'trains Upper/Lower; travels for work, so he replaces days and pushes the loop back' },
  newcomer: { id: 'u3', name: 'Mia', role: 'just installed the app, sees empty states' },
} as const;

// HERO CONTENT SET: Lena's split. Plain data only; the scheduling logic (resolveDay) comes later.
export type DemoExercise = { id: string; name: string; muscleGroup: string };
export type DemoWorkoutExercise = { exerciseId: string; targetSets: number; targetReps: number };
export type DemoWorkout = { id: string; name: string; exercises: DemoWorkoutExercise[] };
export type DemoRotation = { id: string; startDate: string; slots: (string | 'rest')[] };

export const demoExercises: DemoExercise[] = [
  { id: 'e1', name: 'Bench Press', muscleGroup: 'Chest' },
  { id: 'e2', name: 'Incline DB Press', muscleGroup: 'Chest' },
  { id: 'e3', name: 'Overhead Press', muscleGroup: 'Shoulders' },
  { id: 'e4', name: 'Triceps Pushdown', muscleGroup: 'Arms' },
  { id: 'e5', name: 'Pull-up', muscleGroup: 'Back' },
  { id: 'e6', name: 'Barbell Row', muscleGroup: 'Back' },
  { id: 'e7', name: 'Face Pull', muscleGroup: 'Shoulders' },
  { id: 'e8', name: 'Biceps Curl', muscleGroup: 'Arms' },
];

export const demoWorkouts: DemoWorkout[] = [
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
export const demoRotation: DemoRotation = { id: 'r1', startDate: '2026-11-02', slots: ['w1', 'w2', 'rest'] };

export type DemoItem = {
  id: string;
  title: string;
  subtitle: string;
};

export function getDemoItems(): DemoItem[] {
  return demoWorkouts.map((w) => ({
    id: w.id,
    title: `${cast.hero.name}'s ${w.name}`,
    subtitle: `${w.exercises.length} exercises`,
  }));
}
