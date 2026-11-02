import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { dayStatus, heatWeeks, monthCells, type DayStatus } from '@/data/progress';
import { addDays, resolveDay, type Schedule } from '@/data/schedule';
import { fullDate, monthTitle, t, weekdayLetter, type StringKey } from '@/i18n';

import { Icon } from './icon';
import { font, motion, radius, size, space } from './tokens';
import { useColors } from './use-colors';

type Props = { days: Map<string, number>; schedule: Schedule; today: string };

const GAP = space.xs + space.xxs;
const shiftMonth = (ym: string, by: number) => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

// One box per day of the month: filled with a check when you trained, a cross on a planned
// workout you missed, dashed on a rest day, a ring around today. The arrows page the months;
// the next month only up to the current one.
export function GymMonth({ days, schedule, today }: Props) {
  const c = useColors();
  const reduced = useReducedMotion();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [y, m] = month.split('-').map(Number);
  const cells = monthCells(y, m);
  const done = new Set(days.keys());
  const statuses = cells.map((d) => (d ? dayStatus(d, today, done, schedule) : null));
  const trained = statuses.filter((s) => s === 'done').length;
  // Workout days of the loop so far (today only once it is done): "2 of 3 planned".
  const planned = cells.filter((d) => d && (d < today || done.has(d)) && resolveDay(schedule, d).plan?.kind === 'workout').length;
  const atNow = month >= today.slice(0, 7);

  const arrow = (dir: -1 | 1) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(dir < 0 ? 'progress.prevMonth' : 'progress.nextMonth')}
      accessibilityState={{ disabled: dir > 0 && atNow }}
      disabled={dir > 0 && atNow}
      onPress={() => setMonth((x) => shiftMonth(x, dir))}
      style={({ pressed }) => [styles.arrow, { backgroundColor: c.field }, dir > 0 && atNow && styles.off, pressed && styles.pressed]}
      testID={dir < 0 ? 'month-prev' : 'month-next'}>
      <Icon name={dir < 0 ? 'chevronLeft' : 'chevronRight'} size={18} color={c.accent} />
    </Pressable>
  );

  return (
    <View style={styles.month} testID="gym-month">
      <View style={styles.monthHead}>
        {arrow(-1)}
        <View style={styles.monthTitle}>
          <Text accessibilityRole="header" style={[styles.headline, { color: c.text }]} testID="month-title">
            {monthTitle(`${month}-01`, today)}
          </Text>
          <Text style={[styles.caption, { color: c.textMuted }]} testID="month-count">
            {planned > 0 ? t('progress.monthCount', { n: trained, planned }) : t('progress.monthCountFree', { n: trained })}
          </Text>
        </View>
        {arrow(1)}
      </View>
      <View style={styles.row} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {Array.from({ length: 7 }, (_, i) => (
          <Text key={i} style={[styles.weekday, { color: c.textMuted }]}>
            {weekdayLetter(addDays('2026-11-02', i))}
          </Text>
        ))}
      </View>
      <Animated.View key={month} entering={reduced ? undefined : FadeIn.duration(motion.state)} style={styles.grid}>
        {Array.from({ length: cells.length / 7 }, (_, w) => (
          <View key={w} style={styles.row}>
            {cells.slice(w * 7, w * 7 + 7).map((d, i) =>
              d ? <DayBox key={d} date={d} status={statuses[w * 7 + i]!} sets={days.get(d) ?? 0} /> : <View key={`x${i}`} style={styles.cell} />,
            )}
          </View>
        ))}
      </Animated.View>
      <View style={styles.legend}>
        <Legend kind="done" label={t('progress.legendDone')} />
        <Legend kind="missed" label={t('progress.legendMissed')} />
        <Legend kind="rest" label={t('progress.legendRest')} />
      </View>
    </View>
  );
}

