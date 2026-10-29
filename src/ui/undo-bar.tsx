import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/i18n';

import { font, radius, size, space } from './tokens';
import { useColors } from './use-colors';

type Props = { message: string; onUndo: () => void; onTimeout: () => void; testID?: string };

const SHOW_MS = 6000;

// "Workout deleted · Undo" at the bottom of the screen for a few seconds (rules.md 3: undo over
// "Are you sure?"). Screen readers hear the message once.
export function UndoBar({ message, onUndo, onTimeout, testID }: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    const timer = setTimeout(onTimeout, SHOW_MS);
    return () => clearTimeout(timer);
  }, [onTimeout]);

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.bar, { backgroundColor: c.bgRaised, borderColor: c.border, bottom: insets.bottom + space.md }]}
      testID={testID}>
      <Text style={[styles.text, { color: c.text }]}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.undo')}
        onPress={onUndo}
        style={({ pressed }) => [styles.undo, pressed && styles.pressed]}
        testID={testID ? `${testID}-undo` : undefined}>
        <Text style={[styles.undoText, { color: c.accent }]}>{t('common.undo')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: space.md,
    right: space.md,
    maxWidth: size.maxContent,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingLeft: space.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: { ...font.callout, flex: 1 },
  undo: { minHeight: size.touch, minWidth: size.touch, paddingHorizontal: space.md, alignItems: 'center', justifyContent: 'center' },
  undoText: { ...font.headline },
  pressed: { opacity: 0.6 },
});
