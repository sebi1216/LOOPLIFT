import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { Icon } from './icon';
import { font, radius, size, space } from './tokens';
import { useColors } from './use-colors';

type Props = { label: string; onPress: () => void; icon?: 'plus'; testID?: string };

// A header action: text ("Save", "Done") or a round "+" (48 x 48). iOS places it inside the
// navigation bar's own inset; the web header has none, so it gets the 16 side padding there.
export function HeaderButton({ label, onPress, icon, testID }: Props) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={icon ? 0 : space.sm}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        icon && [styles.round, { backgroundColor: c.accentSoft }],
        Platform.OS === 'web' && styles.web,
        pressed && styles.pressed,
      ]}>
      {icon ? <Icon name={icon} size={22} color={c.accent} /> : <Text style={[styles.text, { color: c.accent }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: size.touch, minWidth: size.touch, alignItems: 'center', justifyContent: 'center' },
  round: { width: size.touch, height: size.touch, borderRadius: radius.full },
  web: { marginRight: space.md },
  text: { ...font.headline },
  pressed: { opacity: 0.6 },
});
