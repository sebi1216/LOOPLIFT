import { Stack, useGlobalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { applyUrlParams } from '@/data/store';
import { t } from '@/i18n';
import { sheetOptions, useStackOptions } from '@/ui/stack-options';

// Root: the four tabs, the Change-a-day sheet that opens over any tab, and the workout flow
// (pushed over the tabs: no tab bar while you train): tiles, one lift, Summary.
export default function RootLayout() {
  const { state, date } = useGlobalSearchParams<{ state?: string; date?: string }>();
  useEffect(() => applyUrlParams({ state, date }), [state, date]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={useStackOptions()}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="change-day" options={sheetOptions} />
        <Stack.Screen name="form" options={sheetOptions} />
        <Stack.Screen name="session/index" options={{ title: '', headerBackTitle: t('tab.today') }} />
        <Stack.Screen name="session/[exerciseId]" options={{ title: '' }} />
        <Stack.Screen name="session/summary" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
