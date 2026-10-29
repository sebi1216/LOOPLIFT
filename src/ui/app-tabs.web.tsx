import { Tabs } from 'expo-router';

import { t } from '@/i18n';

import { useColors } from './use-colors';

// Web only: a plain bottom tab bar, so the web preview and the layout wall look like a phone.
// It is NOT what iOS or Android show (they use app-tabs.tsx). Check the real bar on a device.
export default function AppTabs() {
  const c = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: { backgroundColor: c.bg, borderTopColor: c.border },
        tabBarIconStyle: { display: 'none' },
      }}>
      <Tabs.Screen name="index" options={{ title: t('tab.today') }} />
      <Tabs.Screen name="calendar" options={{ title: t('tab.calendar') }} />
      <Tabs.Screen name="workouts" options={{ title: t('tab.workouts') }} />
      <Tabs.Screen name="exercises" options={{ title: t('tab.exercises') }} />
    </Tabs>
  );
}
