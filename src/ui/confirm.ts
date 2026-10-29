import { Alert, Platform } from 'react-native';

import { t } from '@/i18n';

// Native alert for destructive actions that cannot be undone (rules.md 3: only those).
// The web preview has no Alert, so it uses the browser's confirm dialog.
export function confirmDelete(title: string, message: string, onDelete: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title}\n\n${message}`)) onDelete();
    return;
  }
  Alert.alert(title, message, [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('common.delete'), style: 'destructive', onPress: onDelete },
  ]);
}
