import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { actions, useAppData } from '@/data/store';
import { history, type Removed } from '@/data/tracker';
import { formatKg, fullDate, shortDate, t } from '@/i18n';
import { ActionMenu } from '@/ui/action-menu';
import { Button } from '@/ui/button';
import { HeaderButton } from '@/ui/header-button';
import { Icon } from '@/ui/icon';
import { LineChart } from '@/ui/line-chart';
import { SetHeader, SetRow } from '@/ui/set-row';
import { font, radius, size, space } from '@/ui/tokens';
import { UndoBar } from '@/ui/undo-bar';
import { useColors } from '@/ui/use-colors';

// One lift: a graph of the heaviest set per finished workout, then the past workouts, newest
// first. A past workout can be edited (tap it) or deleted with Undo (•••). Rename is in the header.
// States: filled /exercises/e1?state=filled, empty /exercises/e9?state=filled (never logged).
export default function ExerciseDetail() {
  const c = useColors();
  const d = useAppData();
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = d.exercises.find((e) => e.id === id);
  const [editing, setEditing] = useState<string | null>(null);
  const [removed, setRemoved] = useState<Removed | null>(null);

  if (!exercise) {
    return (
      <View style={[styles.missing, { backgroundColor: c.bg }]}>
        <Text style={[styles.body, { color: c.textMuted }]}>{t('exercise.missing')}</Text>
      </View>
    );
  }

  const h = history(d.sessions, exercise.id);
  const kg = (v: number) => t('exercise.kg', { kg: formatKg(v) });
  const first = h[0];
  const last = h[h.length - 1];

  const chartLabel = !last
    ? ''
    : h.length === 1
      ? t('exercise.chartOne', { kg: kg(last.top.kg ?? 0), date: shortDate(last.session.date) })
      : t('exercise.chartA11y', {
          from: kg(first.top.kg ?? 0),
          fromDate: shortDate(first.session.date),
          to: kg(last.top.kg ?? 0),
          toDate: shortDate(last.session.date),
        });

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <Stack.Screen
        options={{
          title: exercise.name,
          headerRight: () => (
            <HeaderButton
              label={t('exercise.rename')}
              onPress={() => router.push({ pathname: '/exercises/edit', params: { id: exercise.id } })}
              testID="rename-exercise"
            />
          ),
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        testID="exercise-detail">
        {h.length === 0 ? (
          <View style={[styles.card, styles.center, { backgroundColor: c.bgRaised }]} testID="exercise-empty">
            <Text style={[styles.headline, styles.textCenter, { color: c.text }]}>{t('exercise.empty')}</Text>
            <Text style={[styles.caption, styles.textCenter, { color: c.textMuted }]}>{t('exercise.emptySub')}</Text>
          </View>
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: c.bgRaised }]}>
              <Text style={[styles.section, { color: c.textMuted }]}>{t('exercise.chartTitle').toUpperCase()}</Text>
              <LineChart
                points={h.map((x) => ({ date: x.session.date, value: x.top.kg ?? 0 }))}
                formatValue={kg}
                formatDate={shortDate}
                accessibilityLabel={chartLabel}
                testID="chart"
              />
            </View>

            <Text style={[styles.section, { color: c.textMuted }]}>{t('exercise.history').toUpperCase()}</Text>
            <View style={styles.list}>
              {[...h].reverse().map((x) => {
                const open = editing === x.session.id;
                const summary = x.sets.map((s) => t('common.setsReps', { sets: formatKg(s.kg ?? 0), reps: s.reps })).join(' · ');
                return (
                  <View key={x.session.id} style={[styles.card, { backgroundColor: c.bgRaised }]} testID={`past-${x.session.date}`}>
                    <View style={styles.rowHead}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${fullDate(x.session.date)}, ${x.session.workoutName}, ${summary}. ${t('exercise.edit')}`}
                        accessibilityState={{ expanded: open }}
                        onPress={() => setEditing(open ? null : x.session.id)}
                        style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
                        testID={`past-${x.session.date}-open`}>
                        <Text style={[styles.headline, { color: c.text }]}>
                          {fullDate(x.session.date)} · {x.session.workoutName}
                        </Text>
                        {open ? null : <Text style={[styles.caption, { color: c.textMuted }]}>{summary}</Text>}
                      </Pressable>
                      <ActionMenu
                        items={[
                          { id: 'edit', title: t('exercise.edit') },
                          { id: 'delete', title: t('exercise.deleteSession'), destructive: true },
                        ]}
                        onSelect={(choice) => {
                          if (choice === 'edit') setEditing(x.session.id);
                          if (choice === 'delete') {
                            setEditing(null);
                            setRemoved(actions.deleteSession(x.session.id));
                          }
                        }}
                        testID={`past-${x.session.date}-menu`}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={t('session.more')}
                          style={({ pressed }) => [styles.more, pressed && styles.pressed]}
                          testID={`past-${x.session.date}-more`}>
                          <Icon name="more" size={20} color={c.accent} />
                        </Pressable>
                      </ActionMenu>
                    </View>
                    {open ? (
                      <>
                        <SetHeader tickable={false} />
                        {x.sets.map((s, si) => (
                          <SetRow
                            key={si}
                            n={si + 1}
                            set={s}
                            tickable={false}
                            onChange={(change) => actions.setSet(x.session.id, x.exIndex, si, change)}
                            testID={`past-${x.session.date}-set-${si}`}
                          />
                        ))}
                        <Button label={t('common.done')} variant="soft" onPress={() => setEditing(null)} testID={`past-${x.session.date}-done`} />
                      </>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
      {removed ? (
        <UndoBar
          key={removed.session.id}
          message={t('exercise.deleted')}
          onUndo={() => {
            actions.restoreSession(removed);
            setRemoved(null);
          }}
          onTimeout={() => setRemoved(null)}
          testID="undo-bar"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: space.md, paddingBottom: space.xxl * 2, gap: space.md, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  missing: { flex: 1, padding: space.md, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: radius.lg, padding: space.md, gap: space.sm },
  center: { alignItems: 'center' },
  textCenter: { textAlign: 'center' },
  list: { gap: space.sm },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rowMain: { flex: 1, gap: space.xxs, minHeight: size.touch, justifyContent: 'center' },
  more: { width: size.touch, height: size.touch, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  section: { ...font.section },
  headline: { ...font.headline },
  body: { ...font.body },
  caption: { ...font.caption },
  pressed: { opacity: 0.7 },
});
