import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { font, radius, size, space } from './tokens';
import { useColors } from './use-colors';

type Props = {
  title: string;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  // Extra content under the title (the steppers in the workout editor).
  children?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
};

// A raised row (radius lg): drag handle or number bubble, title, subtitle, trailing action.
export function CardRow({ title, subtitle, leading, trailing, children, onPress, accessibilityLabel, testID }: Props) {
  const c = useColors();
  const body = (
    <View style={styles.body}>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {typeof subtitle === 'string' ? <Text style={[styles.subtitle, { color: c.textMuted }]}>{subtitle}</Text> : subtitle}
      {children}
    </View>
  );
  return (
    <View style={[styles.row, { backgroundColor: c.bgRaised }]} testID={testID}>
      {leading}
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? title}
          onPress={onPress}
          style={({ pressed }) => [styles.press, pressed && styles.pressed]}>
          {body}
        </Pressable>
      ) : (
        body
      )}
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.ms,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.ms,
    minHeight: size.touch + space.md,
  },
  press: { flex: 1, minHeight: size.touch, justifyContent: 'center' },
  body: { flex: 1, gap: space.xs, justifyContent: 'center' },
  title: { ...font.headline },
  subtitle: { ...font.caption },
  pressed: { opacity: 0.7 },
});
