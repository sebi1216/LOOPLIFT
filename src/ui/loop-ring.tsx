import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import type { Slot } from '@/data/schedule';

import { space } from './tokens';
import { useColors } from './use-colors';

type Props = {
  slots: Slot[];
  // The slot that is "now" (accent). null: no slot is current (a day off the loop).
  current: number | null;
  // Start the ring at this slot, so the current one sits at 12 o'clock like in the design.
  diameter: number;
  stroke: number;
  children?: ReactNode;
};

// The loop as a ring: one arc per day in the loop, a small gap between arcs.
// Current slot = accent, workouts = loopPull, rest = loopRest. No slots: a dashed circle.
export function LoopRing({ slots, current, diameter, stroke, children }: Props) {
  const c = useColors();
  const r = (diameter - stroke) / 2;
  const mid = diameter / 2;
  const n = slots.length;
  const first = current ?? 0;
  const gapDeg = n > 1 ? Math.min(10, 120 / n) : 0;

  const point = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return `${mid + r * Math.cos(rad)} ${mid + r * Math.sin(rad)}`;
  };

  return (
    <View style={{ width: diameter, height: diameter }}>
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Svg width={diameter} height={diameter}>
        {n === 0 ? (
          <Circle cx={mid} cy={mid} r={mid - 1} stroke={c.restOutline} strokeWidth={1.5} strokeDasharray="6 6" fill="none" />
        ) : n === 1 ? (
          <Circle cx={mid} cy={mid} r={r} stroke={current === 0 ? c.accent : c.loopPull} strokeWidth={stroke} fill="none" />
        ) : (
          slots.map((slot, i) => {
            // Order the arcs so the current slot starts at the top and the loop runs clockwise.
            const pos = (i - first + n) % n;
            const start = (pos * 360) / n + gapDeg / 2;
            const end = ((pos + 1) * 360) / n - gapDeg / 2;
            const large = end - start > 180 ? 1 : 0;
            const color = i === current ? c.accent : slot === 'rest' ? c.loopRest : c.loopPull;
            return (
              <Path
                key={i}
                d={`M ${point(start)} A ${r} ${r} 0 ${large} 1 ${point(end)}`}
                stroke={color}
                strokeWidth={stroke}
                strokeLinecap="butt"
                fill="none"
              />
            );
          })
        )}
      </Svg>
      </View>
      <View style={[StyleSheet.absoluteFill, styles.center, { padding: stroke + space.sm }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
