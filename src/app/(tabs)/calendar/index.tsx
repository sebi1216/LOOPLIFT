import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addDays, resolveDay, resolveRange } from '@/data/schedule';
import { useAppData, useToday } from '@/data/store';
import { doneDates } from '@/data/tracker';
import { dayOfMonth, longDate, monthTitle, t, weekdayLetter } from '@/i18n';
import { Button } from '@/ui/button';
import { DayCell } from '@/ui/day-cell';
import { Icon } from '@/ui/icon';
import { dayVariant, planLabel, slotLabel } from '@/ui/plan-label';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';

function monthStart(iso: string, offset: number): string {
  const [y, m] = iso.split('-').map(Number);
  const total = y * 12 + (m - 1) + offset;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}-01`;
}

// Calendar: the month, each day labelled with its workout. Rest days dashed, days set by hand
// with accent outline plus pin. Tap a day to change it. States: filled, empty (?state=empty).
export default function Calendar() {
  const c = useColors();
  const d = useAppData();
  const done = doneDates(d.sessions);
  const today = useToday();
  const [offset, setOffset] = useState(0);
  const first = monthStart(today, offset);
  const next = monthStart(today, offset + 1);
  const length = (Date.parse(next) - Date.parse(first)) / 86_400_000;
  const days = resolveRange(d.schedule, first, length);
  // Monday first: 0 = Monday.
  const lead = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7;
  const cells: (typeof days[number] | null)[] = [...Array(lead).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  const rotation = d.schedule.rotation;
  const hasLoop = !!rotation && rotation.slots.length > 0;
  // Today's slot gets the accent chip, like the ring on Today.
  const now = resolveDay(d.schedule, today);
  const currentSlot = now.source === 'loop' ? now.slotIndex : -1;
  // A Monday to build the weekday letters from.
  const monday = addDays(first, -lead);

  const navButton = (label: string, icon: 'chevronLeft' | 'chevronRight', delta: number, id: string) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => setOffset((o) => o + delta)}
      style={({ pressed }) => [styles.round, { backgroundColor: c.bgRaised }, pressed && styles.pressed]}
      testID={id}>
      <Icon name={icon} size={24} color={c.accent} />
    </Pressable>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.head}>
          <Text accessibilityRole="header" style={[styles.title, { color: c.text }]} testID="month-title">
            {monthTitle(first, today)}
          </Text>
          {navButton(t('calendar.prev'), 'chevronLeft', -1, 'month-prev')}
          {navButton(t('calendar.next'), 'chevronRight', 1, 'month-next')}
        </View>

        {hasLoop ? (
          <View style={[styles.loopBar, { backgroundColor: c.bgRaised }]}>
            <Text style={[styles.caption, { color: c.textMuted }]}>{t('calendar.loop')}</Text>
            <View style={styles.loopChips}>
              {rotation.slots.map((slot, i) => (
                <View
                  key={`${slot}-${i}`}
                  style={[
                    styles.loopChip,
                    { backgroundColor: i === currentSlot ? c.accent : slot === 'rest' ? c.loopRest : c.loopPull },
                  ]}>
                  <Text style={[styles.chipText, { color: i === currentSlot ? c.onAccent : c.text }]}>{slotLabel(d, slot)}</Text>
                </View>
              ))}
            </View>
            <Button label={t('calendar.edit')} variant="soft" onPress={() => router.push('/calendar/loop')} style={styles.edit} testID="edit-loop" />
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: c.bgRaised }]} testID="empty-state">
            <Text style={[styles.callout, { color: c.textMuted }]}>{t('calendar.empty')}</Text>
            <Button label={t('calendar.build')} onPress={() => router.push('/calendar/loop')} testID="build-loop" />
          </View>
        )}

        <View style={styles.grid} testID="calendar-grid">
          <View style={styles.week}>
            {Array.from({ length: 7 }, (_, i) => (
              <Text key={i} style={[styles.weekday, { color: c.textMuted }]} importantForAccessibility="no" accessibilityElementsHidden>
                {weekdayLetter(addDays(monday, i))}
              </Text>
            ))}
          </View>
          {weeks.map((week, w) => (
            <View key={w} style={styles.week}>
              {week.map((x, i) =>
                x ? (
                  <DayCell
                    key={x.date}
                    shape="cell"
                    top={dayOfMonth(x.date)}
                    label={planLabel(d, x.plan)}
                    variant={dayVariant(x, today)}
                    rest={x.plan?.kind === 'rest'}
                    done={done.has(x.date)}
                    accessibilityLabel={[
                      longDate(x.date),
                      planLabel(d, x.plan) || t('today.freeTitle'),
                      done.has(x.date) ? t('common.done') : '',
                      x.source === 'manual' ? t('today.setByYou') : '',
                    ]
                      .filter(Boolean)
                      .join(', ')}
                    onPress={() => router.push({ pathname: '/change-day', params: { day: x.date } })}
                    testID={`day-${x.date}`}
                  />
                ) : (
                  <View key={`blank-${i}`} style={styles.blank} />
                ),
              )}
            </View>
          ))}
        </View>

        {hasLoop || Object.keys(d.schedule.entries).length > 0 ? (
        <View style={styles.legend}>
          <Icon name="pin" size={13} color={c.accent} />
          <Text style={[styles.caption, styles.flex, { color: c.textMuted }]}>{t('calendar.legend')}</Text>
        </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: space.md, gap: space.md, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  title: { ...font.title, flex: 1 },
  round: { width: size.touch, height: size.touch, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  loopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space.sm,
    borderRadius: radius.lg,
    paddingLeft: space.md,
    paddingRight: space.xs,
    paddingVertical: space.xs,
  },
  loopChips: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  loopChip: { borderRadius: radius.full, paddingHorizontal: space.sm, paddingVertical: space.xxs },
  chipText: { ...font.caption, fontWeight: '600' },
  edit: { paddingHorizontal: space.md },
  emptyCard: { borderRadius: radius.lg, padding: space.md, gap: space.ms },
  grid: { gap: space.xs },
  week: { flexDirection: 'row', gap: space.xs },
  weekday: { ...font.label, flex: 1, textAlign: 'center' },
  blank: { flex: 1 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  flex: { flex: 1 },
  caption: { ...font.caption },
  callout: { ...font.callout },
  pressed: { opacity: 0.7 },
});
