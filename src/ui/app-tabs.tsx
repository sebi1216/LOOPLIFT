import { NativeTabs } from 'expo-router/native-tabs';

import { t } from '@/i18n';

// iPhone, iPad, Android: the platform's own tab bar (Liquid Glass on iOS 26+, Material on Android).
// Rule: platform owns navigation, brand owns content. Do not style or replace this bar.
// The web preview uses app-tabs.web.tsx instead.
export default function AppTabs() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('home.title')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>{t('profile.title')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
