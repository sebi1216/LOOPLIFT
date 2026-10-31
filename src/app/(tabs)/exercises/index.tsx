import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { hintFor } from '@/data/hints';
import { actions, ops, useAppData, useToday } from '@/data/store';
import { history } from '@/data/tracker';
import { shortDate, t, type StringKey } from '@/i18n';
import { confirmDelete } from '@/ui/confirm';
import { HeaderButton } from '@/ui/header-button';
import { kgText } from '@/ui/hint-chip';
import { Icon } from '@/ui/icon';
import { LiftArt } from '@/ui/lift-art';
import { SearchField } from '@/ui/search-field';
import { SwipeAction } from '@/ui/swipe-action';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';

// Exercises (direction S1): the library grouped by muscle group, with search. Each lift shows its
// drawing, last time, and "↑ 67.5 kg next" when the hint says add weight (decision #12). Tap for
// the Exercise screen, swipe left to delete (warns when a workout uses it), + to add. The starter
// list is never empty.
export default function Exercises() {
  const c = useColors();
  const d = useAppData();
  const today = useToday();
  const [q, setQ] = useState('');
  const groups = ops.groupByMuscle(d, q);

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
        <SearchField value={q} onChange={setQ} placeholder={t('exercises.searchN', { n: d.exercises.length })} testID="exercise-search" />

        {groups.length === 0 ? (
          <Text style={[styles.callout, { color: c.textMuted }]} testID="no-match">
            {t('exercises.noMatch', { q: q.trim() })}
          </Text>
        ) : null}

        {groups.map(({ group: g, items }) => (
          <View key={g} style={styles.group}>
            <Text style={[styles.section, { color: c.textMuted }]}>{t(`muscle.${g}` as StringKey)}</Text>
            <View style={[styles.list, { backgroundColor: c.bgRaised }]}>
              {items.map((e, i) => {
                const used = ops.usedIn(d, e.id);
                const h = history(d.sessions, e.id);
                const last = h.at(-1);
                const hint = hintFor(h, e.muscleGroup, today);
                const lastText = last
                  ? t('exercises.last', {
                      kg: last.top.kg ? kgText(last.top.kg) : t('exercises.bodyweight'),
                      reps: last.top.reps,
                      date: shortDate(last.session.date),
                    })
                  : t('exercises.notLogged');
                const next = hint?.kind === 'up' ? t('exercises.next', { kg: kgText(hint.kg) }) : '';
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
                      accessibilityLabel={[e.name, lastText, next, used.length ? t('exercises.inWorkouts', { names: used.join(', ') }) : '']
                        .filter(Boolean)
                        .join(', ')}
                      accessibilityActions={[{ name: 'delete', label: t('common.delete') }]}
                      onAccessibilityAction={(ev) => ev.nativeEvent.actionName === 'delete' && remove(e.id, e.name)}
                      onPress={() => router.push({ pathname: '/exercises/[id]', params: { id: e.id } })}
                      style={({ pressed }) => [
                        styles.row,
                        { backgroundColor: c.bgRaised },
                        i > 0 && { borderTopColor: c.border, borderTopWidth: StyleSheet.hairlineWidth },
                        pressed && styles.pressed,
                      ]}
                      testID={`exercise-${e.id}`}>
                      <View style={[styles.art, { backgroundColor: c.artTint }]}>
                        <LiftArt id={e.id} color={c.accent} width={size.touch * 0.75} />
                      </View>
                      <View style={styles.flex}>
                        <Text style={[styles.headline, { color: c.text }]}>{e.name}</Text>
                        <Text style={[styles.caption, { color: c.textMuted }]}>{lastText}</Text>
                      </View>
                      {next ? (
                        <View style={[styles.next, { backgroundColor: c.accent }]} testID={`next-${e.id}`}>
                          <Icon name="arrowUp" size={13} color={c.onAccent} />
                          <Text style={[styles.nextText, { color: c.onAccent }]}>{next}</Text>
                        </View>
                      ) : (
                        <Icon name="chevronRight" size={18} color={c.textMuted} />
                      )}
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
  group: { gap: space.sm },
  section: { ...font.section, textTransform: 'uppercase' },
  list: { borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.ms, minHeight: size.touch, paddingHorizontal: space.md, paddingVertical: space.sm },
  art: { borderRadius: radius.sm, padding: space.xs },
  next: { flexDirection: 'row', alignItems: 'center', gap: space.xxs, borderRadius: radius.full, paddingHorizontal: space.sm, paddingVertical: space.xxs },
  nextText: { ...font.caption, fontWeight: '600' },
  headline: { ...font.headline },
  flex: { flex: 1 },
  body: { ...font.body },
  callout: { ...font.callout },
  caption: { ...font.caption },
  pressed: { opacity: 0.7 },
});
