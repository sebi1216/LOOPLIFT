// "Rest over" as a notification, so it reaches you with the phone locked or another app open.
// Only when the Rest alert setting is on and the phone allowed notifications. With the app in
// front, the rest bar and the haptic already say it, so the notification stays silent there.
// Nothing leaves the phone: it is a local notification, no push server, no token.
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import { t } from '@/i18n';

import { getSettings } from './settings';

export const restAlertAvailable = Platform.OS !== 'web';

const CHANNEL = 'rest';

let scheduled: string | null = null;
// The last alert, which may be sitting on the lock screen by now. The next rest clears it.
let last: string | null = null;
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
    // Android 13 and later only show the dialog once a channel exists.
    if (Platform.OS === 'android') {
      // The enum is exported through index's `export *`, which this lint rule cannot follow.
      // eslint-disable-next-line import/namespace
      const importance = Notifications.AndroidImportance.HIGH;
      await Notifications.setNotificationChannelAsync(CHANNEL, { name: t('settings.restAlert'), importance });
    }
    const now = await Notifications.getPermissionsAsync();
    if (now.granted) return true;
    if (!now.canAskAgain) return false;
    return (await Notifications.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

// What the phone says right now, without asking: it can be turned off outside the app.
export async function restAlertAllowed(): Promise<boolean> {
  if (!restAlertAvailable) return false;
  try {
    return (await Notifications.getPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

// The system only asks once; after a no, the phone's own Settings are the way back.
export function openPhoneSettings() {
  if (restAlertAvailable) Linking.openSettings().catch(() => {});
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
  if (last) Notifications.dismissNotificationAsync(last).catch(() => {});
  last = null;
  if (!getSettings().restAlert) return;
  setHandler();
  const mine = generation;
  const seconds = Math.max(1, Math.ceil((endsAt - Date.now()) / 1000));
  Notifications.scheduleNotificationAsync({
    content: { title: t('rest.over'), body: t('rest.alertBody'), sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: CHANNEL },
  })
    .then((id) => {
      if (mine === generation) scheduled = last = id;
      else Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    })
    .catch(() => {});
}
