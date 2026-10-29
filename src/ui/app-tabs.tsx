import { NativeTabs } from 'expo-router/native-tabs';

import { t } from '@/i18n';

import { useColors } from './use-colors';

// iPhone, iPad, Android: the platform's own tab bar (Liquid Glass on iOS 26+, Material on Android).
// Rule: platform owns navigation, brand owns content. Only the selected tint is ours (accent).
// The web preview uses app-tabs.web.tsx instead.
export default function AppTabs() {
  const c = useColors();
  return (
    <NativeTabs tintColor={c.accent}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('tab.today')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'sun.max', selected: 'sun.max.fill' }} md="today" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calendar">
        <NativeTabs.Trigger.Label>{t('tab.calendar')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="workouts">
        <NativeTabs.Trigger.Label>{t('tab.workouts')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="list.bullet" md="list" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="exercises">
        <NativeTabs.Trigger.Label>{t('tab.exercises')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="dumbbell" md="fitness_center" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
