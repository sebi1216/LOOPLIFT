import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';

import { font, motion, space } from './tokens';
import { useColors } from './use-colors';

export type RadarAxis = { label: string; sub: string; start: number | null; now: number | null };

// minScale: the outer ring is at least this value, so small changes do not fill the whole web.
type Props = { axes: RadarAxis[]; minScale?: number; accessibilityLabel: string; testID?: string };

const RINGS = 4;
// Share of the box the chart itself takes; the rest is room for the labels around it.
const CHART = 0.5;
const LABEL_W = 84;

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

const at = (cx: number, cy: number, r: number, i: number, n: number) => {
  const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

// "Now" grows out of "Start" when the chart appears (or the period changes): the gain is the
// movement. Reduce Motion: it is simply there.
function NowShape({ from, to, fill, stroke }: { from: number[]; to: number[]; fill: string; stroke: string }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    p.set(withTiming(1, { duration: motion.celebrate, easing: Easing.bezier(...motion.easeOut) }));
  }, [p]);
  const animatedProps = useAnimatedProps(() => {
    const k = p.get();
    let s = '';
    for (let i = 0; i < to.length; i += 2) {
      s += `${from[i] + (to[i] - from[i]) * k},${from[i + 1] + (to[i + 1] - from[i + 1]) * k} `;
    }
    return { points: s.trim() };
  });
  return <AnimatedPolygon animatedProps={animatedProps} fill={fill} fillOpacity={0.22} stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" />;
}

// The strength web: one axis per muscle group, a shared kg scale so the shape shows balance.
// Text sits outside the SVG so it scales with the user's font size. Decoration for screen
// readers: the list under it says the same in words.
export function RadarChart({ axes, minScale = 1, accessibilityLabel, testID }: Props) {
  const c = useColors();
  const [w, setW] = useState(0);
  const n = axes.length;
  const box = Math.min(w, 360);
  const cx = box / 2;
  const cy = box / 2;
  const r = (box * CHART) / 2;
  const max = Math.max(minScale, ...axes.map((a) => a.now ?? 0), ...axes.map((a) => a.start ?? 0));
  const flat = (key: 'start' | 'now') =>
    axes.flatMap((a, i) => {
      const p = at(cx, cy, (r * (a[key] ?? 0)) / max, i, n);
      return [p.x, p.y];
    });
  const start = flat('start');
  const now = flat('now');
  const pairs = (xs: number[]) => xs.reduce((s, v, i) => s + (i % 2 ? `,${v} ` : `${v}`), '').trim();

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={styles.wrap} accessible accessibilityLabel={accessibilityLabel} testID={testID}>
      {box > 0 ? (
        <View style={{ width: box, height: box }}>
          <Svg width={box} height={box}>
            {Array.from({ length: RINGS }, (_, k) => (
              <Polygon
                key={k}
                points={pairs(axes.flatMap((_, i) => {
                  const p = at(cx, cy, (r * (k + 1)) / RINGS, i, n);
                  return [p.x, p.y];
                }))}
                fill="none"
                stroke={c.border}
                strokeWidth={1}
              />
            ))}
            {axes.map((a, i) => {
              const p = at(cx, cy, r, i, n);
              return <Line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={c.border} strokeWidth={1} strokeDasharray={a.now === null ? '3 4' : undefined} />;
            })}
            <Polygon points={pairs(start)} fill="none" stroke={c.restOutline} strokeWidth={2} strokeDasharray="5 4" strokeLinejoin="round" />
            <NowShape key={pairs(now)} from={start} to={now} fill={c.accent} stroke={c.accent} />
            {axes.map((a, i) =>
              a.now === null ? null : <Circle key={i} cx={now[i * 2]} cy={now[i * 2 + 1]} r={4} fill={c.bgRaised} stroke={c.accent} strokeWidth={2.5} />,
            )}
          </Svg>
          {axes.map((a, i) => {
            const p = at(cx, cy, r + space.sm, i, n);
            const align = Math.abs(p.x - cx) < 1 ? 'center' : p.x > cx ? 'left' : 'right';
            const left = align === 'center' ? p.x - LABEL_W / 2 : align === 'left' ? p.x : p.x - LABEL_W;
            const top = p.y < cy - 1 ? p.y - space.xl - space.xs : p.y > cy + 1 ? p.y : p.y - space.ms;
            return (
              <View key={i} style={[styles.label, { left, top, width: LABEL_W, alignItems: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end' }]} pointerEvents="none">
                <Text numberOfLines={1} style={[styles.name, { color: a.now === null ? c.textMuted : c.text }]}>
                  {a.label}
                </Text>
                <Text numberOfLines={1} style={[styles.sub, { color: c.textMuted }]}>
                  {a.sub}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center' },
  label: { position: 'absolute' },
  name: { ...font.headline },
  sub: { ...font.caption, fontVariant: ['tabular-nums'] },
});
