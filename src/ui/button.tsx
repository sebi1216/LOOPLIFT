import { Pressable, StyleSheet, Text } from 'react-native';

import { font, radius, size, space } from './tokens';
import { useColors } from './use-colors';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  testID?: string;
};

// The one shared component in the starter. Add more only when a second screen needs them.
export function Button({ label, onPress, variant = 'primary', testID }: Props) {
  const c = useColors();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: primary ? c.accent : c.bgRaised },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.label, { color: primary ? c.onAccent : c.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: size.touch,
    minWidth: size.touch,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  label: { ...font.headline },
});
