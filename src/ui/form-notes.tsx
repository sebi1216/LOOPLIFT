import { StyleSheet, Text, View } from 'react-native';

import { hasString, t } from '@/i18n';

import { Icon } from './icon';
import { font, radius, space } from './tokens';
import { useColors } from './use-colors';

export const cuesFor = (id: string) => {
  const key = `cue.${id}`;
  return hasString(key) ? t(key).split('|') : [];
};

// The cues in numbered lines and the one thing to avoid. Own lifts have neither: shows nothing.
export function FormNotes({ id, cues = true }: { id: string; cues?: boolean }) {
  const c = useColors();
  const list = cues ? cuesFor(id) : [];
  const avoidKey = `avoid.${id}`;
  const avoid = hasString(avoidKey) ? t(avoidKey) : '';
  if (list.length === 0 && !avoid) return null;
  return (
    <View style={styles.wrap}>
      {list.length > 0 ? (
        <View style={styles.cues} accessible accessibilityLabel={`${t('exercise.cues')}: ${list.join('. ')}`}>
          {list.map((cue, i) => (
            <View key={cue} style={styles.cue}>
              <View style={[styles.num, { backgroundColor: c.accentSoft }]}>
                <Text style={[styles.numText, { color: c.accent }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.body, { color: c.text }]}>{cue}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {avoid ? (
        <View style={[styles.avoid, { backgroundColor: c.field }]} accessible accessibilityLabel={`${t('form.avoid')}: ${avoid}`} testID="form-avoid">
          <Icon name="close" size={15} color={c.danger} />
          <Text style={[styles.body, { color: c.text }]}>
            <Text style={styles.strong}>{`${t('form.avoid')}: `}</Text>
            {avoid}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.ms },
  cues: { gap: space.sm },
  cue: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  num: { width: space.lg, height: space.lg, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  numText: { ...font.caption, fontWeight: '700' },
  body: { ...font.callout, flex: 1 },
  strong: { fontWeight: '600' },
  avoid: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderRadius: radius.sm, padding: space.ms },
});
