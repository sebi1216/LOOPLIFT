import { router, Stack, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings } from '@/data/settings';
import { hintFor } from '@/data/hints';
import { restTimer } from '@/data/rest';
import { actions, useAppData, useToday } from '@/data/store';
import { history, openSession } from '@/data/tracker';
import { t } from '@/i18n';
import { ActionMenu } from '@/ui/action-menu';
import { Button } from '@/ui/button';
import { confirmDelete } from '@/ui/confirm';
import { HeaderButton } from '@/ui/header-button';
import { HintChip, hintShort, kgText } from '@/ui/hint-chip';
import { Icon } from '@/ui/icon';
import { exerciseArtId, LiftArt } from '@/ui/lift-art';
import { PressScale } from '@/ui/press-scale';
import { RestBar } from '@/ui/rest-bar';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';

// '/' always exists; typed with Href because the generated route types in .expo/types can be
// stale when another dev server in this folder rewrites them (open question in docs/now.md).
const HOME = '/' as Href;

// The Workout screen (decision #11): one tile per lift, in any order. A tile shows the lift's
// drawing, last time and the hint; it opens the Exercise screen. A tile is done when every set
// is ticked. Every change saves at once, so leaving is safe (Today shows "Continue workout").
// Finish workout keeps the ticked sets and opens the Summary.
// /session?start=w1 starts that workout for today (or shows the one already open), so the
// filled state has a URL: /session?start=w1&state=filled&date=2026-11-05.
export default function SessionScreen() {
  const c = useColors();
  const { unit } = useSettings();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
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

  const starting = !!start && d.workouts.some((w) => w.id === start);
  if (!s) {
    return (
      <View style={[styles.missing, { backgroundColor: c.bg }]} testID="session-none">
        <Stack.Screen options={{ title: '' }} />
        {/* While a known workout is starting, show nothing for one frame instead of the message. */}
        {starting ? null : <Text style={[styles.body, { color: c.textMuted }]}>{t('session.none')}</Text>}
      </View>
    );
  }

  const done = s.exercises.filter((e) => e.sets.length > 0 && e.sets.every((x) => x.done)).length;
  const anyTicked = s.exercises.some((e) => e.sets.some((x) => x.done));
  // One column at large text sizes, so names and chips never squeeze.
  const tileBasis = fontScale > 1.5 ? '100%' : '40%';

  const finish = () => {
    restTimer.stop();
    actions.finishSession(s.id);
    if (anyTicked) router.replace({ pathname: '/session/summary', params: { id: s.id } });
    else leave();
  };

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.flex}
      contentContainerStyle={styles.content}
      testID="session">
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <ActionMenu
              items={[{ id: 'discard', title: t('session.discard'), destructive: true }]}
              onSelect={() =>
                confirmDelete(
                  t('session.discardTitle'),
                  t('session.discardBody'),
                  () => {
                    restTimer.stop();
                    actions.discardSession(s.id);
                    leave();
                  },
                  t('session.discardConfirm'),
                )
              }
              testID="session-menu">
              <HeaderButton label={t('session.more')} icon="more" testID="session-more" />
            </ActionMenu>
          ),
        }}
      />
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={[styles.title, styles.flex, { color: c.text }]}>
          {s.workoutName}
        </Text>
        <View style={[styles.pill, { backgroundColor: c.accentSoft }]} testID="session-done-count">
          <Text style={[styles.pillText, { color: c.accent }]}>{t('session.doneCount', { n: done, total: s.exercises.length })}</Text>
        </View>
      </View>
      <Text style={[styles.callout, { color: c.textMuted }]}>{t('session.pick')}</Text>

      <View style={styles.grid}>
        {s.exercises.map((e, ei) => {
          const ex = d.exercises.find((x) => x.id === e.exerciseId);
          const h = history(d.sessions, e.exerciseId);
          const lastEntry = h.at(-1);
          const hint = ex ? hintFor(h, ex.muscleGroup, today, unit) : null;
          const ticked = e.sets.filter((x) => x.done).length;
          const isDone = ticked > 0 && ticked === e.sets.length;
          const last = lastEntry
            ? t('session.last', { sets: lastEntry.sets.length, reps: lastEntry.top.reps, kg: kgText(lastEntry.top.kg ?? 0) })
            : t('session.firstTime');
          const status = isDone ? t('common.done') : ticked > 0 ? t('session.setsDone', { n: ticked, total: e.sets.length }) : '';
          return (
            <PressScale
              key={`${e.exerciseId}-${ei}`}
              accessibilityRole="button"
              accessibilityLabel={t('session.tileA11y', { name: ex?.name ?? '', last, hint: hint ? hintShort(hint) : '', status })}
              onPress={() => router.push({ pathname: '/session/[exerciseId]', params: { exerciseId: e.exerciseId } })}
              style={[
                styles.tile,
                { flexBasis: tileBasis, backgroundColor: c.bgRaised },
                isDone && [styles.tileDone, { borderColor: c.accent }],
              ]}
              testID={`tile-${ei}`}>
              <View style={[styles.art, { backgroundColor: c.artTint }]}>
                <LiftArt id={exerciseArtId(d.exercises, e.exerciseId)} color={c.accent} width={size.touch * 2.5} />
              </View>
              <Text style={[styles.headline, { color: c.text }]}>{ex?.name}</Text>
              <Text style={[styles.caption, { color: c.textMuted }]}>{last}</Text>
              {status ? (
                <View style={[styles.status, { backgroundColor: c.accentSoft }]} testID={`tile-${ei}-status`}>
                  {isDone ? <Icon name="check" size={13} color={c.accent} /> : null}
                  <Text style={[styles.statusText, { color: c.accent }]}>{status}</Text>
                </View>
              ) : hint ? (
                <HintChip hint={hint} testID={`tile-${ei}-hint`} />
              ) : null}
            </PressScale>
          );
        })}
      </View>

      <View style={[styles.note, { backgroundColor: c.bgRaised }]}>
        <Icon name="loop" size={18} color={c.accent} />
        <Text style={[styles.callout, styles.flex, { color: c.textMuted }]}>{t('hint.footer')}</Text>
      </View>

    </ScrollView>
    {/* A rest started on a lift keeps counting here. */}
    <RestBar inFooter />
    {/* Pinned to the bottom like in the design: always one tap away, quiet until a set is ticked. */}
    <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
      <Button label={t('session.finish')} variant={anyTicked ? 'primary' : 'soft'} onPress={finish} testID="finish-workout" />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.md, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  footer: { paddingHorizontal: space.md, paddingTop: space.sm, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  missing: { flex: 1, padding: space.md, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.sm },
  title: { ...font.hero },
  pill: { borderRadius: radius.full, paddingHorizontal: space.ms, paddingVertical: space.xs },
  pillText: { ...font.callout, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.ms },
  tile: { flexGrow: 1, borderRadius: radius.lg, padding: space.sm, gap: space.xs, borderWidth: 2, borderColor: 'transparent' },
  tileDone: { borderWidth: 2 },
  art: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'flex-end', paddingTop: space.sm, marginBottom: space.xs },
  status: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: space.xs, borderRadius: radius.full, paddingHorizontal: space.sm, paddingVertical: space.xxs },
  statusText: { ...font.caption, fontWeight: '600' },
  note: { flexDirection: 'row', alignItems: 'center', gap: space.ms, borderRadius: radius.lg, padding: space.md },
  flex: { flex: 1 },
  headline: { ...font.headline },
  body: { ...font.body },
  callout: { ...font.callout },
  caption: { ...font.caption },
});
