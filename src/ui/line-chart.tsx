import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { daysBetween } from '@/data/schedule';

import { font, size, space } from './tokens';
import { useColors } from './use-colors';

type Point = { date: string; value: number };

type Props = {
  points: Point[];
  // Labels for the y range and the first and last date; text stays outside the SVG so it scales.
  formatValue: (v: number) => string;
  formatDate: (iso: string) => string;
  accessibilityLabel: string;
  testID?: string;
};

const HEIGHT = size.chart;
const DOT = space.xs;

// A small line chart: one dot per point, spaced by date, scaled from the lowest to the highest
// value. Drawn with react-native-svg (decision #3), no chart package.
export function LineChart({ points, formatValue, formatDate, accessibilityLabel, testID }: Props) {
  const c = useColors();
  const [width, setWidth] = useState(0);
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const first = points[0];
  const last = points[points.length - 1];
  const span = Math.max(1, daysBetween(first.date, last.date));
  const pad = DOT * 2;

  const xy = points.map((p) => {
    const x = points.length === 1 ? width / 2 : pad + ((width - pad * 2) * daysBetween(first.date, p.date)) / span;
    // A flat series sits on the top line, next to its one label.
    const y = max === min ? pad : pad + ((HEIGHT - pad * 2) * (max - p.value)) / (max - min);
    return { x, y };
  });

  return (
    <View style={styles.wrap} accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} testID={testID}>
      <View style={styles.plot}>
        <View style={styles.yAxis}>
          <Text style={[styles.label, { color: c.textMuted }]}>{formatValue(max)}</Text>
          {max !== min ? <Text style={[styles.label, { color: c.textMuted }]}>{formatValue(min)}</Text> : null}
        </View>
        <View style={styles.flex} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {width > 0 ? (
            <Svg width={width} height={HEIGHT}>
              <Line x1={0} x2={width} y1={pad} y2={pad} stroke={c.border} strokeWidth={1} />
              <Line x1={0} x2={width} y1={HEIGHT - pad} y2={HEIGHT - pad} stroke={c.border} strokeWidth={1} />
              {xy.length > 1 ? (
                <Polyline
                  points={xy.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={c.accent}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ) : null}
              {xy.map((p, i) => (
                <Circle key={points[i].date + i} cx={p.x} cy={p.y} r={DOT} fill={c.accent} />
              ))}
            </Svg>
          ) : (
            <View style={{ height: HEIGHT }} />
          )}
        </View>
      </View>
      <View style={styles.xAxis}>
        <Text style={[styles.label, { color: c.textMuted }]}>{formatDate(first.date)}</Text>
        {points.length > 1 ? <Text style={[styles.label, { color: c.textMuted }]}>{formatDate(last.date)}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  plot: { flexDirection: 'row', gap: space.sm },
  yAxis: { height: HEIGHT, justifyContent: 'space-between' },
  flex: { flex: 1 },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { ...font.caption },
});
