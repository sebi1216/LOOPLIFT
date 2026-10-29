import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { muscleGroups, type MuscleGroup } from '@/data/demo';
import { actions, useAppData } from '@/data/store';
import { t, type StringKey } from '@/i18n';
import { Button } from '@/ui/button';
import { Chip } from '@/ui/chip';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Add or rename an exercise: /exercises/edit (new) or /exercises/edit?id=e1 (rename).
export default function EditExercise() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const d = useAppData();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = d.exercises.find((e) => e.id === id);
  const [name, setName] = useState(existing?.name ?? '');
  const [group, setGroup] = useState<MuscleGroup>(existing?.muscleGroup ?? 'chest');

  const save = () => {
    if (!name.trim()) return;
    if (existing) actions.updateExercise(existing.id, name, group);
    else actions.addExercise(name, group);
    router.back();
  };

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled" style={{ backgroundColor: c.bg }} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.md }]} testID="exercise-edit">
      <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
        {existing ? t('exerciseEdit.edit') : t('exerciseEdit.new')}
      </Text>
      <View style={[styles.field, { backgroundColor: c.bgRaised }]}>
        <Text style={[styles.caption, { color: c.textMuted }]}>{t('exerciseEdit.name')}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('exerciseEdit.placeholder')}
          placeholderTextColor={c.textMuted}
          accessibilityLabel={t('exerciseEdit.name')}
          autoFocus={!existing}
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={save}
          style={[styles.input, { color: c.text }]}
          testID="exercise-name"
        />
      </View>
      <Text style={[styles.section, { color: c.textMuted }]}>{t('exerciseEdit.group').toUpperCase()}</Text>
      <View style={styles.chips} accessibilityRole="radiogroup">
        {muscleGroups.map((g) => {
          const label = t(`muscle.${g}` as StringKey);
          return g === group ? (
            <Button key={g} label={label} onPress={() => setGroup(g)} testID={`group-${g}`} />
          ) : (
            <Chip key={g} label={label} onPress={() => setGroup(g)} testID={`group-${g}`} />
          );
        })}
      </View>
      <Button label={t('common.save')} onPress={save} testID="exercise-save" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.md, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  title: { ...font.titleSmall, paddingTop: space.sm },
  field: { borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm, gap: space.xxs },
  input: { ...font.body, minHeight: space.xl, paddingVertical: 0 },
  section: { ...font.section },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  caption: { ...font.caption },
});
