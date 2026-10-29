import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from './icon';
import { font, radius, size, space } from './tokens';
import { useColors } from './use-colors';

type Props = {
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  minusLabel: string;
  plusLabel: string;
  testID?: string;
};

// "− 4 sets +" pill. The pill is 40 high (design); hitSlop brings each button to 48.
// Not @expo/ui's Stepper: the native one has no room for the value inside, which the design needs.
export function Stepper({ value, onMinus, onPlus, minusLabel, plusLabel, testID }: Props) {
  const c = useColors();
  const button = (label: string, icon: 'minus' | 'plus', onPress: () => void, id: string) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={space.xs}
      testID={testID ? `${testID}-${id}` : undefined}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Icon name={icon} size={15} color={c.accent} />
    </Pressable>
  );
  return (
    <View style={[styles.pill, { backgroundColor: c.accentSoft }]}>
      {button(minusLabel, 'minus', onMinus, 'minus')}
      <Text style={[styles.value, { color: c.text }]} testID={testID ? `${testID}-value` : undefined}>
        {value}
      </Text>
      {button(plusLabel, 'plus', onPlus, 'plus')}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.full, minHeight: size.touch - space.sm },
  button: { width: size.touch - space.sm, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  value: { ...font.callout, fontWeight: '600' },
  pressed: { opacity: 0.6 },
});
