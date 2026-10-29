import { Stack } from 'expo-router';

import { t } from '@/i18n';
import { sheetOptions, useStackOptions } from '@/ui/stack-options';

// Workouts tab: the list (large title), the workout editor, and the exercise picker sheet.
export default function WorkoutsLayout() {
  return (
    <Stack screenOptions={useStackOptions()}>
      <Stack.Screen name="index" options={{ title: t('workouts.title'), headerLargeTitle: true }} />
      <Stack.Screen
        name="[id]"
        options={{ title: t('editor.title'), headerLargeTitle: true, headerBackTitle: t('workouts.title') }}
      />
      <Stack.Screen name="add" options={sheetOptions} />
    </Stack>
  );
}
