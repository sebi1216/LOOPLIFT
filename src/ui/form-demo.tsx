import { useIsFocused } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedReaction,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { t, type StringKey } from '@/i18n';

import { demos } from './form-demos';
import { pathsAt, sceneryPath, VIEW_H, VIEW_W, type Demo } from './form-motion';
import { Icon } from './icon';
import { font, motion, radius, size, space } from './tokens';
import { useColors } from './use-colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const MOVE = Easing.bezier(...motion.easeInOut);
const PAUSE_AT_END = 260;
const STROKE_BODY = 5.5;
const STROKE_GEAR = 3.5;
const STROKE_SCENERY = 3;
const SCENERY_OPACITY = 0.4;

const phaseLabel = (d: Demo, i: 0 | 1) => t(`form.phase.${d.phases[i]}` as StringKey);

// One rep on a loop, on the UI thread: the React side renders once and only hears about the
// turning points. Stops while paused or while the screen is covered.
function MovingFigure({ demo, color, width, playing, onPhase }: { demo: Demo; color: string; width: number; playing: boolean; onPhase?: (i: 0 | 1) => void }) {
  const progress = useSharedValue(0);
  const lastPhase = useSharedValue<number>(-1);

  useEffect(() => {
    if (!playing) {
      cancelAnimation(progress);
      return;
    }
    const [there, back] = demo.tempo;
    const from = progress.get();
    const rep = withSequence(
      withTiming(1, { duration: there, easing: MOVE }),
      withDelay(PAUSE_AT_END, withTiming(0, { duration: back, easing: MOVE })),
      withDelay(PAUSE_AT_END, withTiming(0, { duration: 0 })),
    );
    // Picks up where a pause left it, then loops whole reps.
    progress.set(
      withSequence(
        withTiming(1, { duration: Math.max(1, there * (1 - from)), easing: MOVE }),
        withDelay(PAUSE_AT_END, withTiming(0, { duration: back, easing: MOVE })),
        withDelay(PAUSE_AT_END, withRepeat(rep, -1)),
      ),
    );
    return () => cancelAnimation(progress);
  }, [demo, playing, progress]);

  useAnimatedReaction(
    () => progress.get(),
    (now, before) => {
      if (before === null || now === before || !onPhase) return;
      const phase = now > before ? 0 : 1;
      if (phase !== lastPhase.get()) {
        lastPhase.set(phase);
        scheduleOnRN(onPhase, phase as 0 | 1);
      }
    },
  );

  const paths = useDerivedValue(() => pathsAt(demo, progress.get()));
  const bodyProps = useAnimatedProps(() => ({ d: paths.get().body }));
  const gearProps = useAnimatedProps(() => ({ d: paths.get().gear }));
  const headProps = useAnimatedProps(() => ({ d: paths.get().head }));
  const first = useMemo(() => pathsAt(demo, 0), [demo]);
  const scenery = useMemo(() => sceneryPath(demo), [demo]);

  return (
    <Svg width={width} height={(width * VIEW_H) / VIEW_W} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
      <Path d={scenery} stroke={color} strokeOpacity={SCENERY_OPACITY} strokeWidth={STROKE_SCENERY} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <AnimatedPath animatedProps={gearProps} d={first.gear} stroke={color} strokeWidth={STROKE_GEAR} strokeLinecap="round" fill="none" />
      <AnimatedPath animatedProps={bodyProps} d={first.body} stroke={color} strokeWidth={STROKE_BODY} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <AnimatedPath animatedProps={headProps} d={first.head} fill={color} />
    </Svg>
  );
}

// One moment of a lift, not moving: Reduce Motion shows the first and the last pose instead.
export function StillFigure({ demo, t: at, color, width }: { demo: Demo; t: number; color: string; width: number }) {
  const p = useMemo(() => pathsAt(demo, at), [demo, at]);
  const scenery = useMemo(() => sceneryPath(demo), [demo]);
  return (
    <Svg width={width} height={(width * VIEW_H) / VIEW_W} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
      <Path d={scenery} stroke={color} strokeOpacity={SCENERY_OPACITY} strokeWidth={STROKE_SCENERY} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={p.gear} stroke={color} strokeWidth={STROKE_GEAR} strokeLinecap="round" fill="none" />
      <Path d={p.body} stroke={color} strokeWidth={STROKE_BODY} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={p.head} fill={color} />
    </Svg>
  );
}

// The small version inside the Exercise hero while you train: plays, tap it for the big one.
export function FormFigure({ id, color, width }: { id: string; color: string; width: number }) {
  const demo = demos[id];
  const reduced = useReducedMotion();
  const focused = useIsFocused();
  if (!demo) return null;
  return reduced ? <StillFigure demo={demo} t={demo.still} color={color} width={width} /> : <MovingFigure demo={demo} color={color} width={width} playing={focused} />;
}

// The big form demo: the figure on its tinted panel, what happens right now in words, and Pause.
export function FormDemo({ id, name, testID }: { id: string; name: string; testID?: string }) {
  const c = useColors();
  const demo = demos[id];
  const reduced = useReducedMotion();
  const focused = useIsFocused();
  const [playing, setPlaying] = useState(true);
  const [phase, setPhase] = useState<0 | 1>(0);
  const [width, setWidth] = useState(0);
  if (!demo) return null;

  const phases = demo.phases[0] === demo.phases[1] ? phaseLabel(demo, 0) : `${phaseLabel(demo, 0)}, ${phaseLabel(demo, 1)}`;

  if (reduced) {
    const half = width > 0 ? (width - space.sm) / 2 : 0;
    return (
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={t('form.a11y', { name, phases })}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={styles.stills}
        testID={testID}>
        {half > 0
          ? ([0, 1] as const).map((at) => (
              <View key={at} style={[styles.still, { backgroundColor: c.artTint }]}>
                <StillFigure demo={demo} t={at} color={c.accent} width={half - space.sm * 2} />
                <Text style={[styles.caption, { color: c.textMuted }]}>{t(at === 0 ? 'form.start' : 'form.end')}</Text>
              </View>
            ))
          : null}
      </View>
    );
  }

  return (
    <View style={styles.wrap} testID={testID}>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={t('form.a11y', { name, phases })}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={[styles.panel, { backgroundColor: c.artTint }]}>
        {width > 0 ? (
          <MovingFigure
            demo={demo}
            color={c.accent}
            width={Math.min(width - space.md * 2, size.demoMax)}
            playing={playing && focused}
            onPhase={setPhase}
          />
        ) : null}
      </View>
      <View style={styles.controls}>
        <Text style={[styles.phase, { color: c.text }]} testID={testID ? `${testID}-phase` : undefined}>
          {phaseLabel(demo, phase)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(playing ? 'form.pause' : 'form.play')}
          onPress={() => setPlaying(!playing)}
          style={({ pressed }) => [styles.toggle, { backgroundColor: c.accentSoft }, pressed && styles.pressed]}
          testID={testID ? `${testID}-toggle` : undefined}>
          <Icon name={playing ? 'pause' : 'play'} size={20} color={c.accent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  panel: { borderRadius: radius.md, alignItems: 'center', padding: space.sm },
  controls: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  phase: { ...font.headline, flex: 1 },
  toggle: { width: size.touch, height: size.touch, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  stills: { flexDirection: 'row', gap: space.sm },
  still: { flex: 1, borderRadius: radius.md, alignItems: 'center', padding: space.sm, gap: space.xs },
  caption: { ...font.caption },
  pressed: { opacity: 0.7 },
});
