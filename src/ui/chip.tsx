import { Pressable, StyleSheet, Text } from 'react-native';

import { font, radius, size, space } from './tokens';
import { useColors } from './use-colors';

type Props = { label: string; onPress: () => void; accessibilityLabel?: string; rest?: boolean; testID?: string };

// A loop chip you can tap: "Push", "Pull", "Rest". Rest chips keep the dashed rest outline.
export function Chip({ label, onPress, accessibilityLabel, rest, testID }: Props) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: rest ? c.loopRest : c.accentSoft },
        rest && [styles.dashed, { borderColor: c.restOutline }],
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.text, { color: rest ? c.text : c.accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: size.touch,
    minWidth: size.touch,
    paddingHorizontal: space.md,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashed: { borderWidth: 1.5, borderStyle: 'dashed' },
  text: { ...font.callout, fontWeight: '600' },
  pressed: { opacity: 0.7 },
});
