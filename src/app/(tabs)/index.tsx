import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { resolveDay, resolveRange } from '@/data/schedule';
import { actions, useAppData, useToday, type AppData } from '@/data/store';
import { doneDates, history, openSession } from '@/data/tracker';
import { fullDate, longDate, shortWeekday, dayOfMonth, t } from '@/i18n';
import { ActionMenu } from '@/ui/action-menu';
import { Button } from '@/ui/button';
import { HeroCard } from '@/ui/hero-card';
import { kgText } from '@/ui/hint-chip';
import { Icon } from '@/ui/icon';
import { LiftArt } from '@/ui/lift-art';
import { LoopRing } from '@/ui/loop-ring';
import { NumberBubble } from '@/ui/number-bubble';
import { planLabel, slotLabel } from '@/ui/plan-label';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';

// Today (direction S1 Loop orbit): the loop as a hero card with today on the ring, the next 6
// days under it, today's lifts with last time's weight, and Start workout.
// States: filled (/?state=filled&date=2026-11-05, Lena) and empty (/?state=empty, Mia on first
// launch). Data is local, so there is no loading or error state.
export default function Today() {
  const d = useAppData();
  const today = useToday();
  const empty = d.workouts.length === 0 || !d.schedule.rotation || d.schedule.rotation.slots.length === 0;
  return empty ? <TodayEmpty d={d} today={today} /> : <TodayFilled d={d} today={today} />;
}

// With a name only for the demo casts; the real user is never asked for one.
function greeting(name: string | null) {
  const h = new Date().getHours();
  if (!name) return t(h < 12 ? 'today.morningPlain' : h < 18 ? 'today.afternoonPlain' : 'today.eveningPlain');
  return t(h < 12 ? 'today.morning' : h < 18 ? 'today.afternoon' : 'today.evening', { name });
}

