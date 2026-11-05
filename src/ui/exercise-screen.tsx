import { router, Stack } from 'expo-router';
import { useState, useSyncExternalStore } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { useSettings } from '@/data/settings';
import { inUnit } from '@/data/units';
import { hintFor, type Hint } from '@/data/hints';
import { restTimer } from '@/data/rest';
import { actions, useAppData, useToday } from '@/data/store';
import { history, openSession, type Removed } from '@/data/tracker';
import { formatKg, fullDate, hasString, shortDate, shortWeekday, t } from '@/i18n';

import { ActionMenu } from './action-menu';
import { Button } from './button';
import { FormDemo, FormFigure } from './form-demo';
import { hasDemo } from './form-demos';
import { FormNotes } from './form-notes';
import { haptic } from './haptics';
import { HeaderButton } from './header-button';
import { HeroCard } from './hero-card';
import { kgText } from './hint-chip';
import { Icon, type IconName } from './icon';
import { LiftArt } from './lift-art';
import { LineChart } from './line-chart';
import { PressScale } from './press-scale';
import { RestBar } from './rest-bar';
import { SetHeader, SetRow } from './set-row';
import { font, motion, radius, size, space } from './tokens';
import { UndoBar } from './undo-bar';
import { useColors } from './use-colors';

// Hint cards closed with "Use" or "Keep", per session and lift, for as long as the app runs
// (spec 001 update 2: "Keep" hides the card for this workout).
const closed = new Set<string>();
const closedListeners = new Set<() => void>();
function closeHint(key: string) {
  closed.add(key);
  closedListeners.forEach((l) => l());
}
function useClosed(key: string) {
  return useSyncExternalStore(
    (l) => {
      closedListeners.add(l);
      return () => closedListeners.delete(l);
    },
    () => closed.has(key),
    () => closed.has(key),
  );
}

type Props = {
  exerciseId: string;
  // Inside a running workout: the hint with Use / Keep, last time, the set rows and Finish
  // exercise. From the Exercises tab: the hint (read only), progress and history.
  inSession: boolean;
};

