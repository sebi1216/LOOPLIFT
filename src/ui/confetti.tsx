import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe, useReducedMotion } from 'react-native-reanimated';

import { haptic } from './haptics';
import { motion, radius, space } from './tokens';
import { useColors } from './use-colors';

const PIECES = 18;
const SPREAD = 150;
const LIFT = 130;
const FALL = 70;
const DURATION = motion.celebrate * 2;

// Fixed spread, so a burst looks the same on every run and in every screenshot.
const pieces = Array.from({ length: PIECES }, (_, i) => {
  const side = i % 2 === 0 ? 1 : -1;
  const reach = (((i * 7) % PIECES) + 2) / PIECES;
  return {
    x: side * reach * SPREAD,
    up: LIFT * (0.6 + (((i * 5) % PIECES) / PIECES) * 0.6),
    spin: side * (180 + i * 40),
    delay: (i % 4) * 30,
    round: i % 3 === 0,
  };
});

const burst = (p: (typeof pieces)[number]) =>
  new Keyframe({
    from: { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }, { rotate: '0deg' }, { scale: 0.6 }] },
    15: { opacity: 1, transform: [{ translateX: p.x * 0.3 }, { translateY: -p.up * 0.5 }, { rotate: `${p.spin * 0.3}deg` }, { scale: 1 }] },
    55: { opacity: 1, transform: [{ translateX: p.x * 0.8 }, { translateY: -p.up }, { rotate: `${p.spin * 0.7}deg` }, { scale: 1 }], easing: Easing.bezier(...motion.easeOut) },
    to: { opacity: 0, transform: [{ translateX: p.x }, { translateY: -p.up + FALL }, { rotate: `${p.spin}deg` }, { scale: 0.8 }] },
  })
    .delay(p.delay)
    .duration(DURATION);

// A small burst behind the Summary hero for a new record: the one celebration in the app, and rare
// because records are. Drawn with plain Views on the UI thread, no package. Decoration only: the
// record is also written out in words. Reduce Motion: no burst, the success haptic still comes.
export function Confetti() {
  const c = useColors();
  const reduced = useReducedMotion();
  useEffect(() => haptic('record'), []);
  if (reduced) return null;
  return (
    <View style={styles.origin} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" testID="confetti">
      {pieces.map((p, i) => (
        <Animated.View key={i} entering={burst(p)} style={[styles.piece, p.round && styles.round, { backgroundColor: c.onHero, opacity: 0 }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  origin: { position: 'absolute', left: '50%', top: '45%', width: 0, height: 0 },
  piece: { position: 'absolute', width: space.sm, height: space.sm + space.xs, borderRadius: space.xxs },
  round: { width: space.sm, height: space.sm, borderRadius: radius.full },
});
