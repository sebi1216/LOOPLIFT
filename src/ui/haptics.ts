import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { getSettings } from '@/data/settings';

// Short taps you feel, each for one moment only (animate-expo: haptics confirm, never decorate).
// Off when the Haptics setting is off; nothing on web. A phone without a haptic engine ignores
// them, so a failed call is fine.
type Kind = 'tick' | 'step' | 'restOver' | 'record';

export function haptic(kind: Kind) {
  if (Platform.OS === 'web' || !getSettings().haptics) return;
  const run =
    kind === 'tick'
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      : kind === 'step'
        ? Haptics.selectionAsync()
        : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  run.catch(() => {});
}
