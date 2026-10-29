import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { font, radius, space } from './tokens';
import { useColors } from './use-colors';

type Props = { progress: SharedValue<number>; label: string; accessibilityLabel: string; onPress: () => void; rounded?: boolean };

// The red action behind a row you swipe left (Remove, Delete). Hidden until the swipe starts,
// so it never peeks out behind rounded row corners.
export function SwipeAction({ progress, label, accessibilityLabel, onPress, rounded }: Props) {
  const c = useColors();
  const style = useAnimatedStyle(() => ({ opacity: progress.get() > 0.01 ? 1 : 0 }));
  return (
    <Animated.View style={[styles.wrap, rounded && styles.rounded, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={[styles.button, rounded && styles.rounded, { backgroundColor: c.danger }]}>
        <Text style={[styles.text, { color: c.onAccent }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row' },
  rounded: { borderRadius: radius.lg, marginLeft: space.sm },
  button: { justifyContent: 'center', paddingHorizontal: space.lg },
  text: { ...font.headline },
});
