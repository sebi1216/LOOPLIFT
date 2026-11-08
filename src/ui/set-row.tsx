import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useReducedMotion, type CSSAnimationProperties } from 'react-native-reanimated';

import { useSettings } from '@/data/settings';
import { parseReps, type LoggedSet } from '@/data/tracker';
import { inUnit, otherUnit, parseWeight, type Unit } from '@/data/units';
import { formatKg, t } from '@/i18n';

import { Icon } from './icon';
import { font, motion, radius, size, space } from './tokens';
import { useColors } from './use-colors';

type Props = {
  n: number;
  set: LoggedSet;
  onChange: (change: Partial<LoggedSet>) => void;
  // Past sessions have no tick: every kept set was done.
  tickable?: boolean;
  testID: string;
};

// The weight fields, in the unit from Settings; with Show both units the other one comes second.
// Weights are saved in kg either way, so typing in one field updates the other.
function useUnits(): Unit[] {
  const s = useSettings();
  return s.showBoth ? [s.unit, otherUnit(s.unit)] : [s.unit];
}

// One set: number, weight, reps, tick. A field keeps what you type; a valid value is saved at once,
// anything else (62.3, 1000, letters) is not, and the field shows the last saved value on blur.
export function SetRow({ n, set, onChange, tickable = true, testID }: Props) {
  const c = useColors();
  const reduced = useReducedMotion();
  const [justTicked, setJustTicked] = useState(false);
  const units = useUnits();
  return (
    <Animated.View
      style={[
        styles.row,
        styles.card,
        { backgroundColor: set.done && tickable ? c.accentSoft : c.field, transitionProperty: 'backgroundColor', transitionDuration: motion.state },
      ]}
      testID={testID}>
      <Text style={[styles.n, { color: set.done && tickable ? c.accent : c.textMuted }]} importantForAccessibility="no" accessibilityElementsHidden>
        {n}
      </Text>
      {units.map((unit) => (
        <NumberField
          key={unit}
          value={set.kg === null ? '' : formatKg(inUnit(set.kg, unit))}
          parse={(s) => (s.trim() === '' ? { ok: true, v: null } : wrap(parseWeight(s, unit)))}
          onValue={(kg) => onChange({ kg })}
          keyboardType="decimal-pad"
          placeholder={t(unit === 'kg' ? 'session.kg' : 'session.lb')}
          accessibilityLabel={t(unit === 'kg' ? 'session.kgA11y' : 'session.lbA11y', { n })}
          testID={unit === 'kg' ? `${testID}-kg` : `${testID}-lb`}
        />
      ))}
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
          onPress={() => {
            // The pop plays for the tick you just made, not for sets that were already ticked.
            setJustTicked(!set.done);
            onChange({ done: !set.done });
          }}
          style={({ pressed }) => pressed && styles.pressed}
          testID={`${testID}-tick`}>
          <Animated.View
            style={[
              styles.tick,
              // Unticked: a bgRaised circle with a restOutline ring and a muted check (3:1+ on field).
              set.done ? { backgroundColor: c.accent } : [styles.open, { borderColor: c.restOutline, backgroundColor: c.bgRaised }],
              justTicked && set.done && !reduced ? POP : null,
            ]}>
            <Icon name="check" size={22} color={set.done ? c.onAccent : c.textMuted} />
          </Animated.View>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

// Outside StyleSheet.create: these are Reanimated's own style keys, react-native-web rejects them.
const POP: CSSAnimationProperties = {
  animationName: { from: { transform: [{ scale: 0.82 }] }, '60%': { transform: [{ scale: 1.08 }] }, to: { transform: [{ scale: 1 }] } },
  animationDuration: motion.enter,
  animationTimingFunction: 'ease-out',
};

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
      style={[styles.field, { backgroundColor: c.bgRaised, color: c.text }]}
      testID={testID}
    />
  );
}

// The column titles above the set rows, aligned with SetRow.
export function SetHeader({ tickable = true }: { tickable?: boolean }) {
  const c = useColors();
  const units = useUnits();
  return (
    <View style={[styles.row, styles.headRow]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Text style={[styles.n, styles.head, { color: c.textMuted }]}>{t('session.set')}</Text>
      {units.map((u) => (
        <Text key={u} style={[styles.flex, styles.head, { color: c.textMuted }]}>{t(u === 'kg' ? 'session.kg' : 'session.lb')}</Text>
      ))}
      <Text style={[styles.flex, styles.head, { color: c.textMuted }]}>{t('session.reps')}</Text>
      {tickable ? <View style={styles.tickSpace} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  // Each set sits on its own tinted strip: field, or accentSoft once ticked.
  card: { borderRadius: radius.md, padding: space.xs },
  headRow: { paddingHorizontal: space.xs },
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
  open: { borderWidth: 1.5 },
  tickSpace: { width: size.touch },
  pressed: { opacity: 0.7 },
});
