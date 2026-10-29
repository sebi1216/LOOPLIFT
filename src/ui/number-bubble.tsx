import { StyleSheet, Text, View } from 'react-native';

import { Icon } from './icon';
import { font, radius, space } from './tokens';
import { useColors } from './use-colors';

// The round number in front of loop days, workouts and the first-launch steps.
// accent = current or next, soft = other workout, rest = rest slot, done = a check.
export function NumberBubble({ n, tone }: { n: number; tone: 'accent' | 'soft' | 'rest' | 'done' }) {
  const c = useColors();
  const bg = tone === 'accent' ? c.accent : tone === 'rest' ? c.loopRest : tone === 'done' ? c.accentSoft : c.loopPull;
  const fg = tone === 'accent' ? c.onAccent : c.text;
  return (
    <View style={[styles.bubble, { backgroundColor: bg }]}>
      {tone === 'done' ? <Icon name="check" size={15} color={c.accent} /> : <Text style={[styles.text, { color: fg }]}>{n}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    minWidth: space.xl,
    height: space.xl,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  text: { ...font.headline },
});
