import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { resolveDay, resolveRange } from '@/data/schedule';
import { actions, useAppData, useToday, type AppData } from '@/data/store';
import { dayOfMonth, fullDate, longDate, t } from '@/i18n';
import { Button } from '@/ui/button';
import { DayCell } from '@/ui/day-cell';
import { Icon } from '@/ui/icon';
import { LoopRing } from '@/ui/loop-ring';
import { NumberBubble } from '@/ui/number-bubble';
import { dayVariant, planLabel } from '@/ui/plan-label';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';

// Today: the loop ring with today's plan, the next 7 days, today's exercises.
// States: filled (Lena) and empty (/?state=empty, Mia on first launch). Data is local, so there
// is no loading or error state. Add ?date=2026-11-05 to see the day the design shows.
export default function Today() {
  const d = useAppData();
  const today = useToday();
  const empty = d.workouts.length === 0 || !d.schedule.rotation || d.schedule.rotation.slots.length === 0;
  return empty ? <TodayEmpty d={d} today={today} /> : <TodayFilled d={d} today={today} />;
}

function greeting(name: string) {
  const h = new Date().getHours();
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

function Header({ over, date }: { over: string; date: string }) {
  const c = useColors();
  return (
    <View style={styles.header}>
      <Text style={[styles.over, { color: c.textMuted }]}>{over}</Text>
      <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
        {longDate(date)}
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

  return (
    <Screen>
      <Header over={greeting(d.userName)} date={today} />

      <View style={styles.ringWrap} accessible accessibilityLabel={`${ringLabel} ${name}`} testID="today-ring">
        <LoopRing slots={rotation.slots} current={day.source === 'loop' ? (day.slotIndex ?? 0) : null} diameter={size.ring} stroke={size.ringStroke}>
          {ringLabel ? (
            <View style={styles.ringSub}>
              {day.source === 'manual' ? <Icon name="pin" size={11} color={c.accent} /> : null}
              <Text style={[styles.caption, { color: c.textMuted }]}>{ringLabel}</Text>
            </View>
          ) : null}
          <Text style={[styles.hero, { color: c.text }]} numberOfLines={2} adjustsFontSizeToFit testID="today-plan">
            {name}
          </Text>
        </LoopRing>
      </View>

      <View style={styles.strip} accessibilityLabel={t('today.strip')}>
        {week.map((x) => {
          const label = planLabel(d, x.plan);
          return (
            <DayCell
              key={x.date}
              shape="circle"
              top={dayOfMonth(x.date)}
              label={label}
              variant={dayVariant(x, today)}
              rest={x.plan?.kind === 'rest'}
              accessibilityLabel={t('today.dayA11y', { date: longDate(x.date), plan: label || t('today.freeTitle') })}
              onPress={() => router.push({ pathname: '/change-day', params: { day: x.date } })}
              testID={`strip-${x.date}`}
            />
          );
        })}
      </View>

      <View style={[styles.card, { backgroundColor: c.bgRaised }]} testID="today-card">
        {workout ? (
          workout.exercises.length > 0 ? (
            workout.exercises.map((e, i) => {
              const ex = d.exercises.find((x) => x.id === e.exerciseId);
              return (
                <View
                  key={`${e.exerciseId}-${i}`}
                  style={styles.exRow}
                  accessible
                  accessibilityLabel={`${ex?.name}, ${t('common.setsRepsA11y', { sets: e.targetSets, reps: e.targetReps })}`}>
                  <Text style={[styles.body, styles.flex, { color: c.text }]}>{ex?.name}</Text>
                  <View style={[styles.pill, { backgroundColor: c.accentSoft }]}>
                    <Text style={[styles.pillText, { color: c.accent }]}>
                      {t('common.setsReps', { sets: e.targetSets, reps: e.targetReps })}
                    </Text>
                  </View>
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
          <Text style={[styles.body, { color: c.textMuted }]}>
            {t('today.beforeStart', { date: fullDate(rotation.startDate) })}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {workout ? (
          <Button
            label={t('today.letsGo')}
            style={styles.flex}
            onPress={() => router.push({ pathname: '/workouts/[id]', params: { id: workout.id } })}
            testID="lets-go"
          />
        ) : null}
        <Button
          label={t('today.changeDay')}
          variant="soft"
          style={styles.flex}
          onPress={() => router.push({ pathname: '/change-day', params: { day: today } })}
          testID="change-day"
        />
      </View>
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
      <Header over={t('today.welcome', { name: d.userName })} date={today} />
      <View style={styles.ringWrap} testID="empty-state">
        <LoopRing slots={[]} current={null} diameter={size.ring} stroke={size.ringStroke}>
          <Text style={[styles.headline, { color: c.text }]}>{t('today.noLoop')}</Text>
          <Text style={[styles.caption, { color: c.textMuted }]}>{t('today.noLoopSub')}</Text>
        </LoopRing>
      </View>
      <Text style={[styles.callout, styles.center, { color: c.textMuted }]}>{t('today.intro')}</Text>
      <View style={[styles.card, styles.steps, { backgroundColor: c.bgRaised }]}>
        {steps.map((s, i) => (
          <View key={s.title} style={styles.step} accessible accessibilityLabel={`${i + 1}. ${s.title}. ${s.sub}${s.done ? `. ${t('today.stepDone')}` : ''}`}>
            <NumberBubble n={i + 1} tone={s.done ? 'done' : i === nextStep ? 'accent' : 'soft'} />
            <View style={styles.flex}>
              <Text style={[styles.stepTitle, { color: c.text }]}>{s.title}</Text>
              <Text style={[styles.stepSub, { color: c.textMuted }]}>{s.sub}</Text>
            </View>
          </View>
        ))}
      </View>
      <Button label={hasWorkout ? t('today.ctaLoop') : t('today.ctaWorkout')} onPress={start} testID="empty-cta" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: space.md,
    gap: space.md,
    width: '100%',
    maxWidth: size.maxContent,
    alignSelf: 'center',
  },
  header: { gap: space.xs },
  over: { ...font.callout },
  title: { ...font.title },
  ringWrap: { alignItems: 'center' },
  ringSub: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  hero: { ...font.hero, textAlign: 'center' },
  strip: { flexDirection: 'row', gap: space.xs },
  card: { borderRadius: radius.lg, padding: space.md, gap: space.ms },
  steps: { gap: space.md },
  step: { flexDirection: 'row', alignItems: 'center', gap: space.ms },
  exRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pill: { borderRadius: radius.full, paddingHorizontal: space.sm, paddingVertical: space.xxs },
  pillText: { ...font.caption, fontWeight: '600' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.ms },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  headline: { ...font.headline, textAlign: 'center' },
  body: { ...font.body },
  callout: { ...font.callout },
  caption: { ...font.caption, textAlign: 'center' },
  stepTitle: { ...font.headline },
  stepSub: { ...font.caption },
});
