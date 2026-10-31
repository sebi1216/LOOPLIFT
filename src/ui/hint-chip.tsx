import { StyleSheet, Text, View } from 'react-native';

import type { Hint } from '@/data/hints';
import { formatKg, t } from '@/i18n';

import { Icon } from './icon';
import { font, radius, space } from './tokens';
import { useColors } from './use-colors';

export const kgText = (kg: number) => t('exercise.kg', { kg: formatKg(kg) });

// The short form of a hint, for chips and labels ("Try 67.5 kg").
export function hintShort(h: Hint): string {
  if (h.kind === 'up') return t('hint.try', { kg: kgText(h.kg) });
  if (h.kind === 'stay') return t('hint.stay', { kg: kgText(h.kg) });
  if (h.kind === 'comeback') return t('hint.comeback', { kg: kgText(h.kg) });
  return t('hint.same');
}

// A small pill under a lift. "Add weight" is the one act-style hint (accent, arrow up); the
// others are quiet (field). Status is never colour alone: the text always says it.
export function HintChip({ hint, testID }: { hint: Hint; testID?: string }) {
  const c = useColors();
  const up = hint.kind === 'up';
  const fg = up ? c.onAccent : c.text;
  return (
    <View style={[styles.chip, { backgroundColor: up ? c.accent : c.field }]} testID={testID}>
      {up ? <Icon name="arrowUp" size={13} color={fg} /> : null}
      <Text style={[styles.text, { color: fg }]}>{hintShort(hint)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.xs,
    borderRadius: radius.full,
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
  },
  text: { ...font.caption, fontWeight: '600', flexShrink: 1 },
});
