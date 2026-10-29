import { Stack } from 'expo-router';

import { t } from '@/i18n';
import { sheetOptions, useStackOptions } from '@/ui/stack-options';

// Exercises tab: the library (large title) and the add / rename sheet.
export default function ExercisesLayout() {
  return (
    <Stack screenOptions={useStackOptions()}>
      <Stack.Screen name="index" options={{ title: t('exercises.title'), headerLargeTitle: true }} />
      <Stack.Screen name="edit" options={sheetOptions} />
    </Stack>
  );
}
