import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, Keyframe, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings } from '@/data/settings';
import { inUnit } from '@/data/units';
import { hintFor, newRecords, type Hint } from '@/data/hints';
import { addDays, resolveRange } from '@/data/schedule';
import { useAppData } from '@/data/store';
import { history, volumeOf } from '@/data/tracker';
import { formatKg, longDate, t, weekdayName } from '@/i18n';
import { Button } from '@/ui/button';
import { Confetti } from '@/ui/confetti';
import { HeroCard } from '@/ui/hero-card';
import { kgText } from '@/ui/hint-chip';
import { Icon } from '@/ui/icon';
import { planLabel } from '@/ui/plan-label';
import { font, motion, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';

const HOME = '/' as Href;

// Finishing a workout is the rare moment that may take its time: the result arrives piece by
// piece. Reduce Motion: everything is simply there.
const STAGGER = 70;
const POP_IN = new Keyframe({
  from: { opacity: 0, transform: [{ scale: 0.7 }] },
  60: { opacity: 1, transform: [{ scale: 1.1 }] },
  to: { opacity: 1, transform: [{ scale: 1 }] },
}).duration(motion.celebrate);
const rise = (order: number, reduced: boolean) => (reduced ? undefined : FadeInDown.duration(motion.enter).delay(order * STAGGER));

// Summary after Finish workout (decision #11): lifts and sets done, new records (heaviest set
// ever, decision #12), what to try next time per lift (add weight or stay), and the next day in
// the loop. Done goes back to Today. /session/summary?id=<session id>; demo: finish Lena's Push
// on /session?start=w1&state=filled&date=2026-11-05.
export default function Summary() {
  const c = useColors();
  const { unit } = useSettings();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const d = useAppData();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const s = d.sessions.find((x) => x.id === id && x.finished);
  const close = () => (router.canGoBack() ? router.back() : router.replace(HOME));

  if (!s) {
    return (
      <View style={[styles.missing, { backgroundColor: c.bg }]} testID="summary-missing">
        <Text style={[styles.body, { color: c.textMuted }]}>{t('summary.missing')}</Text>
        <Button label={t('common.done')} onPress={close} />
      </View>
    );
  }

  const nameOf = (exerciseId: string) => d.exercises.find((e) => e.id === exerciseId)?.name ?? '';
  const sets = s.exercises.reduce((n, e) => n + e.sets.length, 0);
  const volume = volumeOf(s);
  const records = newRecords(d.sessions, s.id);
  const next = s.exercises.flatMap((e) => {
    const ex = d.exercises.find((x) => x.id === e.exerciseId);
    const h = ex ? hintFor(history(d.sessions, e.exerciseId), ex.muscleGroup, s.date, unit) : null;
    return h && (h.kind === 'up' || h.kind === 'stay') ? [{ exerciseId: e.exerciseId, hint: h }] : [];
  });
  const nextDay = resolveRange(d.schedule, s.date, 8)
    .slice(1)
    .find((x) => x.plan?.kind === 'workout');
  const when = nextDay && (nextDay.date === addDays(s.date, 1) ? t('summary.tomorrow') : weekdayName(nextDay.date));

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + space.lg }]} testID="summary">
      <HeroCard style={[styles.hero, { paddingTop: insets.top + space.xl }]}>
        {records.length > 0 ? <Confetti /> : null}
        <View style={styles.inner}>
          <Animated.View entering={reduced ? undefined : POP_IN} style={[styles.check, { backgroundColor: c.onHero }]}>
            <Icon name="check" size={28} color={c.heroFrom} />
          </Animated.View>
          <Animated.Text entering={rise(1, reduced)} accessibilityRole="header" style={[styles.title, { color: c.onHero }]}>
            {t('summary.title')}
          </Animated.Text>
          <Animated.Text entering={rise(2, reduced)} style={[styles.body, { color: c.onHero }]}>{`${s.workoutName} · ${longDate(s.date)}`}</Animated.Text>
          <Animated.View entering={rise(3, reduced)} style={styles.stats}>
            <Stat n={s.exercises.length} label={t('summary.lifts')} />
            <Stat n={sets} label={t('summary.sets')} />
            <Stat n={formatKg(Math.round(inUnit(volume, unit)))} label={t(unit === 'kg' ? 'summary.volume' : 'summary.volumeLb')} testID="summary-volume" />
            <Stat n={records.length} label={t(records.length === 1 ? 'summary.recordOne' : 'summary.recordMany')} bright={records.length > 0} testID="summary-records" />
          </Animated.View>
        </View>
      </HeroCard>

      <View style={styles.inner}>
        {records.length > 0 ? (
          <>
            <Animated.Text entering={rise(4, reduced)} accessibilityRole="header" style={[styles.section, { color: c.text }]}>
              {t(records.length === 1 ? 'summary.recordsOne' : 'summary.records')}
            </Animated.Text>
            {records.map((r, i) => (
              <Animated.View key={r.exerciseId} entering={rise(5 + i, reduced)}>
                <Row
                  icon="trophy"
                  tone="soft"
                  title={nameOf(r.exerciseId)}
                  body={
                    r.overBy > 0
                      ? t('summary.recordBody', { kg: kgText(r.kg), reps: r.reps, over: kgText(r.overBy) })
                      : t('summary.recordReps', { kg: kgText(r.kg), reps: r.reps })
                  }
                  testID={`record-${r.exerciseId}`}
                />
              </Animated.View>
            ))}
          </>
        ) : null}

        {next.length > 0 ? (
          <>
            <Animated.Text entering={rise(5 + records.length, reduced)} accessibilityRole="header" style={[styles.section, { color: c.text }]}>
              {t('summary.next')}
            </Animated.Text>
            {next.map(({ exerciseId, hint }, i) => (
              <Animated.View key={exerciseId} entering={rise(6 + records.length + i, reduced)}>
                <NextRow name={nameOf(exerciseId)} hint={hint} />
              </Animated.View>
            ))}
          </>
        ) : null}

        {nextDay?.plan && when ? (
          <Text style={[styles.callout, styles.center, { color: c.textMuted }]} testID="summary-next-day">
            {t('summary.nextLoop', { plan: planLabel(d, nextDay.plan), when })}
          </Text>
        ) : null}
        <Button label={t('common.done')} onPress={close} testID="summary-done" />
      </View>
    </ScrollView>
  );
}

