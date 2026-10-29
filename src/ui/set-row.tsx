import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { parseKg, parseReps, type LoggedSet } from '@/data/tracker';
import { formatKg, t } from '@/i18n';

import { Icon } from './icon';
import { font, radius, size, space } from './tokens';
import { useColors } from './use-colors';

type Props = {
  n: number;
  set: LoggedSet;
  onChange: (change: Partial<LoggedSet>) => void;
  // Past sessions have no tick: every kept set was done.
  tickable?: boolean;
  testID: string;
};

// One set: number, kg, reps, tick. A field keeps what you type; a valid value is saved at once,
// anything else (62.3, 1000, letters) is not, and the field shows the last saved value on blur.
export function SetRow({ n, set, onChange, tickable = true, testID }: Props) {
  const c = useColors();
  return (
    <View style={styles.row} testID={testID}>
      <Text style={[styles.n, { color: c.textMuted }]} importantForAccessibility="no" accessibilityElementsHidden>
        {n}
      </Text>
      <NumberField
        value={set.kg === null ? '' : formatKg(set.kg)}
        parse={(s) => (s.trim() === '' ? { ok: true, v: null } : wrap(parseKg(s)))}
        onValue={(kg) => onChange({ kg })}
        keyboardType="decimal-pad"
        placeholder={t('session.kg')}
        accessibilityLabel={t('session.kgA11y', { n })}
        testID={`${testID}-kg`}
      />
      <NumberField
        value={String(set.reps)}
        parse={(s) => wrap(parseReps(s))}
        onValue={(reps) => reps !== null && onChange({ reps })}
        keyboardType="number-pad"
        placeholder={t('session.reps')}
        accessibilityLabel={t('session.repsA11y', { n })}
        testID={`${testID}-reps`}
      />
      {tickable ? (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel={t('session.tickA11y', { n })}
          aria-checked={set.done}
          onPress={() => onChange({ done: !set.done })}
          style={({ pressed }) => [
            styles.tick,
            // Unticked: an accent ring (6.2:1 on bgRaised), so the empty box is clearly a control.
            set.done ? { backgroundColor: c.accent } : [styles.open, { borderColor: c.accent }],
            pressed && styles.pressed,
          ]}
          testID={`${testID}-tick`}>
          {set.done ? <Icon name="check" size={22} color={c.onAccent} /> : null}
        </Pressable>
      ) : null}
    </View>
  );
}

const wrap = (v: number | null): { ok: boolean; v: number | null } => (v === null ? { ok: false, v: null } : { ok: true, v });

type FieldProps = {
  value: string;
  parse: (text: string) => { ok: boolean; v: number | null };
  onValue: (v: number | null) => void;
  keyboardType: 'decimal-pad' | 'number-pad';
  placeholder: string;
  accessibilityLabel: string;
  testID: string;
};

function NumberField({ value, parse, onValue, keyboardType, placeholder, accessibilityLabel, testID }: FieldProps) {
  const c = useColors();
  // What you type while the field has focus; otherwise the saved value shows (prefill, undo).
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <TextInput
      value={draft ?? value}
      onChangeText={(s) => {
        setDraft(s);
        const r = parse(s);
        if (r.ok) onValue(r.v);
      }}
      onFocus={() => setDraft(value)}
      onBlur={() => setDraft(null)}
      keyboardType={keyboardType}
      selectTextOnFocus
      maxLength={5}
      placeholder={placeholder}
      placeholderTextColor={c.textMuted}
      accessibilityLabel={accessibilityLabel}
      style={[styles.field, { backgroundColor: c.bg, color: c.text }]}
      testID={testID}
    />
  );
}

// The column titles above the set rows, aligned with SetRow.
export function SetHeader({ tickable = true }: { tickable?: boolean }) {
  const c = useColors();
  return (
    <View style={styles.row} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Text style={[styles.n, styles.head, { color: c.textMuted }]}>{t('session.set')}</Text>
      <Text style={[styles.flex, styles.head, { color: c.textMuted }]}>{t('session.kg')}</Text>
      <Text style={[styles.flex, styles.head, { color: c.textMuted }]}>{t('session.reps')}</Text>
      {tickable ? <View style={styles.tickSpace} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  n: { ...font.headline, minWidth: space.xl, textAlign: 'center' },
  head: { ...font.label, textAlign: 'center' },
  flex: { flex: 1 },
  field: {
    ...font.headline,
    flex: 1,
    minWidth: 0,
    minHeight: size.touch,
    borderRadius: radius.md,
    paddingHorizontal: space.sm,
    textAlign: 'center',
  },
  tick: { width: size.touch, height: size.touch, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  open: { borderWidth: 2 },
  tickSpace: { width: size.touch },
  pressed: { opacity: 0.7 },
});