function DayBox({ date, status, sets }: { date: string; status: DayStatus; sets: number }) {
  const c = useColors();
  const look = boxLook(status, c);
  return (
    <View
      accessible
      accessibilityLabel={t(`progress.day.${status}` as StringKey, { date: fullDate(date), sets })}
      style={[styles.cell, styles.box, look.box]}
      testID={`day-${date}`}>
      {status === 'done' ? <Icon name="check" size={16} color={c.onAccent} /> : status === 'missed' ? <Icon name="close" size={14} color={c.danger} /> : null}
      <Text style={[styles.dayNum, { color: look.text }]}>{Number(date.slice(8))}</Text>
    </View>
  );
}

type Colors = ReturnType<typeof useColors>;
function boxLook(status: DayStatus | 'legend', c: Colors) {
  switch (status) {
    case 'done':
      return { box: { backgroundColor: c.accent, borderColor: c.accent }, text: c.onAccent };
    case 'missed':
      return { box: { backgroundColor: c.field, borderColor: c.field }, text: c.textMuted };
    case 'rest':
      return { box: { backgroundColor: 'transparent', borderColor: c.restOutline, borderStyle: 'dashed' as const }, text: c.textMuted };
    case 'today':
      return { box: { backgroundColor: c.bgRaised, borderColor: c.accent, borderWidth: 2 }, text: c.text };
    case 'future':
      return { box: { backgroundColor: 'transparent', borderColor: c.border }, text: c.textMuted };
    default:
      return { box: { backgroundColor: c.field, borderColor: c.field }, text: c.textMuted };
  }
}

function Legend({ kind, label }: { kind: DayStatus; label: string }) {
  const c = useColors();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendBox, boxLook(kind, c).box]}>
        {kind === 'done' ? <Icon name="check" size={10} color={c.onAccent} /> : kind === 'missed' ? <Icon name="close" size={10} color={c.danger} /> : null}
      </View>
      <Text style={[styles.caption, { color: c.textMuted }]}>{label}</Text>
    </View>
  );
}

// The last 26 weeks at a glance, one small square a day (Monday on top). Two shades: a lighter
// one for a short day, the full accent from 12 sets up. Read as one sentence by screen readers.
export function GymStrip({ days, today }: { days: Map<string, number>; today: string }) {
  const c = useColors();
  const [w, setW] = useState(0);
  const weeks = heatWeeks(today, 26);
  const cell = Math.max(4, Math.floor((w - (weeks.length - 1) * 3) / weeks.length));
  const count = weeks.flat().filter((d) => days.has(d)).length;
  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      accessible
      accessibilityLabel={t('progress.heatA11y', { n: count })}
      style={styles.strip}
      testID="gym-strip">
      {w > 0
        ? weeks.map((week) => (
            <View key={week[0]} style={styles.stripCol}>
              {week.map((d) => {
                const sets = days.get(d) ?? 0;
                const bg = d > today ? 'transparent' : sets >= 12 ? c.accent : sets > 0 ? c.loopPull : c.field;
                return <View key={d} style={{ width: cell, height: cell, borderRadius: cell / 4, backgroundColor: bg, borderWidth: d === today ? 1.5 : 0, borderColor: c.accent }} />;
              })}
            </View>
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  month: { gap: space.sm },
  monthHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  monthTitle: { flex: 1, alignItems: 'center' },
  arrow: { width: size.touch, height: size.touch, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  off: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
  headline: { ...font.headline, textTransform: 'capitalize' },
  caption: { ...font.caption },
  row: { flexDirection: 'row', gap: GAP },
  weekday: { ...font.label, flex: 1, textAlign: 'center' },
  grid: { gap: GAP },
  cell: { flex: 1, aspectRatio: 1 },
  box: { borderRadius: radius.sm, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 0 },
  dayNum: { ...font.label },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, justifyContent: 'center', paddingTop: space.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  legendBox: { width: space.md, height: space.md, borderRadius: space.xs, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  strip: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  stripCol: { gap: 3 },
});
