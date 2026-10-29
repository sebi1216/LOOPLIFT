import { StyleSheet, TextInput, View } from 'react-native';

import { Icon } from './icon';
import { font, radius, size, space } from './tokens';
import { useColors } from './use-colors';

type Props = { value: string; onChange: (q: string) => void; placeholder: string; testID?: string };

// Search box for the exercise library (Exercises tab and the exercise picker sheet).
export function SearchField({ value, onChange, placeholder, testID }: Props) {
  const c = useColors();
  return (
    <View style={[styles.box, { backgroundColor: c.bgRaised }]}>
      <Icon name="search" size={17} color={c.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={c.textMuted}
        accessibilityLabel={placeholder}
        autoCorrect={false}
        returnKeyType="search"
        style={[styles.input, { color: c.text }]}
        testID={testID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderRadius: radius.md, paddingHorizontal: space.md, minHeight: size.touch },
  input: { ...font.body, flex: 1, minHeight: size.touch },
});
