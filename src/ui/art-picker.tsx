import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { t, type StringKey } from '@/i18n';

import { artChoices, LiftArt } from './lift-art';
import { radius, size, space, font } from './tokens';
import { useColors } from './use-colors';

// The plain dumbbell: no drawing has this id, so LiftArt shows its stand-in.
const NONE = 'none';

type Props = { value: string | undefined; onChange: (art: string | undefined) => void; testID?: string };

// Pick a picture for a lift you add: a row of the starter lifts' drawings to scroll through,
// the dumbbell first. The picked one gets the accent ring. Saved as exercise.art.
export function ArtPicker({ value, onChange, testID }: Props) {
  const c = useColors();
  const picked = value ?? NONE;
  return (
    <View style={styles.wrap}>
      <Text style={[styles.section, { color: c.textMuted }]}>{t('exerciseEdit.picture').toUpperCase()}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} accessibilityRole="radiogroup" testID={testID}>
        {[NONE, ...artChoices].map((id) => {
          const on = id === picked;
          const name = id === NONE ? t('exerciseEdit.pictureNone') : t(`lift.${id}` as StringKey);
          return (
            <Pressable
              key={id}
              accessibilityRole="radio"
              accessibilityLabel={t('exerciseEdit.pictureA11y', { name })}
              aria-checked={on}
              accessibilityState={{ checked: on }}
              onPress={() => onChange(id === NONE ? undefined : id)}
              style={({ pressed }) => [
                styles.tile,
                { backgroundColor: c.artTint, borderColor: on ? c.accent : 'transparent' },
                pressed && styles.pressed,
              ]}
              testID={`art-${id}`}>
              <LiftArt id={id} color={c.accent} width={size.touch} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  section: { ...font.section },
  row: { gap: space.sm, paddingVertical: space.xxs },
  tile: { minWidth: size.touch + space.md, minHeight: size.touch + space.md, borderRadius: radius.md, borderWidth: 2, alignItems: 'center', justifyContent: 'center', padding: space.xs },
  pressed: { opacity: 0.7 },
});
