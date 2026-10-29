import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { muscleGroups } from '@/data/demo';
import { actions, useAppData } from '@/data/store';
import { t, type StringKey } from '@/i18n';
import { Icon } from '@/ui/icon';
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
  const query = q.trim().toLowerCase();
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
      <View style={[styles.search, { backgroundColor: c.bgRaised }]}>
        <Icon name="search" size={17} color={c.textMuted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t('exercises.search')}
          placeholderTextColor={c.textMuted}
          accessibilityLabel={t('exercises.search')}
          style={[styles.input, { color: c.text }]}
          testID="pick-search"
        />
      </View>
      {muscleGroups.map((g) => {
        const items = d.exercises.filter((e) => e.muscleGroup === g && e.name.toLowerCase().includes(query));
        if (items.length === 0) return null;
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
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderRadius: radius.md, paddingHorizontal: space.md, minHeight: size.touch },
  input: { ...font.body, flex: 1, minHeight: size.touch },
  group: { gap: space.sm },
  section: { ...font.label, letterSpacing: 0.5 },
  list: { borderRadius: radius.md, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: size.touch, paddingHorizontal: space.md },
  flex: { flex: 1 },
  body: { ...font.body },
  caption: { ...font.caption },
  pressed: { opacity: 0.7 },
});
