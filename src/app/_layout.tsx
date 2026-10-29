import { Stack, useGlobalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { applyUrlParams } from '@/data/store';
import { sheetOptions, useStackOptions } from '@/ui/stack-options';

// Root: the four tabs, plus the Change-a-day sheet that opens over any tab.
export default function RootLayout() {
  const { state, date } = useGlobalSearchParams<{ state?: string; date?: string }>();
  useEffect(() => applyUrlParams({ state, date }), [state, date]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={useStackOptions()}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="change-day" options={sheetOptions} />
      </Stack>
    </GestureHandlerRootView>
  );
}
