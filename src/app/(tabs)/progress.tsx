import { SegmentedControl } from '@expo/ui/community/segmented-control';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { muscleGroups, type MuscleGroup } from '@/data/demo';
import { gymDays, periods, strengthByGroup, weekStreak, type Period } from '@/data/progress';
import { useSettings } from '@/data/settings';
import { useAppData, useToday } from '@/data/store';
import { getLocale, t, type StringKey } from '@/i18n';
import { GymYears } from '@/ui/gym-days';
import { kgText } from '@/ui/hint-chip';
import { Icon, type IconName } from '@/ui/icon';
import { RadarChart } from '@/ui/radar-chart';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors, useScheme } from '@/ui/use-colors';

const pct = (x: number) =>
  new Intl.NumberFormat(getLocale() === 'de' ? 'de-DE' : 'en-GB', { style: 'percent', signDisplay: 'exceptZero', maximumFractionDigits: 0 }).format(x);
// Strength in the unit from Settings, whole numbers.
const kg = (x: number) => kgText(Math.round(x));
const groupName = (g: MuscleGroup) => t(`muscle.${g}` as StringKey);

// Progress (Suggestion, no design frame): gym days as one row per year with workouts, streaks,
// and strength balance per muscle group (estimated 1-rep max, now against the start of the chosen period). All worked out from finished workouts; nothing new is saved.
// States: /progress?state=filled&date=2026-11-05 (Lena), /progress?state=empty (Mia).
export default function Progress() {
  const c = useColors();
  const scheme = useScheme();
  useSettings(); // weights redraw in a new unit
  const d = useAppData();
  const today = useToday();
  const [period, setPeriod] = useState<Period>('all');

  const days = gymDays(d.sessions);
  const done = new Set([...days.keys()].filter((x) => x <= today));
  const streak = weekStreak(done, today);
  const thisMonth = [...done].filter((x) => x.slice(0, 7) === today.slice(0, 7)).length;
  const strength = strengthByGroup(d.sessions, d.exercises, period, today);
  const withData = muscleGroups.filter((g) => strength.groups[g] !== null);
  const missing = muscleGroups.filter((g) => strength.groups[g] === null);
  const growth = (g: MuscleGroup) => {
    const x = strength.groups[g]!;
    return x.start > 0 ? (x.now - x.start) / x.start : 0;
  };
  const lagging =
    withData.length >= 2 && Math.max(...withData.map(growth)) > Math.min(...withData.map(growth))
      ? withData.reduce((a, b) => (growth(b) < growth(a) ? b : a))
      : null;
  const callout =
    withData.length > 0 && missing.length > 0
      ? t('progress.missing', { group: groupName(missing[0]) })
      : lagging
        ? t('progress.lagging', { group: groupName(lagging) })
        : null;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.content} testID="progress">
        <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
          {t('progress.title')}
        </Text>

        <View style={styles.stats}>
          <Stat icon="flame" text={streak > 0 ? t('progress.streak', { n: streak }) : t('progress.streakNone')} strong={streak > 0} testID="stat-streak" />
          <Stat icon="calendar" text={t('progress.thisMonth', { n: thisMonth })} testID="stat-month" />
          <Stat icon="check" text={t('progress.total', { n: done.size })} testID="stat-total" />
        </View>

        {done.size > 0 ? (
          <View style={[styles.card, { backgroundColor: c.bgRaised }]}>
            <Text accessibilityRole="header" style={[styles.section, { color: c.textMuted }]}>
              {t('progress.gymDays')}
            </Text>
            <GymYears days={days} today={today} />
          </View>
        ) : null}

        {done.size > 0 ? (
          <View style={[styles.card, { backgroundColor: c.bgRaised }]} testID="strength">
            <Text accessibilityRole="header" style={[styles.section, { color: c.textMuted }]}>
              {t('progress.strength')}
            </Text>
            <SegmentedControl
              values={periods.map((p) => t(`progress.period.${p}` as StringKey))}
              selectedIndex={periods.indexOf(period)}
              onChange={(e) => setPeriod(periods[e.nativeEvent.selectedSegmentIndex] ?? 'all')}
              appearance={scheme}
              accessibilityLabel={t('progress.periodA11y')}
              style={styles.segments}
              testID="period"
            />
            <View style={styles.headRow}>
              <View style={styles.keys}>
                <Key color={c.accent} label={t('progress.now')} />
                <Key color={c.restOutline} dashed label={t('progress.start')} />
              </View>
              {strength.change !== null ? (
                <View style={[styles.change, { backgroundColor: c.accentSoft }]} testID="strength-change">
                  <Icon name={strength.change > 0 ? 'arrowUp' : strength.change < 0 ? 'arrowDown' : 'equal'} size={14} color={c.accent} />
                  <Text style={[styles.changeText, { color: c.accent }]}>{pct(strength.change)}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.caption, { color: c.textMuted }]} testID="strength-period">
              {t('progress.inPeriod', { workouts: strength.workouts, sets: strength.sets })}
            </Text>
            {/* Growth, not raw kg: every group starts on the same even shape (100%) and Now pushes
                out by its own gain, so a light group's +20% counts as much as a heavy one's. A
                group without data dips to the middle: the gap in the balance shows. Kg in the list. */}
            <RadarChart
              key={period}
              minScale={1.5}
              axes={muscleGroups.map((g) => {
                const x = strength.groups[g];
                return { label: groupName(g), sub: x ? pct(growth(g)) : t('progress.noData'), start: x ? 1 : null, now: x ? 1 + growth(g) : null };
              })}
              accessibilityLabel={t('progress.radarA11y')}
              testID="radar"
            />
            <View style={styles.list}>
              {muscleGroups.map((g) => {
                const x = strength.groups[g];
                const inReps = strength.repsOnly.includes(g);
                return (
                  <View
                    key={g}
                    style={[styles.groupRow, { borderColor: c.border }]}
                    accessible
                    accessibilityLabel={
                      x
                        ? t(inReps ? 'progress.groupRepsA11y' : 'progress.groupA11y', {
                            group: groupName(g),
                            now: inReps ? x.now : kg(x.now),
                            start: inReps ? x.start : kg(x.start),
                            change: pct(growth(g)),
                          })
                        : t('progress.groupNoneA11y', { group: groupName(g) })
                    }
                    testID={`group-${g}`}>
                    <Text style={[styles.groupName, { color: x ? c.text : c.textMuted }]}>{groupName(g)}</Text>
                    {x ? (
                      <>
                        <Text style={[styles.kg, { color: c.textMuted }]}>
                          {inReps ? x.start : kg(x.start)} →{' '}
                          <Text style={{ color: c.text }}>{inReps ? t('progress.reps', { n: x.now }) : kg(x.now)}</Text>
                        </Text>
                        <Text style={[styles.groupPct, { color: g === lagging ? c.textMuted : c.accent }]}>{pct(growth(g))}</Text>
                      </>
                    ) : (
                      <Text style={[styles.kg, { color: c.textMuted }]}>{t('progress.noData')}</Text>
                    )}
                  </View>
                );
              })}
            </View>
            {callout ? (
              <View style={[styles.callout, { backgroundColor: c.field }]} testID="strength-callout">
                <Icon name="info" size={18} color={c.accent} />
                <Text style={[styles.callText, { color: c.text }]}>{callout}</Text>
              </View>
            ) : null}
            <Text style={[styles.caption, { color: c.textMuted }]}>{t('progress.method')}</Text>
          </View>
        ) : (
          // No finished workout yet: the analysis still has its place, so it is never missing.
          <View style={[styles.card, { backgroundColor: c.bgRaised }]} testID="progress-empty">
            <Text accessibilityRole="header" style={[styles.section, { color: c.textMuted }]}>
              {t('progress.strength')}
            </Text>
            <Text style={[styles.body, { color: c.textMuted }]}>{t('progress.empty')}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ icon, text, strong, testID }: { icon: IconName; text: string; strong?: boolean; testID: string }) {
  const c = useColors();
  return (
    <View style={[styles.stat, { backgroundColor: strong ? c.accent : c.accentSoft }]} testID={testID}>
      <Icon name={icon} size={14} color={strong ? c.onAccent : c.accent} />
      <Text style={[styles.statText, { color: strong ? c.onAccent : c.accent }]}>{text}</Text>
    </View>
  );
}