function Screen({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

function Header({ date, title }: { date: string; title: string }) {
  const c = useColors();
  return (
    <View style={styles.header}>
      <Text style={[styles.section, { color: c.textMuted }]}>{longDate(date)}</Text>
      <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
        {title}
      </Text>
    </View>
  );
}

function TodayFilled({ d, today }: { d: AppData; today: string }) {
  const c = useColors();
  const rotation = d.schedule.rotation!;
  const day = resolveDay(d.schedule, today);
  const week = resolveRange(d.schedule, today, 7);
  const plan = day.plan;
  const workout = plan?.kind === 'workout' ? d.workouts.find((w) => w.id === plan.workoutId) : undefined;
  const name = day.plan ? planLabel(d, day.plan) : t('today.freeTitle');

  const ringLabel =
    day.source === 'loop'
      ? t('today.dayOf', { n: (day.slotIndex ?? 0) + 1, total: day.slotCount ?? 0 })
      : day.source === 'manual'
        ? t('today.setByYou')
        : day.source === 'shift'
          ? t('today.pushedBack')
          : '';
  const next = week.slice(1).find((x) => x.plan?.kind === 'workout');
  const open = openSession(d.sessions);
  const done = doneDates(d.sessions);
  const todayDone = done.has(today);
  const sets = workout?.exercises.reduce((n, e) => n + e.targetSets, 0) ?? 0;
  const start = (workoutId: string) => router.push({ pathname: '/session', params: { start: workoutId } });
  const changeDay = (date: string) => router.push({ pathname: '/change-day', params: { day: date } });

  return (
    <Screen>
      <Header date={today} title={greeting(d.userName)} />

      <HeroCard testID="today-hero">
        <View style={styles.heroTop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('today.changeDay')}
            onPress={() => changeDay(today)}
            style={({ pressed }) => [styles.heroChip, { backgroundColor: c.heroChip }, pressed && styles.pressed]}
            testID="change-day">
            <Text style={[styles.chipText, { color: c.onHero }]}>{t('today.changeDay')}</Text>
          </Pressable>
          {workout ? (
            <View style={[styles.sticker, { backgroundColor: c.heroChip }]}>
              <LiftArt id={workout.id} color={c.onHero} width={size.touch + space.md} />
            </View>
          ) : null}
        </View>

        <View
          style={styles.ringWrap}
          accessible
          accessibilityLabel={[ringLabel, name, workout ? t('today.liftsSets', { lifts: workout.exercises.length, sets }) : '', todayDone ? t('common.done') : '']
            .filter(Boolean)
            .join(', ')}
          testID="today-ring">
          <LoopRing
            slots={rotation.slots}
            current={day.source === 'loop' ? (day.slotIndex ?? 0) : null}
            diameter={size.ring}
            stroke={size.ringStroke}
            tone="hero"
            labels={rotation.slots.map((s) => slotLabel(d, s))}>
            {ringLabel ? (
              <View style={styles.ringSub}>
                {day.source === 'manual' ? <Icon name="pin" size={11} color={c.onHero} /> : null}
                <Text style={[styles.section, { color: c.onHero }]}>{ringLabel}</Text>
              </View>
            ) : null}
            <Text style={[styles.hero, { color: c.onHero }]} numberOfLines={2} adjustsFontSizeToFit testID="today-plan">
              {name}
            </Text>
            {todayDone ? (
              <View style={styles.ringSub} testID="today-done">
                <Icon name="check" size={13} color={c.onHero} />
                <Text style={[styles.callout, { color: c.onHero }]}>{t('common.done')}</Text>
              </View>
            ) : workout ? (
              <Text style={[styles.callout, styles.center, { color: c.onHero }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {t('today.liftsSets', { lifts: workout.exercises.length, sets })}
              </Text>
            ) : null}
          </LoopRing>
        </View>

        <View style={styles.strip} accessibilityLabel={t('today.strip')}>
          {week.slice(1).map((x) => {
            const label = planLabel(d, x.plan) || t('today.freeTitle');
            const rest = x.plan?.kind === 'rest';
            const isDone = done.has(x.date);
            return (
              <Pressable
                key={x.date}
                accessibilityRole="button"
                accessibilityLabel={t('today.dayA11y', { date: longDate(x.date), plan: isDone ? t('common.done') : label })}
                onPress={() => changeDay(x.date)}
                style={({ pressed }) => [
                  styles.day,
                  rest ? [styles.dayRest, { borderColor: c.onHero }] : { backgroundColor: c.heroChip },
                  x.source === 'manual' && [styles.dayManual, { borderColor: c.onHero }],
                  pressed && styles.pressed,
                ]}
                testID={`strip-${x.date}`}>
                <Text style={[styles.dayTop, { color: c.onHero }]} numberOfLines={1}>
                  {`${shortWeekday(x.date)} ${dayOfMonth(x.date)}`}
                </Text>
                {isDone ? <Icon name="check" size={13} color={c.onHero} /> : null}
                <Text style={[styles.dayPlan, { color: c.onHero }]} numberOfLines={1} adjustsFontSizeToFit>
                  {isDone ? t('common.done') : label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </HeroCard>

      <View style={[styles.card, { backgroundColor: c.bgRaised }]} testID="today-card">
        {workout ? (
          workout.exercises.length > 0 ? (
            workout.exercises.map((e, i) => {
              const ex = d.exercises.find((x) => x.id === e.exerciseId);
              const last = history(d.sessions, e.exerciseId).at(-1);
              const kg = last ? kgText(last.top.kg ?? 0) : '';
              return (
                <View
                  key={`${e.exerciseId}-${i}`}
                  style={styles.exRow}
                  accessible
                  accessibilityLabel={[ex?.name, t('common.setsRepsA11y', { sets: e.targetSets, reps: e.targetReps }), kg].filter(Boolean).join(', ')}>
                  <Text style={[styles.body, styles.flex, { color: c.text }]}>{ex?.name}</Text>
                  {/* Quiet on purpose: after a few weeks you know the targets by heart. */}
                  <Text style={[styles.body, { color: c.textMuted }]}>{t('common.setsReps', { sets: e.targetSets, reps: e.targetReps })}</Text>
                  {kg ? <Text style={[styles.kg, { color: c.text }]}>{kg}</Text> : null}
                </View>
              );
            })
          ) : (
            <Text style={[styles.body, { color: c.textMuted }]}>{t('today.noExercises')}</Text>
          )
        ) : day.plan?.kind === 'rest' ? (
          <Text style={[styles.body, { color: c.textMuted }]}>
            {t('today.restBody', { next: next ? planLabel(d, next.plan) : t('common.rest') })}
          </Text>
        ) : (
          <Text style={[styles.body, { color: c.textMuted }]}>{t('today.beforeStart', { date: fullDate(rotation.startDate) })}</Text>
        )}
      </View>

      {open ? (
        <Button label={t('today.continue')} icon="play" onPress={() => router.push('/session')} testID="continue-workout" />
      ) : todayDone ? null : workout ? (
        <Button label={t('today.start')} icon="play" onPress={() => start(workout.id)} testID="lets-go" />
      ) : (
        // Rest or free day: any workout can still be started, today only.
        <ActionMenu items={d.workouts.map((w) => ({ id: w.id, title: w.name }))} onSelect={start} testID="start-other-menu">
          <Button label={t('today.startOther')} variant="soft" testID="start-other" />
        </ActionMenu>
      )}
    </Screen>
  );
}

function TodayEmpty({ d, today }: { d: AppData; today: string }) {
  const c = useColors();
  const hasWorkout = d.workouts.length > 0;
  const steps = [
    { title: t('today.step1'), sub: t('today.step1Sub'), done: hasWorkout },
    { title: t('today.step2'), sub: t('today.step2Sub'), done: false },
    { title: t('today.step3'), sub: t('today.step3Sub'), done: false },
  ];
  const nextStep = steps.findIndex((s) => !s.done);
  const cta = hasWorkout ? t('today.ctaLoop') : t('today.ctaWorkout');

  const start = () => {
    if (hasWorkout) {
      router.push('/calendar/loop');
      return;
    }
    const id = actions.addWorkout(t('workouts.newName'));
    if (id) router.push({ pathname: '/workouts/[id]', params: { id } });
  };

  return (
    <Screen>
      <Header date={today} title={d.userName ? t('today.welcome', { name: d.userName }) : t('today.welcomePlain')} />
      <HeroCard testID="empty-state">
        <View style={styles.ringWrap} accessible accessibilityLabel={`${t('today.yourLoop')} ${t('today.startsHere')}`}>
          <LoopRing slots={[]} current={null} diameter={size.ring} stroke={size.ringStroke} tone="hero">
            <Text style={[styles.section, { color: c.onHero }]}>{t('today.yourLoop')}</Text>
            <Text style={[styles.headlineBig, { color: c.onHero }]}>{t('today.startsHere')}</Text>
          </LoopRing>
        </View>
        <Text style={[styles.callout, styles.center, { color: c.onHero }]}>{t('today.emptyBody')}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={cta}
          onPress={start}
          style={({ pressed }) => [styles.heroButton, { backgroundColor: c.onHero }, pressed && styles.pressed]}
          testID="empty-cta">
          {/* accent on white: 6.41:1 (accent on bgRaised in the checked pairs). */}
          <Text style={[styles.headline, styles.center, { color: c.heroFrom }]}>{cta}</Text>
        </Pressable>
      </HeroCard>
      <View style={[styles.card, styles.steps, { backgroundColor: c.bgRaised }]}>
        <Text accessibilityRole="header" style={[styles.headline, { color: c.text }]}>
          {t('today.quickSteps')}
        </Text>
        {steps.map((s, i) => (
          <View key={s.title} style={styles.step} accessible accessibilityLabel={`${i + 1}. ${s.title}. ${s.sub}${s.done ? `. ${t('today.stepDone')}` : ''}`}>
            <NumberBubble n={i + 1} tone={s.done ? 'done' : i === nextStep ? 'accent' : 'soft'} />
            <View style={styles.flex}>
              <Text style={[styles.headline, { color: c.text }]}>{s.title}</Text>
              <Text style={[styles.caption, { color: c.textMuted }]}>{s.sub}</Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: space.md,
    paddingBottom: space.xxl,
    gap: space.md,
    width: '100%',
    maxWidth: size.maxContent,
    alignSelf: 'center',
  },
  header: { gap: space.xs, paddingTop: space.sm },
  section: { ...font.section, textTransform: 'uppercase' },
  title: { ...font.title },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.sm, zIndex: 1 },
  heroChip: {
    minHeight: size.touch,
    paddingHorizontal: space.md,
    borderRadius: radius.full,
    justifyContent: 'center',
  },
  chipText: { ...font.headline },
  sticker: { borderRadius: radius.full, padding: space.ms },
  // The ring pulls up under the top row, like in the design; the row stays tappable on top.
  ringWrap: { alignItems: 'center', marginTop: -space.xxl },
  ringSub: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  hero: { ...font.display, textAlign: 'center' },
  strip: { flexDirection: 'row', gap: space.xs },
  day: {
    flex: 1,
    minWidth: 0,
    minHeight: size.touch,
    borderRadius: radius.md,
    paddingVertical: space.sm,
    paddingHorizontal: space.xxs,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xxs,
  },
  dayRest: { borderWidth: 1.5, borderStyle: 'dashed' },
  dayManual: { borderWidth: 2 },
  dayTop: { ...font.label, textTransform: 'uppercase' },
  dayPlan: { ...font.callout, fontWeight: '600' },
  card: { borderRadius: radius.lg, padding: space.md, gap: space.ms },
  steps: { gap: space.md },
  step: { flexDirection: 'row', alignItems: 'center', gap: space.ms },
  exRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  kg: { ...font.headline },
  heroButton: { minHeight: size.touch, borderRadius: radius.full, paddingHorizontal: space.lg, paddingVertical: space.ms, justifyContent: 'center' },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  headline: { ...font.headline },
  headlineBig: { ...font.titleSmall, textAlign: 'center' },
  body: { ...font.body },
  callout: { ...font.callout },
  caption: { ...font.caption },
  pressed: { opacity: 0.7 },
});
