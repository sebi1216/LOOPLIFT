import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { actions, ops, useAppData } from '@/data/store';
import { t, type StringKey } from '@/i18n';
import { Icon } from '@/ui/icon';
import { SearchField } from '@/ui/search-field';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Exercise picker sheet: search the library, tap one to add it (3 x 10, change it after).
// /workouts/add?id=w1
export default function AddExercise() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const d = useAppData();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = d.workouts.find((w) => w.id === id);
  const [q, setQ] = useState('');
  const inWorkout = new Set(workout?.exercises.map((e) => e.exerciseId));

  const add = (exerciseId: string) => {
    if (!workout) return;
    actions.updateWorkout(workout.id, {
      exercises: [...workout.exercises, { exerciseId, targetSets: 3, targetReps: 10 }],
    });
    router.back();
  };

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled" style={{ backgroundColor: c.bg }} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.md }]} testID="pick-exercise">
      <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
        {t('pick.title')}
      </Text>
      <SearchField value={q} onChange={setQ} placeholder={t('exercises.search')} testID="pick-search" />
      {ops.groupByMuscle(d, q).map(({ group: g, items }) => {
        return (
          <View key={g} style={styles.group}>
            <Text style={[styles.section, { color: c.textMuted }]}>{t(`muscle.${g}` as StringKey).toUpperCase()}</Text>
            <View style={[styles.list, { backgroundColor: c.bgRaised }]}>
              {items.map((e, i) => {
                const added = inWorkout.has(e.id);
                return (
                  <Pressable
                    key={e.id}
                    accessibilityRole="button"
                    accessibilityLabel={e.name}
                    accessibilityState={{ disabled: added }}
                    disabled={added}
                    onPress={() => add(e.id)}
                    style={({ pressed }) => [styles.row, i > 0 && { borderTopColor: c.border, borderTopWidth: StyleSheet.hairlineWidth }, pressed && styles.pressed]}
                    testID={`pick-${e.id}`}>
                    <Text style={[styles.body, styles.flex, { color: added ? c.textMuted : c.text }]}>{e.name}</Text>
                    {added ? (
                      <Text style={[styles.caption, { color: c.textMuted }]}>{t('pick.already')}</Text>
                    ) : (
                      <Icon name="plus" size={17} color={c.accent} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.md, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  title: { ...font.titleSmall, paddingTop: space.sm },
  group: { gap: space.sm },
  section: { ...font.section },
  list: { borderRadius: radius.md, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: size.touch, paddingHorizontal: space.md },
  flex: { flex: 1 },
  body: { ...font.body },
  caption: { ...font.caption },
  pressed: { opacity: 0.7 },
});