function Key({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  const c = useColors();
  return (
    <View style={styles.key}>
      <View style={[styles.keyLine, { borderColor: color, borderStyle: dashed ? 'dashed' : 'solid' }]} />
      <Text style={[styles.caption, { color: c.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: space.md, paddingBottom: space.xxl, gap: space.md, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  title: { ...font.title, paddingTop: space.sm },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  stat: { flexDirection: 'row', alignItems: 'center', gap: space.xs, borderRadius: radius.full, paddingHorizontal: space.ms, paddingVertical: space.sm },
  statText: { ...font.callout, fontWeight: '600' },
  card: { borderRadius: radius.lg, padding: space.md, gap: space.ms },
  section: { ...font.section, textTransform: 'uppercase' },
  body: { ...font.body },
  caption: { ...font.caption },
  segments: { minHeight: size.touch },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: space.sm },
  keys: { flexDirection: 'row', gap: space.md },
  key: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  keyLine: { width: space.lg - space.xs, borderTopWidth: 2.5 },
  change: { flexDirection: 'row', alignItems: 'center', gap: space.xs, borderRadius: radius.full, paddingHorizontal: space.ms, paddingVertical: space.xs },
  changeText: { ...font.titleSmall, fontVariant: ['tabular-nums'] },
  list: { gap: 0 },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm, borderBottomWidth: StyleSheet.hairlineWidth, flexWrap: 'wrap' },
  groupName: { ...font.headline, flex: 1, minWidth: size.touch * 2 },
  kg: { ...font.callout, fontVariant: ['tabular-nums'] },
  groupPct: { ...font.headline, minWidth: size.touch, textAlign: 'right', fontVariant: ['tabular-nums'] },
  callout: { flexDirection: 'row', gap: space.sm, borderRadius: radius.md, padding: space.ms, alignItems: 'flex-start' },
  callText: { ...font.callout, flex: 1 },
});
