import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from './icon';
import { font, radius, size, space } from './tokens';
import { useColors } from './use-colors';

type Props = {
  label: string;
  onPress?: () => void;
  // primary = the one main action, soft = an equal second action, dashed = "add" rows.
  variant?: 'primary' | 'soft' | 'dashed';
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

// Pill button from direction C. Text may wrap (German, 200% text): no fixed height.
export function Button({ label, onPress, variant = 'primary', icon, style, testID }: Props) {
  const c = useColors();
  const bg = variant === 'primary' ? c.accent : variant === 'soft' ? c.accentSoft : 'transparent';
  const fg = variant === 'primary' ? c.onAccent : c.accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg },
        variant === 'dashed' && [styles.dashed, { borderColor: c.accent }],
        pressed && styles.pressed,
        style,
      ]}>
      <View style={styles.row}>
        {icon ? <Icon name={icon} size={17} color={fg} /> : null}
        <Text style={[styles.label, { color: fg }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: size.touch,
    minWidth: size.touch,
    paddingHorizontal: space.lg,
    paddingVertical: space.ms,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashed: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: radius.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pressed: { opacity: 0.7 },
  label: { ...font.headline, textAlign: 'center', flexShrink: 1 },
});
