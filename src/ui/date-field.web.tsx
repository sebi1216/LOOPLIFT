import { Pressable, StyleSheet, Text, View } from 'react-native';

import { addDays } from '@/data/schedule';
import { fullDate, t } from '@/i18n';

import { Icon } from './icon';
import { font, size, space } from './tokens';
import { useColors } from './use-colors';

type Props = { value: string; onChange: (iso: string) => void; accessibilityLabel: string; testID?: string };

// Web preview only: one day earlier / later around the date. iPhone uses the native picker.
export function DateField({ value, onChange, accessibilityLabel, testID }: Props) {
  const c = useColors();
  const step = (n: number, label: string, icon: 'chevronLeft' | 'chevronRight') => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => onChange(addDays(value, n))}
      style={styles.button}>
      <Icon name={icon} size={17} color={c.accent} />
    </Pressable>
  );
  return (
    <View style={styles.row} testID={testID} accessibilityLabel={accessibilityLabel}>
      {step(-1, t('loop.earlier'), 'chevronLeft')}
      <Text style={[styles.value, { color: c.accent }]}>{fullDate(value)}</Text>
      {step(1, t('loop.later'), 'chevronRight')}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  button: { width: size.touch, height: size.touch, alignItems: 'center', justifyContent: 'center' },
  value: { ...font.body, flexShrink: 1, textAlign: 'center', paddingHorizontal: space.xs },
});
