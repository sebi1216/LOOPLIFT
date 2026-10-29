import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { font, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';

export default function Profile() {
  const c = useColors();
  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: c.bg }]}>
      <Text style={[styles.body, { color: c.textMuted }]}>{t('profile.empty')}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space.md, alignItems: 'center', justifyContent: 'center' },
  body: { ...font.body },
});
