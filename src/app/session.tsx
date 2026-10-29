import { router, Stack, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { actions, useAppData, useToday } from '@/data/store';
import { openSession } from '@/data/tracker';
import { t } from '@/i18n';
import { ActionMenu } from '@/ui/action-menu';
import { Button } from '@/ui/button';
import { confirmDelete } from '@/ui/confirm';
import { HeaderButton } from '@/ui/header-button';
import { SetHeader, SetRow } from '@/ui/set-row';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';

// '/' always exists; typed with Href because the generated route types in .expo/types can be
// stale when another dev server in this folder rewrites them (open question in docs/now.md).
const HOME = '/' as Href;

// The workout screen: the one open session, set by set. Every change saves at once, so leaving
// is safe (Today then shows "Continue workout"). Finish keeps the ticked sets only.
// /session?start=w1 starts that workout for today (or shows the one already open), so the
// filled state has a URL: /session?start=w1&state=filled&date=2026-11-05.
export default function SessionScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const d = useAppData();
  const today = useToday();
  const { start } = useLocalSearchParams<{ start?: string }>();
  const started = useRef(false);
  useEffect(() => {
    if (start && !started.current) {
      started.current = true;
      actions.startSession(start, today);
    }
  }, [start, today]);

  const s = openSession(d.sessions);
  // Opened by a link (no screen behind it): go to Today instead of back.
  const leave = () => (router.canGoBack() ? router.back() : router.replace(HOME));

  if (!s) {
    return (
      <View style={[styles.missing, { backgroundColor: c.bg }]} testID="session-none">
        <Stack.Screen options={{ title: t('session.title') }} />
        {start ? null : <Text style={[styles.body, { color: c.textMuted }]}>{t('session.none')}</Text>}
      </View>
    );
  }

  const nameOf = (id: string) => d.exercises.find((e) => e.id === id)?.name ?? '';

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.md }]}
      testID="session">
      <Stack.Screen
        options={{
          title: s.workoutName,
          headerRight: () => (
            <ActionMenu
              items={[{ id: 'discard', title: t('session.discard'), destructive: true }]}
              onSelect={() =>
                confirmDelete(t('session.discardTitle'), t('session.discardBody'), () => {
                  actions.discardSession(s.id);
                  leave();
                })
              }
              testID="session-menu">
              <HeaderButton label={t('session.more')} icon="more" testID="session-more" />
            </ActionMenu>
          ),
        }}
      />
      <Text style={[styles.caption, { color: c.textMuted }]}>{t('session.hint')}</Text>

      {s.exercises.map((e, ei) => (
        <View key={`${e.exerciseId}-${ei}`} style={[styles.card, { backgroundColor: c.bgRaised }]} testID={`session-ex-${ei}`}>
          <View style={styles.cardHead}>
            <Text accessibilityRole="header" style={[styles.headline, styles.flex, { color: c.text }]}>
              {nameOf(e.exerciseId)}
            </Text>
            {/* Quiet on purpose, like on Today: the numbers in the rows are what counts. */}
            <Text style={[styles.caption, { color: c.textMuted }]}>
              {t('session.target', { sets: e.targetSets, reps: e.targetReps })}
            </Text>
          </View>
          <SetHeader />
          {e.sets.map((set, si) => (
            <SetRow
              key={si}
              n={si + 1}
              set={set}
              onChange={(change) => actions.setSet(s.id, ei, si, change)}
              testID={`set-${ei}-${si}`}
            />
          ))}
          <Button label={t('session.addSet')} icon="plus" variant="soft" onPress={() => actions.addSet(s.id, ei)} testID={`add-set-${ei}`} />
        </View>
      ))}

      <Button
        label={t('session.finish')}
        onPress={() => {
          actions.finishSession(s.id);
          leave();
        }}
        testID="finish-workout"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.md, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  missing: { flex: 1, padding: space.md, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: radius.lg, padding: space.md, gap: space.sm },
  cardHead: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.sm },
  flex: { flexGrow: 1, flexShrink: 1 },
  headline: { ...font.headline },
  body: { ...font.body },
  caption: { ...font.caption },
});
