import { useLocalSearchParams } from 'expo-router';

import { ExerciseScreen } from '@/ui/exercise-screen';

// One lift from the Exercises tab: hero with cues, the hint, progress and history.
// States: filled /exercises/e1?state=filled&date=2026-11-05, never logged /exercises/e9?state=filled,
// comeback /exercises/e1?state=comeback&date=2026-11-05. The same screen inside a workout is
// /session/[exerciseId] (decision #13).
export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ExerciseScreen exerciseId={id} inSession={false} />;
}
