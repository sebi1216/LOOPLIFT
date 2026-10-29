import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { muscleGroups } from '@/data/demo';
import { actions, ops, useAppData } from '@/data/store';
import { t, type StringKey } from '@/i18n';
import { Chip } from '@/ui/chip';
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
  // Not in the library yet? Create it right here: pick its muscle group and it is added.
  const newName = q.trim();
  const canCreate = newName.length > 0 && !d.exercises.some((e) => e.name.toLowerCase() === newName.toLowerCase());

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
      {canCreate ? (
        <View style={[styles.create, { backgroundColor: c.bgRaised }]} testID="pick-create">
          <View style={styles.createHead}>
            <Icon name="plus" size={17} color={c.accent} />
            <Text style={[styles.headline, styles.flex, { color: c.text }]}>{t('pick.create', { name: newName })}</Text>
          </View>
          <Text style={[styles.caption, { color: c.textMuted }]}>{t('pick.createHint')}</Text>
          <View style={styles.chips}>
            {muscleGroups.map((g) => {
              const label = t(`muscle.${g}` as StringKey);
              return (
                <Chip
                  key={g}
                  label={label}
                  accessibilityLabel={t('pick.createAs', { name: newName, group: label })}
                  onPress={() => {
                    const newId = actions.addExercise(newName, g);
                    if (newId) add(newId);
                  }}
                  testID={`create-${g}`}
                />
              );
            })}
          </View>
        </View>
      ) : null}
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
  create: { borderRadius: radius.md, padding: space.md, gap: space.sm },
  createHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  headline: { ...font.headline },
  section: { ...font.section },
  list: { borderRadius: radius.md, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: size.touch, paddingHorizontal: space.md },
  flex: { flex: 1 },
  body: { ...font.body },
  caption: { ...font.caption },
  pressed: { opacity: 0.7 },
});
