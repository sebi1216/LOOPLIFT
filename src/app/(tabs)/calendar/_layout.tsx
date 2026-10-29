import { Stack } from 'expo-router';

import { t } from '@/i18n';
import { useStackOptions } from '@/ui/stack-options';

// Calendar tab: the month (draws its own month title, no header) and the rotation editor.
export default function CalendarLayout() {
  return (
    <Stack screenOptions={useStackOptions()}>
      <Stack.Screen name="index" options={{ headerShown: false, title: t('tab.calendar') }} />
      <Stack.Screen name="loop" options={{ title: '', headerBackTitle: t('tab.calendar') }} />
    </Stack>
  );
}
