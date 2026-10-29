import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from './icon';
import { font, radius, size, space } from './tokens';
import { useColors } from './use-colors';

// today = accent fill · rest = dashed outline plus the word · manual = accent outline plus pin
// changed = accentSoft (previews) · plain = raised · blank = no plan (before the loop starts)
export type DayVariant = 'today' | 'rest' | 'manual' | 'changed' | 'plain' | 'blank';

type Props = {
  // circle: Today strip (bubble, label under it) · cell: Calendar and previews (label inside)
  shape: 'circle' | 'cell';
  top: string;
  label: string;
  variant: DayVariant;
  // Rest days that are also today or changed keep their dashed outline.
  rest?: boolean;
  // In previews the weekday is small and the plan is the important part.
  emphasis?: 'top' | 'label';
  onPress?: () => void;
  accessibilityLabel: string;
  testID?: string;
};

export function DayCell({ shape, top, label, variant, rest, emphasis = 'top', onPress, accessibilityLabel, testID }: Props) {
  const c = useColors();
  const isRest = rest ?? variant === 'rest';
  const bg =
    variant === 'today' ? c.accent : variant === 'changed' ? c.accentSoft : variant === 'blank' ? 'transparent' : c.bgRaised;
  const fg = variant === 'today' ? c.onAccent : c.text;
  const sub = variant === 'today' ? c.onAccent : variant === 'changed' ? c.accent : c.textMuted;
  const box = [
    shape === 'circle' ? styles.bubble : styles.cell,
    { backgroundColor: bg },
    isRest && variant !== 'today' && variant !== 'manual' && [styles.dashed, { borderColor: c.restOutline }],
    variant === 'manual' && [styles.manual, { borderColor: c.accent }],
  ];
  const pin = variant === 'manual' ? <Icon name="pin" size={10} color={c.accent} /> : null;

  const content =
    shape === 'circle' ? (
      <>
        <View style={box}>
          <Text style={[styles.num, { color: fg }]}>{top}</Text>
        </View>
        <View style={styles.labelRow}>
          {pin}
          <Text numberOfLines={1} style={[styles.label, { color: variant === 'today' ? c.accent : c.textMuted }]}>
            {label}
          </Text>
        </View>
      </>
    ) : (
      <View style={box}>
        <Text style={[emphasis === 'top' ? styles.num : styles.small, { color: emphasis === 'top' ? fg : sub }]}>{top}</Text>
        {label ? (
          <View style={styles.labelRow}>
            {pin}
            <Text
              numberOfLines={1}
              style={[emphasis === 'top' ? styles.label : styles.strong, { color: emphasis === 'top' ? sub : fg }]}>
              {label}
            </Text>
          </View>
        ) : null}
      </View>
    );

  if (!onPress) {
    return (
      <View accessible accessibilityLabel={accessibilityLabel} style={styles.column} testID={testID}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: variant === 'today' }}
      onPress={onPress}
      testID={testID}
      hitSlop={space.xs}
      style={({ pressed }) => [styles.column, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, alignItems: 'center', gap: space.xs, minHeight: size.touch, minWidth: 0 },
  bubble: {
    width: size.dayBubble,
    height: size.dayBubble,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    alignSelf: 'stretch',
    minHeight: size.touch,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xs,
  },
  dashed: { borderWidth: 1.5, borderStyle: 'dashed' },
  manual: { borderWidth: 2 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 2, maxWidth: '100%' },
  num: { ...font.headline },
  small: { ...font.label },
  label: { ...font.label },
  strong: { ...font.caption, fontWeight: '600' },
  pressed: { opacity: 0.7 },
});
