import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, space } from './tokens';
import { useColors } from './use-colors';

type Props = { children: ReactNode; style?: StyleProp<ViewStyle>; testID?: string };

// The one brand surface (direction S1): a teal gradient from heroFrom to heroTo, text in onHero.
// The gradient is React Native's own backgroundImage (RN 0.88), no package; heroTo underneath
// is the fallback colour. Used on Today, the Exercise header, Summary and the Rotation editor.
export function HeroCard({ children, style, testID }: Props) {
  const c = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.heroTo, backgroundImage: `linear-gradient(135deg, ${c.heroFrom}, ${c.heroTo})` },
        style,
      ]}
      testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: space.lg, gap: space.md, overflow: 'hidden' },
});
