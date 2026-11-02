// "Rest over" as a notification, so it reaches you with the phone locked or another app open.
// Only when the Rest alert setting is on and the phone allowed notifications. With the app in
// front, the rest bar and the haptic already say it, so the notification stays silent there.
// Nothing leaves the phone: it is a local notification, no push server, no token.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { t } from '@/i18n';

import { getSettings } from './settings';

export const restAlertAvailable = Platform.OS !== 'web';

let scheduled: string | null = null;
// Each schedule or cancel gets a new number; an answer for an older number is taken back.
let generation = 0;
let handlerSet = false;

function setHandler() {
  if (handlerSet) return;
  handlerSet = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: false, shouldShowList: false, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

// Asks the phone once (the system dialog). True when notifications are allowed.
export async function allowRestAlert(): Promise<boolean> {
  if (!restAlertAvailable) return false;
  try {
    const now = await Notifications.getPermissionsAsync();
    if (now.granted) return true;
    if (!now.canAskAgain) return false;
    return (await Notifications.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

export function cancelRestAlert() {
  generation++;
  const id = scheduled;
  scheduled = null;
  if (id) Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}

// Replaces any earlier one, so plus, minus and a new set never leave two behind.
export function scheduleRestAlert(endsAt: number) {
  if (!restAlertAvailable) return;
  cancelRestAlert();
  if (!getSettings().restAlert) return;
  setHandler();
  const mine = generation;
  const seconds = Math.max(1, Math.ceil((endsAt - Date.now()) / 1000));
  Notifications.scheduleNotificationAsync({
    content: { title: t('rest.over'), body: t('rest.alertBody'), sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
  })
    .then((id) => {
      if (mine === generation) scheduled = id;
      else Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    })
    .catch(() => {});
}