// The one Exercise screen (decision #13), mounted by /exercises/[id] (Exercises tab) and by
// /session/[exerciseId] (inside a workout). Top: a hero with the muscle group, name, form cues
// and the lift's drawing. Then the hint from your history (decision #12), the sets, and the
// graph of the heaviest set with the past workouts below (edit, or delete with Undo).
export function ExerciseScreen({ exerciseId, inSession }: Props) {
  const c = useColors();
  const { unit } = useSettings();
  const d = useAppData();
  const today = useToday();
  const exercise = d.exercises.find((e) => e.id === exerciseId);
  const [editing, setEditing] = useState<string | null>(null);
  const [removed, setRemoved] = useState<Removed | null>(null);
  const session = inSession ? openSession(d.sessions) : undefined;
  const exIndex = session ? session.exercises.findIndex((e) => e.exerciseId === exerciseId) : -1;
  const hintKey = `${session?.id}:${exerciseId}`;
  const hintClosed = useClosed(hintKey);
  const reduced = useReducedMotion();
  // Set rows beyond this many were added just now and slide in; the first ones are simply there.
  const [sets0] = useState(session && exIndex >= 0 ? session.exercises[exIndex].sets.length : 0);

  if (!exercise || (inSession && exIndex < 0)) {
    return (
      <View style={[styles.missing, { backgroundColor: c.bg }]} testID="exercise-missing">
        <Stack.Screen options={{ title: '' }} />
        <Text style={[styles.body, { color: c.textMuted }]}>{inSession ? t('session.none') : t('exercise.missing')}</Text>
      </View>
    );
  }

  const h = history(d.sessions, exercise.id);
  const last = h.at(-1);
  const hint = hintFor(h, exercise.muscleGroup, today, unit);
  const cueKey = `cue.${exercise.id}`;
  const cues = hasString(cueKey) ? t(cueKey).split('|') : [];
  const sx = session && exIndex >= 0 ? session.exercises[exIndex] : null;
  const first = h[0];
  const gain = first && last ? (last.top.kg ?? 0) - (first.top.kg ?? 0) : 0;

  const chartLabel = !last
    ? ''
    : h.length === 1
      ? t('exercise.chartOne', { kg: kgText(last.top.kg ?? 0), date: shortDate(last.session.date) })
      : t('exercise.chartA11y', {
          from: kgText(first.top.kg ?? 0),
          fromDate: shortDate(first.session.date),
          to: kgText(last.top.kg ?? 0),
          toDate: shortDate(last.session.date),
        });

  const useKg = (kg: number) => {
    if (!session || !sx) return;
    sx.sets.forEach((s, si) => {
      if (!s.done) actions.setSet(session.id, exIndex, si, { kg });
    });
    closeHint(hintKey);
  };

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () =>
            session ? (
              <Text style={[styles.callout, styles.position, { color: c.textMuted }]}>
                {t('session.position', { n: exIndex + 1, total: session.exercises.length })}
              </Text>
            ) : (
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
        keyboardDismissMode="interactive"
        contentContainerStyle={styles.content}
        testID={inSession ? 'session-exercise' : 'exercise-detail'}>
        <HeroCard style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={[styles.section, { color: c.onHero }]}>{t(`muscle.${exercise.muscleGroup}`)}</Text>
            <Text accessibilityRole="header" style={[styles.heroTitle, { color: c.onHero }]}>
              {exercise.name}
            </Text>
            {cues.length > 0 ? (
              <View style={styles.cues} accessibilityLabel={`${t('exercise.cues')}: ${cues.join('. ')}`} accessible>
                {cues.map((cue, i) => (
                  <View key={cue} style={styles.cue}>
                    <Text style={[styles.callout, { color: c.onHero }]}>{i + 1}</Text>
                    <Text style={[styles.callout, styles.flex, { color: c.onHero }]}>{cue}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
          {!hasDemo(exercise.id) ? (
            <View style={[styles.art, { backgroundColor: c.heroChip }]}>
              <LiftArt id={exercise.art ?? exercise.id} color={c.onHero} width={size.touch * 1.5} />
            </View>
          ) : inSession ? (
            // While you train the demo stays small so the sets stay in view; tap for the big one.
            <PressScale
              accessibilityRole="button"
              accessibilityLabel={t('form.show')}
              onPress={() => router.push({ pathname: '/form', params: { id: exercise.id } })}
              style={[styles.demoSmall, { backgroundColor: c.heroChip }]}
              testID="show-form">
              <FormFigure id={exercise.id} color={c.onHero} width={size.demoSmall} />
              <View style={styles.demoSmallLabel}>
                <Icon name="info" size={13} color={c.onHero} />
                <Text style={[styles.caption, { color: c.onHero }]}>{t('form.show')}</Text>
              </View>
            </PressScale>
          ) : null}
        </HeroCard>

        {hasDemo(exercise.id) && !inSession ? (
          <View style={[styles.card, styles.demoCard, { backgroundColor: c.bgRaised }]}>
            <Text accessibilityRole="header" style={[styles.headline, { color: c.text }]}>
              {t('form.title')}
            </Text>
            <FormDemo id={exercise.id} name={exercise.name} testID="form-demo" />
            <FormNotes id={exercise.id} cues={false} />
          </View>
        ) : null}

        {hint && hint.kind !== 'same' && !(inSession && hintClosed) ? (
          <HintCard hint={hint} name={exercise.name} sets={last?.sets.length ?? 0} onUse={sx ? useKg : undefined} onKeep={sx ? () => closeHint(hintKey) : undefined} />
        ) : null}

        {sx && session ? (
          <>
            <Text style={[styles.caption, { color: c.textMuted }]} testID="last-time">
              {last
                ? t('session.lastTime', {
                    date: `${shortWeekday(last.session.date)} ${shortDate(last.session.date)}`,
                    sets: last.sets.length,
                    reps: last.top.reps,
                    kg: kgText(last.top.kg ?? 0),
                  })
                : t('session.noLastTime')}
            </Text>
            <View style={[styles.card, { backgroundColor: c.bgRaised }]}>
              <SetHeader />
              {sx.sets.map((set, si) => (
                <Animated.View key={si} entering={si >= sets0 && !reduced ? FadeInDown.duration(motion.enter) : undefined}>
                  <SetRow
                    n={si + 1}
                    set={set}
                    onChange={(change) => {
                      if (change.kg !== undefined) {
                        actions.setKgFollowing(session.id, exIndex, si, change.kg);
                        return;
                      }
                      actions.setSet(session.id, exIndex, si, change);
                      // Ticking a set starts the rest; unticking it takes the rest back.
                      if (change.done === true) {
                        haptic('tick');
                        restTimer.start();
                      }
                      if (change.done === false) restTimer.stop();
                    }}
                    testID={`set-${exIndex}-${si}`}
                  />
                </Animated.View>
              ))}
              <Button label={t('session.addSet')} icon="plus" variant="soft" onPress={() => actions.addSet(session.id, exIndex)} testID={`add-set-${exIndex}`} />
            </View>
            <Button label={t('session.finishExercise')} icon="check" onPress={() => router.back()} testID="finish-exercise" />
          </>
        ) : null}

        <Text accessibilityRole="header" style={[styles.sectionTitle, { color: c.text }]}>
          {t('exercise.progress')}
        </Text>
        {h.length === 0 ? (
          <View style={[styles.card, styles.center, { backgroundColor: c.bgRaised }]} testID="exercise-empty">
            <Text style={[styles.headline, styles.textCenter, { color: c.text }]}>{t('exercise.empty')}</Text>
            <Text style={[styles.caption, styles.textCenter, { color: c.textMuted }]}>{t('exercise.emptySub')}</Text>
          </View>
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: c.bgRaised }]}>
              <View style={styles.chartHead}>
                <Text style={[styles.caption, styles.flex, { color: c.textMuted }]}>{t('exercise.chartTitle')}</Text>
                {gain !== 0 ? (
                  <View style={[styles.gain, { backgroundColor: c.accentSoft }]} testID="chart-gain">
                    <Icon name={gain > 0 ? 'arrowUp' : 'arrowDown'} size={13} color={c.accent} />
                    <Text style={[styles.gainText, { color: c.accent }]}>
                      {t('exercise.change', { kg: kgText(Math.abs(gain)), date: shortDate(first.session.date) })}
                    </Text>
                  </View>
                ) : null}
              </View>
              <LineChart
                points={h.map((x) => ({ date: x.session.date, value: x.top.kg ?? 0 }))}
                formatValue={kgText}
                formatDate={shortDate}
                accessibilityLabel={chartLabel}
                testID="chart"
              />
            </View>

            <Text accessibilityRole="header" style={[styles.sectionTitle, { color: c.text }]}>
              {t('exercise.history')}
            </Text>
            <View style={[styles.list, { backgroundColor: c.bgRaised }]}>
              {[...h].reverse().map((x, i) => {
                const open = editing === x.session.id;
                const summary = x.sets.map((s) => t('exercise.kgReps', { kg: formatKg(inUnit(s.kg ?? 0, unit)), reps: s.reps })).join(' · ');
                return (
                  <View
                    key={x.session.id}
                    style={[styles.pastRow, i > 0 && [styles.divider, { borderTopColor: c.border }]]}
                    testID={`past-${x.session.date}`}>
                    <View style={styles.rowHead}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${fullDate(x.session.date)}, ${x.session.workoutName}, ${summary}. ${t('exercise.edit')}`}
                        accessibilityState={{ expanded: open }}
                        onPress={() => setEditing(open ? null : x.session.id)}
                        style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
                        testID={`past-${x.session.date}-open`}>
                        <Text style={[styles.body, styles.flex, { color: c.text }]}>{`${shortWeekday(x.session.date)} ${shortDate(x.session.date)}`}</Text>
                        <Text style={[styles.headline, { color: c.text }]}>
                          {`${t('common.setsReps', { sets: x.sets.length, reps: x.top.reps })} · ${kgText(x.top.kg ?? 0)}`}
                        </Text>
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
                      <View style={styles.editSets}>
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
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
      {inSession ? <RestBar /> : null}
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

type HintProps = { hint: Hint; name: string; sets: number; onUse?: (kg: number) => void; onKeep?: () => void };

// The hint from your history with its reason. In a workout, "Use" fills the open sets.
function HintCard({ hint, name, sets, onUse, onKeep }: HintProps) {
  const c = useColors();
  let icon: IconName = 'equal';
  let title = '';
  let body = '';
  let from: number | null = null;
  if (hint.kind === 'up') {
    icon = 'arrowUp';
    title = t('hint.upTitle');
    body = t('hint.upBody', { sets, reps: hint.reps, from: kgText(hint.from), n: hint.sessions, kg: kgText(hint.kg) });
    from = hint.from;
  } else if (hint.kind === 'comeback') {
    icon = 'loop';
    title = t('hint.comebackTitle');
    body = t('hint.comebackBody', { name, days: hint.days, kg: kgText(hint.kg), percent: hint.percent });
    from = hint.from;
  } else if (hint.kind === 'stay') {
    title = t('hint.stayTitle', { kg: kgText(hint.kg) });
    body = t('hint.stayBody', { n: hint.sessions, kg: kgText(hint.kg), reps: hint.reps });
  } else {
    title = t('hint.sameTitle');
    body = t('hint.sameBody');
  }
  const act = hint.kind === 'up' || hint.kind === 'comeback';
  return (
    <View style={[styles.card, { backgroundColor: c.bgRaised }]} testID={`hint-${hint.kind}`}>
      <View style={styles.hintHead}>
        <View style={[styles.hintIcon, { backgroundColor: act ? c.accent : c.field }]}>
          <Icon name={icon} size={15} color={act ? c.onAccent : c.text} />
        </View>
        <Text style={[styles.headline, styles.flex, { color: c.text }]}>{title}</Text>
      </View>
      <Text style={[styles.callout, { color: c.textMuted }]}>{body}</Text>
      {act && onUse && onKeep && from !== null ? (
        <View style={styles.hintButtons}>
          <Button label={t('hint.use', { kg: kgText(hint.kg) })} onPress={() => onUse(hint.kg)} testID="hint-use" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('hint.keep', { kg: kgText(from) })}
            onPress={onKeep}
            style={({ pressed }) => [styles.keep, { backgroundColor: c.field }, pressed && styles.pressed]}
            testID="hint-keep">
            <Text style={[styles.headline, { color: c.text }]}>{t('hint.keep', { kg: kgText(from) })}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: space.md, paddingBottom: space.xxl * 2, gap: space.md, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  missing: { flex: 1, padding: space.md, alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  heroText: { flex: 1, minWidth: size.ring * 0.75, gap: space.sm },
  heroTitle: { ...font.title },
  art: { borderRadius: radius.full, padding: space.md },
  demoSmall: { borderRadius: radius.md, padding: space.xs, alignItems: 'center', gap: space.xs, minHeight: size.touch },
  demoSmallLabel: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingBottom: space.xs },
  demoCard: { gap: space.ms },
  chartHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm },
  gain: { flexDirection: 'row', alignItems: 'center', gap: space.xs, borderRadius: radius.full, paddingHorizontal: space.sm, paddingVertical: space.xxs },
  gainText: { ...font.caption, fontWeight: '600' },
  cues: { gap: space.xs },
  cue: { flexDirection: 'row', gap: space.sm },
  card: { borderRadius: radius.lg, padding: space.md, gap: space.sm },
  center: { alignItems: 'center' },
  textCenter: { textAlign: 'center' },
  list: { borderRadius: radius.lg, paddingHorizontal: space.md },
  pastRow: { paddingVertical: space.xs, gap: space.sm },
  divider: { borderTopWidth: StyleSheet.hairlineWidth },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.sm, minHeight: size.touch },
  editSets: { gap: space.sm, paddingBottom: space.sm },
  more: { width: size.touch, height: size.touch, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  hintHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  hintIcon: { width: space.lg + space.xs, height: space.lg + space.xs, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  hintButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  keep: { minHeight: size.touch, borderRadius: radius.full, paddingHorizontal: space.lg, justifyContent: 'center' },
  position: { paddingHorizontal: space.md },
  section: { ...font.section, textTransform: 'uppercase' },
  sectionTitle: { ...font.titleSmall },
  headline: { ...font.headline },
  body: { ...font.body },
  callout: { ...font.callout },
  caption: { ...font.caption },
  pressed: { opacity: 0.7 },
});
