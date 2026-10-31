import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import type { Slot } from '@/data/schedule';

import { font, space } from './tokens';
import { useColors } from './use-colors';

type Props = {
  slots: Slot[];
  // The slot that is "now". null: no slot is current (a day off the loop).
  current: number | null;
  diameter: number;
  stroke: number;
  // surface: on bg or bgRaised (current = accent). hero: on the HeroCard gradient (white arcs,
  // a marker on today, a dashed orbit and the other days' names around the ring).
  tone?: 'surface' | 'hero';
  // hero only: the name of each slot, shown outside the ring next to its arc.
  labels?: string[];
  children?: ReactNode;
};

// Room around the ring for the orbit and the slot names (hero tone). 40: ring plus orbit (280)
// still fits a 375 wide phone inside the HeroCard (375 - 2 x 16 - 2 x 24 = 295).
const ORBIT = space.xl + space.sm;
const LABEL_W = 72;
// Hero arcs are onHero at these strengths: other workouts, rest days, the orbit.
const HERO_PULL = 0.35;
const HERO_REST = 0.15;
const HERO_ORBIT = 0.18;

// The loop as a ring: one arc per day in the loop, a small gap between arcs, the current slot
// at 12 o'clock and the loop running clockwise. No slots: a dashed circle.
export function LoopRing({ slots, current, diameter, stroke, tone = 'surface', labels, children }: Props) {
  const c = useColors();
  const hero = tone === 'hero';
  const pad = hero ? ORBIT : 0;
  const outer = diameter + pad * 2;
  const mid = outer / 2;
  const r = (diameter - stroke) / 2;
  const n = slots.length;
  const first = current ?? 0;
  const gapDeg = n > 1 ? Math.min(10, 120 / n) : 0;

  const at = (deg: number, radius: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: mid + radius * Math.cos(rad), y: mid + radius * Math.sin(rad) };
  };
  const point = (deg: number) => {
    const p = at(deg, r);
    return `${p.x} ${p.y}`;
  };
  const span = (i: number) => {
    const pos = (i - first + n) % n;
    return { start: (pos * 360) / n + gapDeg / 2, end: ((pos + 1) * 360) / n - gapDeg / 2 };
  };
  const colorOf = (i: number, slot: Slot) =>
    hero
      ? { stroke: c.onHero, opacity: i === current ? 1 : slot === 'rest' ? HERO_REST : HERO_PULL }
      : { stroke: i === current ? c.accent : slot === 'rest' ? c.loopRest : c.loopPull, opacity: 1 };
  const marker = hero && current !== null && n > 1 ? at(span(current).end, r) : null;

  return (
    <View style={{ width: outer, height: outer }}>
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Svg width={outer} height={outer}>
          {hero ? (
            <Circle cx={mid} cy={mid} r={mid - 1} stroke={c.onHero} strokeOpacity={HERO_ORBIT} strokeWidth={1.5} strokeDasharray="2 6" fill="none" />
          ) : null}
          {n === 0 ? (
            <Circle
              cx={mid}
              cy={mid}
              r={diameter / 2 - 1}
              stroke={hero ? c.onHero : c.restOutline}
              strokeWidth={1.5}
              strokeDasharray="6 6"
              fill="none"
            />
          ) : n === 1 ? (
            <Circle cx={mid} cy={mid} r={r} stroke={colorOf(0, slots[0]).stroke} strokeOpacity={colorOf(0, slots[0]).opacity} strokeWidth={stroke} fill="none" />
          ) : (
            slots.map((slot, i) => {
              const { start, end } = span(i);
              const large = end - start > 180 ? 1 : 0;
              const col = colorOf(i, slot);
              return (
                <Path
                  key={i}
                  d={`M ${point(start)} A ${r} ${r} 0 ${large} 1 ${point(end)}`}
                  stroke={col.stroke}
                  strokeOpacity={col.opacity}
                  strokeWidth={stroke}
                  strokeLinecap="butt"
                  fill="none"
                />
              );
            })
          )}
          {marker ? <Circle cx={marker.x} cy={marker.y} r={stroke / 2 + 2} fill={c.heroTo} stroke={c.onHero} strokeWidth={4} /> : null}
        </Svg>
        {hero && labels && n > 1
          ? slots.map((_, i) => {
              if (i === current) return null;
              const { start, end } = span(i);
              const p = at((start + end) / 2, diameter / 2 + pad / 2);
              return (
                <Text
                  key={i}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                  maxFontSizeMultiplier={1.3}
                  style={[styles.label, { color: c.onHero, left: p.x - LABEL_W / 2, top: p.y - font.callout.lineHeight / 2 }]}>
                  {labels[i]}
                </Text>
              );
            })
          : null}
      </View>
      <View style={[StyleSheet.absoluteFill, styles.center, { padding: pad + stroke + space.sm }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  label: { ...font.callout, fontWeight: '600', position: 'absolute', width: LABEL_W, textAlign: 'center' },
});
