import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getDemoItems } from '@/data/demo';
import { t } from '@/i18n';
import { Button } from '@/ui/button';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';

// Home screen. Try /?state=empty in the preview: every state of a screen gets a URL like this,
// so screenshots and tests can show it.
export default function Home() {
  const c = useColors();
  const { state } = useLocalSearchParams<{ state?: string }>();
  const [taps, setTaps] = useState(0);
  const items = state === 'empty' ? [] : getDemoItems();

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: c.text }]}>{t('home.hello')}</Text>
        <Button label={t('home.button')} onPress={() => setTaps((n) => n + 1)} testID="tap-button" />
        <Text style={[styles.body, { color: c.textMuted }]} testID="tap-count">
          {t('home.taps', { count: taps })}
        </Text>

        <Text style={[styles.headline, { color: c.text }]}>{t('home.listTitle')}</Text>
        {items.length === 0 ? (
          <Text style={[styles.body, { color: c.textMuted }]} testID="empty-state">
            {t('home.empty')}
          </Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={[styles.card, { backgroundColor: c.bgRaised }]}>
              <Text style={[styles.headline, { color: c.text }]}>{item.title}</Text>
              <Text style={[styles.caption, { color: c.textMuted }]}>{item.subtitle}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: space.md,
    gap: space.md,
    width: '100%',
    maxWidth: size.maxContent,
    alignSelf: 'center',
  },
  title: { ...font.title },
  headline: { ...font.headline },
  body: { ...font.body },
  caption: { ...font.caption },
  card: { padding: space.md, borderRadius: radius.md, gap: space.xs },
});
