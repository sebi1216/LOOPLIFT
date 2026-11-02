import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppData } from '@/data/store';
import { t, type StringKey } from '@/i18n';
import { Button } from '@/ui/button';
import { FormDemo } from '@/ui/form-demo';
import { FormNotes } from '@/ui/form-notes';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';

const HOME = '/' as Href;

// The form sheet: the big animated demo with cues and what to avoid. Opens over Today and over a
// running workout, so you never lose your place. /form?id=e9
export default function FormSheet() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const d = useAppData();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const exercise = d.exercises.find((e) => e.id === id);
  const close = () => (router.canGoBack() ? router.back() : router.replace(HOME));

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.md }]}
      testID="form-sheet">
      {exercise ? (
        <>
          <View style={styles.head}>
            <Text style={[styles.section, { color: c.textMuted }]}>{t(`muscle.${exercise.muscleGroup}` as StringKey)}</Text>
            <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
              {exercise.name}
            </Text>
          </View>
          <View style={[styles.card, { backgroundColor: c.bgRaised }]}>
            <FormDemo id={exercise.id} name={exercise.name} testID="form-demo" />
            <FormNotes id={exercise.id} />
          </View>
        </>
      ) : (
        <Text style={[styles.body, { color: c.textMuted }]}>{t('exercise.missing')}</Text>
      )}
      <Button label={t('common.done')} variant="soft" onPress={close} testID="form-done" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.md, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  head: { gap: space.xs },
  section: { ...font.section, textTransform: 'uppercase' },
  title: { ...font.title },
  card: { borderRadius: radius.lg, padding: space.md, gap: space.md },
  body: { ...font.body },
});
