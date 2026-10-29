import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { addDays, resolveDay, resolveRange, samePlan, type Plan, type Schedule } from '@/data/schedule';
import { actions, ops, useAppData, useToday, type AppData } from '@/data/store';
import { longDate, shortWeekday, t, weekdayName } from '@/i18n';
import { Chip } from '@/ui/chip';
import { DayCell } from '@/ui/day-cell';
import { Icon, type IconName } from '@/ui/icon';
import { planLabel } from '@/ui/plan-label';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Change-a-day sheet: "Replace this day only" and "Push the loop back", equal weight, no default.
// Each shows the next 4 days after the change; changed days are highlighted.
// Opens from Today (that day) and from the Calendar (any day): /change-day?day=2026-11-05
export default function ChangeDay() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const d = useAppData();
  const today = useToday();
  const params = useLocalSearchParams<{ day?: string }>();
  const date = params.day && /^\d{4}-\d{2}-\d{2}$/.test(params.day) ? params.day : today;
  const day = resolveDay(d.schedule, date);
  const name = planLabel(d, day.plan);

  const sub =
    day.source === 'loop'
      ? t(date === today ? 'change.subToday' : 'change.subLoop', { plan: name, n: (day.slotIndex ?? 0) + 1, total: day.slotCount ?? 0 })
      : day.source === 'manual'
        ? t('change.subManual', { plan: name })
        : day.source === 'shift'
          ? t('change.subShift')
          : t('change.subNone');

  // Everything this day could become instead: each workout and Rest, minus what it is now.
  const options: Plan[] = [
    ...d.workouts.map((w) => ({ kind: 'workout', workoutId: w.id }) as Plan),
    { kind: 'rest' } as Plan,
  ].filter((p) => !samePlan(p, day.plan));
  const previewPlan = options.find((p) => p.kind === 'rest') ?? options[0];
  const canPush = !!d.schedule.rotation && d.schedule.rotation.slots.length > 0 && date >= d.schedule.rotation.startDate && day.source !== 'shift';
  const canClear = day.source === 'manual' || day.source === 'shift';

  const done = (change: () => void) => {
    change();
    router.back();
  };

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="interactive"
      style={{ backgroundColor: c.bg }} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.md }]} testID="change-day-sheet">
      <View style={styles.head}>
        <View style={styles.flex}>
          <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
            {t('change.title', { date: longDate(date) })}
          </Text>
          <Text style={[styles.caption, { color: c.textMuted }]}>{sub}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={() => router.back()}
          style={[styles.close, { backgroundColor: c.bgRaised }]}
          testID="change-close">
          <Icon name="close" size={15} color={c.textMuted} />
        </Pressable>
      </View>

      {previewPlan ? (
        <OptionCard
          icon="pin"
          title={t('change.replace')}
          body={t('change.replaceBody')}
          d={d}
          from={date}
          before={d.schedule}
          after={ops.setDay(d, date, previewPlan).schedule}
          testID="option-replace">
          <View style={styles.chips}>
            {options.map((p) => {
              const label = planLabel(d, p);
              return (
                <Chip
                  key={label}
                  label={label}
                  rest={p.kind === 'rest'}
                  accessibilityLabel={t('change.replaceWith', { plan: label })}
                  onPress={() => done(() => actions.setDay(date, p))}
                  testID={`replace-${p.kind === 'rest' ? 'rest' : p.workoutId}`}
                />
              );
            })}
          </View>
        </OptionCard>
      ) : null}

      {canPush ? (
        <OptionCard
          icon="arrow"
          title={t('change.push')}
          body={t('change.pushBody', {
            day: date === today ? t('change.today') : weekdayName(date),
            plan: name,
            next: weekdayName(addDays(date, 1)),
          })}
          d={d}
          from={date}
          before={d.schedule}
          after={ops.pushBack(d, date).schedule}
          onPress={() => done(() => actions.pushBack(date))}
          testID="option-push"
        />
      ) : null}

      {canClear ? (
        <OptionCard
          icon="loop"
          title={t('change.clear')}
          body={t('change.clearBody')}
          d={d}
          from={date}
          before={d.schedule}
          after={ops.clearDay(d, date).schedule}
          onPress={() => done(() => actions.clearDay(date))}
          testID="option-clear"
        />
      ) : null}

      <Text style={[styles.caption, styles.center, { color: c.textMuted }]}>{t('change.footer')}</Text>
    </ScrollView>
  );
}

type CardProps = {
  icon: IconName;
  title: string;
  body: string;
  d: AppData;
  from: string;
  before: Schedule;
  after: Schedule;
  onPress?: () => void;
  children?: React.ReactNode;
  testID?: string;
};

function OptionCard({ icon, title, body, d, from, before, after, onPress, children, testID }: CardProps) {
  const c = useColors();
  const old = resolveRange(before, from, 4);
  const days = resolveRange(after, from, 4);
  const labels = days.map((x) => `${shortWeekday(x.date)} ${planLabel(d, x.plan)}`).join(', ');

  const inner = (
    <>
      <View style={styles.cardHead}>
        <View style={[styles.iconBubble, { backgroundColor: c.accentSoft }]}>
          <Icon name={icon} size={15} color={c.accent} />
        </View>
        <View style={styles.flex}>
          <Text style={[styles.headline, { color: c.text }]}>{title}</Text>
          <Text style={[styles.callout, { color: c.textMuted }]}>{body}</Text>
        </View>
      </View>
      <View style={styles.preview} accessible accessibilityLabel={t('change.preview', { days: labels })}>
        {days.map((x, i) => (
          <DayCell
            key={x.date}
            shape="cell"
            emphasis="label"
            top={shortWeekday(x.date)}
            label={planLabel(d, x.plan)}
            variant={samePlan(x.plan, old[i].plan) ? 'plain' : 'changed'}
            rest={x.plan?.kind === 'rest'}
            accessibilityLabel=""
          />
        ))}
      </View>
    </>
  );

  const box = [styles.card, { backgroundColor: c.bgRaised }];
  return (
    <View style={box} testID={testID}>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${title}. ${body}`}
          onPress={onPress}
          style={({ pressed }) => [styles.cardPress, pressed && styles.pressed]}>
          {inner}
        </Pressable>
      ) : (
        inner
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.md, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: space.ms, paddingTop: space.sm },
  title: { ...font.titleSmall },
  close: { width: size.touch, height: size.touch, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: radius.lg, padding: space.md, gap: space.ms },
  cardPress: { gap: space.ms },
  cardHead: { flexDirection: 'row', gap: space.ms, alignItems: 'flex-start' },
  iconBubble: { width: space.xl, height: space.xl, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  preview: { flexDirection: 'row', gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  flex: { flex: 1 },
  headline: { ...font.headline },
  callout: { ...font.callout },
  caption: { ...font.caption },
  center: { textAlign: 'center' },
  pressed: { opacity: 0.7 },
});
