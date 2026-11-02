import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { progressOf, remainingOf, REST_STEP, restTimer, useRest } from '@/data/rest';
import { t } from '@/i18n';

import { font, motion, radius, size, space } from './tokens';
import { useColors } from './use-colors';

const TICK_MS = 250;

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// The rest timer, pinned under the workout screens while it runs. It only works with the app
// open: a reminder on the lock screen needs a notification package (open question in now.md).
export function RestBar({ inFooter = false }: { inFooter?: boolean }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const focused = useIsFocused();
  const rest = useRest();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!rest) return;
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [rest]);

  // `now` can be a moment old right after a start, so the time left never reads above the length.
  const left = rest ? Math.min(rest.seconds, remainingOf(rest, now)) : 0;
  const over = !!rest && left === 0;

  // The screen underneath in the stack stays mounted; only the one on top shows the timer.
  if (!rest || !focused) return null;
  const progress = progressOf(rest, now);

  return (
    <Animated.View
      entering={reduced ? undefined : FadeInDown.duration(motion.enter)}
      exiting={reduced ? undefined : FadeOutDown.duration(motion.state)}
      accessibilityLiveRegion={over ? 'polite' : 'none'}
      style={[styles.wrap, !inFooter && { paddingBottom: insets.bottom + space.sm }]}
      testID="rest-bar">
      <View style={[styles.bar, { backgroundColor: c.bgRaised, borderColor: c.border }]}>
        {/* The fill shrinks with the time left; alone and out of flow, so nothing else lays out. */}
        <View style={[StyleSheet.absoluteFill, styles.track]} pointerEvents="none">
          <Animated.View
            style={[styles.fill, { backgroundColor: c.accentSoft, width: `${progress * 100}%`, transitionProperty: reduced ? 'none' : 'width', transitionDuration: TICK_MS, transitionTimingFunction: 'linear' }]}
          />
        </View>
        {over ? (
          <Text style={[styles.over, { color: c.text }]} testID="rest-over">
            {t('rest.over')}
          </Text>
        ) : (
          <>
            <View style={styles.time} accessible accessibilityLabel={t('rest.a11y', { time: clock(left) })}>
              <Text style={[styles.caption, { color: c.textMuted }]}>{t('rest.label')}</Text>
              <Text style={[styles.clock, { color: c.text }]} testID="rest-time">
                {clock(left)}
              </Text>
            </View>
            <Step label={t('rest.minusShort')} a11y={t('rest.minus')} onPress={() => restTimer.adjust(-REST_STEP)} testID="rest-minus" />
            <Step label={t('rest.plusShort')} a11y={t('rest.plus')} onPress={() => restTimer.adjust(REST_STEP)} testID="rest-plus" />
            <Step label={t('rest.skip')} a11y={t('rest.skipA11y')} onPress={restTimer.stop} testID="rest-skip" />
          </>
        )}
      </View>
    </Animated.View>
  );
}

function Step({ label, a11y, onPress, testID }: { label: string; a11y: string; onPress: () => void; testID: string }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={onPress}
      style={({ pressed }) => [styles.step, { backgroundColor: c.field }, pressed && styles.pressed]}
      testID={testID}>
      <Text style={[styles.stepText, { color: c.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: space.md, paddingTop: space.sm, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  bar: { flexDirection: 'row', alignItems: 'center', gap: space.xs, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, padding: space.sm, overflow: 'hidden', flexWrap: 'wrap' },
  track: { borderRadius: radius.md, overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  time: { flex: 1, minWidth: size.touch * 1.5, paddingHorizontal: space.xs },
  clock: { ...font.titleSmall, fontVariant: ['tabular-nums'] },
  over: { ...font.headline, flex: 1, padding: space.sm },
  step: { minWidth: size.touch, minHeight: size.touch, paddingHorizontal: space.sm, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  stepText: { ...font.callout, fontWeight: '600' },
  caption: { ...font.caption },
  pressed: { opacity: 0.7 },
});
