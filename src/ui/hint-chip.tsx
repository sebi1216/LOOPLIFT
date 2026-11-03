import { StyleSheet, Text, View } from 'react-native';

import type { Hint } from '@/data/hints';
import { getSettings } from '@/data/settings';
import { inUnit, otherUnit, type Unit } from '@/data/units';
import { formatKg, t } from '@/i18n';

import { Icon } from './icon';
import { font, radius, space } from './tokens';
import { useColors } from './use-colors';

// A weight (saved in kg) as the Settings want it: "62.5 kg", "138 lb", or with Show both units
// "62.5 kg · 138 lb". It reads the settings at call time: a screen using it calls useSettings()
// so it redraws when the unit changes.
export function weightIn(kg: number, unit: Unit): string {
  return t(unit === 'kg' ? 'exercise.kg' : 'exercise.lb', { kg: formatKg(inUnit(kg, unit)) });
}

export function kgText(kg: number): string {
  const s = getSettings();
  return s.showBoth ? `${weightIn(kg, s.unit)} · ${weightIn(kg, otherUnit(s.unit))}` : weightIn(kg, s.unit);
}

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