function Stat({ n, label, bright, testID }: { n: number | string; label: string; bright?: boolean; testID?: string }) {
  const c = useColors();
  // The record tile is the one bright tile (accent on bgRaised, 6.41:1); the others sit on heroChip.
  const fg = bright ? c.accent : c.onHero;
  return (
    <View style={[styles.stat, { backgroundColor: bright ? c.bgRaised : c.heroChip }]} accessible accessibilityLabel={`${n} ${label}`} testID={testID}>
      <Text style={[styles.statN, { color: fg }]}>{n}</Text>
      <Text style={[styles.callout, { color: fg }]}>{label}</Text>
    </View>
  );
}

function NextRow({ name, hint }: { name: string; hint: Hint }) {
  if (hint.kind === 'up') {
    return (
      <Row
        icon="arrowUp"
        tone="accent"
        title={t('summary.tryTitle', { name, kg: kgText(hint.kg) })}
        body={t('summary.tryBody', { reps: hint.reps, n: hint.sessions })}
      />
    );
  }
  if (hint.kind === 'stay') {
    return (
      <Row
        icon="equal"
        tone="field"
        title={t('summary.stayTitle', { name, kg: kgText(hint.kg) })}
        body={t('summary.stayBody', { n: hint.sessions, kg: kgText(hint.kg), reps: hint.reps })}
      />
    );
  }
  return null;
}

type RowProps = { icon: 'trophy' | 'arrowUp' | 'equal'; tone: 'accent' | 'soft' | 'field'; title: string; body: string; testID?: string };

function Row({ icon, tone, title, body, testID }: RowProps) {
  const c = useColors();
  const bg = tone === 'accent' ? c.accent : tone === 'soft' ? c.accentSoft : c.field;
  const fg = tone === 'accent' ? c.onAccent : tone === 'soft' ? c.accent : c.text;
  return (
    <View style={[styles.row, { backgroundColor: c.bgRaised }]} accessible accessibilityLabel={`${title}. ${body}`} testID={testID}>
      <View style={[styles.rowIcon, { backgroundColor: bg }]}>
        <Icon name={icon} size={20} color={fg} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.headline, { color: c.text }]}>{title}</Text>
        <Text style={[styles.callout, { color: c.textMuted }]}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: space.lg },
  missing: { flex: 1, padding: space.md, gap: space.md, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: 0, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl, paddingHorizontal: 0 },
  inner: { paddingHorizontal: space.md, gap: space.ms, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  check: { width: size.touch + space.md, height: size.touch + space.md, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  title: { ...font.hero },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: space.ms, marginTop: space.md },
  stat: { flexGrow: 1, flexBasis: '40%', borderRadius: radius.lg, padding: space.md, gap: space.xxs },
  statN: { ...font.title },
  section: { ...font.titleSmall, marginTop: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.ms, borderRadius: radius.lg, padding: space.md },
  rowIcon: { width: size.touch, height: size.touch, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  headline: { ...font.headline },
  body: { ...font.body },
  callout: { ...font.callout },
});
