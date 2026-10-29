import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { muscleGroups } from '@/data/demo';
import { actions, ops, useAppData } from '@/data/store';
import { t, type StringKey } from '@/i18n';
import { confirmDelete } from '@/ui/confirm';
import { HeaderButton } from '@/ui/header-button';
import { Icon } from '@/ui/icon';
import { SwipeAction } from '@/ui/swipe-action';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';

// Exercises: the library grouped by muscle group, with search. Tap to rename, swipe left to
// delete (warns when a workout uses it), + to add. The starter list is never empty.
export default function Exercises() {
  const c = useColors();
  const d = useAppData();
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const groups = muscleGroups
    .map((g) => ({ g, items: d.exercises.filter((e) => e.muscleGroup === g && e.name.toLowerCase().includes(query)) }))
    .filter((x) => x.items.length > 0);

  const remove = (id: string, name: string) => {
    const used = ops.usedIn(d, id);
    confirmDelete(
      t('exercises.deleteTitle', { name }),
      used.length > 0 ? t('exercises.deleteUsed', { names: used.join(', ') }) : t('exercises.deleteBody'),
      () => actions.deleteExercise(id),
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderButton label={t('exercises.add')} icon="plus" onPress={() => router.push('/exercises/edit')} testID="add-exercise" />
          ),
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: c.bg }}
        contentContainerStyle={styles.content}
        testID="exercise-list">
        <View style={[styles.search, { backgroundColor: c.bgRaised }]}>
          <Icon name="search" size={17} color={c.textMuted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={t('exercises.search')}
            placeholderTextColor={c.textMuted}
            accessibilityLabel={t('exercises.search')}
            style={[styles.input, { color: c.text }]}
            testID="exercise-search"
          />
        </View>

        {groups.length === 0 ? (
          <Text style={[styles.callout, { color: c.textMuted }]} testID="no-match">
            {t('exercises.noMatch', { q: q.trim() })}
          </Text>
        ) : null}

        {groups.map(({ g, items }) => (
          <View key={g} style={styles.group}>
            <Text style={[styles.section, { color: c.textMuted }]}>{t(`muscle.${g}` as StringKey).toUpperCase()}</Text>
            <View style={[styles.list, { backgroundColor: c.bgRaised }]}>
              {items.map((e, i) => {
                const used = ops.usedIn(d, e.id);
                return (
                  <ReanimatedSwipeable
                    key={e.id}
                    friction={2}
                    rightThreshold={size.touch}
                    renderRightActions={(progress) => (
                      <SwipeAction
                        progress={progress}
                        label={t('common.delete')}
                        accessibilityLabel={t('exercises.deleteTitle', { name: e.name })}
                        onPress={() => remove(e.id, e.name)}
                      />
                    )}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={used.length ? `${e.name}, ${t('exercises.inWorkouts', { names: used.join(', ') })}` : e.name}
                      accessibilityActions={[{ name: 'delete', label: t('common.delete') }]}
                      onAccessibilityAction={(ev) => ev.nativeEvent.actionName === 'delete' && remove(e.id, e.name)}
                      onPress={() => router.push({ pathname: '/exercises/edit', params: { id: e.id } })}
                      style={({ pressed }) => [
                        styles.row,
                        { backgroundColor: c.bgRaised },
                        i > 0 && { borderTopColor: c.border, borderTopWidth: StyleSheet.hairlineWidth },
                        pressed && styles.pressed,
                      ]}
                      testID={`exercise-${e.id}`}>
                      <Text style={[styles.body, styles.flex, { color: c.text }]}>{e.name}</Text>
                      {used.length ? (
                        <Text style={[styles.caption, { color: c.textMuted }]}>
                          {t('exercises.inWorkouts', { names: used.join(', ') })}
                        </Text>
                      ) : null}
                    </Pressable>
                  </ReanimatedSwipeable>
                );
              })}
            </View>
          </View>
        ))}
        <Text style={[styles.caption, { color: c.textMuted }]}>{t('exercises.hint')}</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.md, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderRadius: radius.md, paddingHorizontal: space.md, minHeight: size.touch },
  input: { ...font.body, flex: 1, minHeight: size.touch },
  group: { gap: space.sm },
  section: { ...font.label, letterSpacing: 0.5 },
  list: { borderRadius: radius.md, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: size.touch, paddingHorizontal: space.md },
  flex: { flex: 1 },
  body: { ...font.body },
  callout: { ...font.callout },
  caption: { ...font.caption },
  pressed: { opacity: 0.7 },
});
