import { useLocalSearchParams } from 'expo-router';

import { ExerciseScreen } from '@/ui/exercise-screen';

// One lift inside the running workout: hint with Use / Keep, last time, set rows, Finish
// exercise (back to the tiles), then progress and history. Same screen as the Exercises tab.
// Demo: /session?start=w1&state=filled&date=2026-11-05, then tap a tile.
export default function SessionExercise() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  return <ExerciseScreen exerciseId={exerciseId} inSession />;
}
