import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { activeYears, yearWeeks } from '@/data/progress';
import { t } from '@/i18n';

import { font, space } from './tokens';
import { useColors } from './use-colors';

const GAP = 2;

// Gym days, one row per year (newest first), only the years with a workout. Each row is the
// whole year as week columns, Monday on top, one small square a day. Two shades: a lighter one
// for a short day, the full accent from 12 sets up. Each year reads as one sentence to screen
// readers.
export function GymYears({ days, today }: { days: Map<string, number>; today: string }) {
  const years = activeYears(days, today);
  return (
    <View style={styles.years} testID="gym-years">
      {years.map((y) => (
        <GymYear key={y} year={y} days={days} today={today} />
      ))}
    </View>
  );
}

function GymYear({ year, days, today }: { year: number; days: Map<string, number>; today: string }) {
  const c = useColors();
  const [w, setW] = useState(0);
  const weeks = yearWeeks(year);
  const cell = Math.max(3, Math.floor((w - (weeks.length - 1) * GAP) / weeks.length));
  const count = weeks.flat().filter((d) => d !== null && d <= today && days.has(d)).length;
  return (
    <View style={styles.year} accessible accessibilityLabel={t('progress.yearA11y', { year, n: count })} testID={`gym-year-${year}`}>
      <View style={styles.head}>
        <Text style={[styles.headline, { color: c.text }]}>{year}</Text>
        <Text style={[styles.caption, { color: c.textMuted }]}>{t('progress.yearCount', { n: count })}</Text>
      </View>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={styles.strip}>
        {w > 0
          ? weeks.map((week, i) => (
              <View key={i} style={styles.col}>
                {week.map((d, j) => {
                  const sets = d ? (days.get(d) ?? 0) : 0;
                  const bg = !d || d > today ? 'transparent' : sets >= 12 ? c.accent : sets > 0 ? c.loopPull : c.field;
                  return (
                    <View
                      key={j}
                      style={{ width: cell, height: cell, borderRadius: cell / 4, backgroundColor: bg, borderWidth: d === today ? 1 : 0, borderColor: c.accent }}
                    />
                  );
                })}
              </View>
            ))
          : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  years: { gap: space.md },
  year: { gap: space.xs },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.sm },
  headline: { ...font.headline, fontVariant: ['tabular-nums'] },
  caption: { ...font.caption },
  strip: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  col: { gap: GAP },
});
