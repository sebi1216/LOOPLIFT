import { Alert, Platform } from 'react-native';

import { t } from '@/i18n';

// Native alert for destructive actions that cannot be undone (rules.md 3: only those).
// The web preview has no Alert, so it uses the browser's confirm dialog.
// confirmLabel names the action on the button ("Discard"), so it matches the question.
export function confirmDelete(title: string, message: string, onDelete: () => void, confirmLabel = t('common.delete')) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title}\n\n${message}`)) onDelete();
    return;
  }
  Alert.alert(title, message, [
    { text: t('common.cancel'), style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onDelete },
  ]);
}
