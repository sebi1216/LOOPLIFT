import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { actions, ops, useAppData } from '@/data/store';
import { t } from '@/i18n';
import { Button } from '@/ui/button';
import { CardRow } from '@/ui/card-row';
import { confirmDelete } from '@/ui/confirm';
import { HeaderButton } from '@/ui/header-button';
import { LiftArt } from '@/ui/lift-art';
import { SortableList } from '@/ui/sortable-list';
import { Stepper } from '@/ui/stepper';
import { SwipeAction } from '@/ui/swipe-action';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';

// Workout editor (direction S1): name, exercises in order (drag), each with its drawing, muscle
// group and target pill ("4 × 6"); tapping the pill opens its sets and reps steppers. Changes
// save as you go; Done goes back. Swipe a row left to remove it; Delete workout at the bottom.
export default function WorkoutEditor() {
  const c = useColors();
  const d = useAppData();
  const [dragging, setDragging] = useState(false);
  // What the field shows while typing; the store keeps the last non-empty name.
  const [draftName, setDraftName] = useState<string | null>(null);
  // The row whose target steppers are open.
  const [open, setOpen] = useState<number | null>(null);
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = d.workouts.find((w) => w.id === id);

  const header = (
    <Stack.Screen
      options={{
        headerRight: () => (
          <HeaderButton label={t('common.done')} onPress={() => router.back()} testID="editor-done" />
        ),
      }}
    />
  );

  if (!workout) {
    return (
      <View style={[styles.missing, { backgroundColor: c.bg }]}>
        {header}
        <Text style={[styles.body, { color: c.textMuted }]}>{t('editor.missing')}</Text>
      </View>
    );
  }

  const nameOf = (exerciseId: string) => d.exercises.find((e) => e.id === exerciseId)?.name ?? '';
  const groupOf = (exerciseId: string) => {
    const g = d.exercises.find((e) => e.id === exerciseId)?.muscleGroup;
    return g ? t(`muscle.${g}`) : '';
  };

  return (
    <ScrollView
      scrollEnabled={!dragging}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={styles.content}
      testID="workout-editor">
      {header}
      <Text style={[styles.section, { color: c.textMuted }]}>{t('editor.name')}</Text>
      <View style={[styles.field, { backgroundColor: c.bgRaised }]}>
        <TextInput
          value={draftName ?? workout.name}
          onChangeText={(name) => {
            setDraftName(name);
            actions.updateWorkout(workout.id, { name });
          }}
          onEndEditing={() => setDraftName(null)}
          accessibilityLabel={t('editor.name')}
          style={[styles.input, { color: c.text }]}
          returnKeyType="done"
          maxLength={40}
          testID="workout-name"
        />
      </View>

      <Text style={[styles.section, { color: c.textMuted }]}>{t('editor.exercisesTitle')}</Text>
      {workout.exercises.length === 0 ? (
        <Text style={[styles.callout, { color: c.textMuted }]} testID="empty-state">
          {t('editor.empty')}
        </Text>
      ) : (
        <SortableList
          onDragging={setDragging}
          items={workout.exercises}
          keyOf={(e) => e.exerciseId}
          labelOf={(e) => nameOf(e.exerciseId)}
          onMove={(from, to) => actions.updateWorkout(workout.id, { exercises: ops.move(workout.exercises, from, to) })}
          testID="editor-exercises"
          renderItem={(e, i, handle) => {
            const name = nameOf(e.exerciseId);
            const remove = () =>
              actions.updateWorkout(workout.id, { exercises: workout.exercises.filter((_, j) => j !== i) });
            return (
              <ReanimatedSwipeable
                friction={2}
                rightThreshold={size.touch}
                renderRightActions={(progress) => (
                  <SwipeAction
                    progress={progress}
                    rounded
                    label={t('editor.remove')}
                    accessibilityLabel={t('editor.removeA11y', { name })}
                    onPress={remove}
                  />
                )}>
                <View
                  accessibilityActions={[{ name: 'remove', label: t('editor.removeA11y', { name }) }]}
                  onAccessibilityAction={(ev) => ev.nativeEvent.actionName === 'remove' && remove()}>
                  <CardRow
                    title={name}
                    subtitle={groupOf(e.exerciseId)}
                    leading={
                      <View style={styles.leading}>
                        {handle}
                        <View style={[styles.art, { backgroundColor: c.artTint }]}>
                          <LiftArt id={e.exerciseId} color={c.accent} width={size.touch * 0.75} />
                        </View>
                      </View>
                    }
                    trailing={
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('editor.targetA11y', { name, sets: e.targetSets, reps: e.targetReps })}
                        accessibilityState={{ expanded: open === i }}
                        onPress={() => setOpen(open === i ? null : i)}
                        style={({ pressed }) => [styles.target, { backgroundColor: c.accentSoft }, pressed && styles.pressed]}
                        testID={`target-${i}`}>
                        <Text style={[styles.targetText, { color: c.accent }]}>
                          {t('common.setsReps', { sets: e.targetSets, reps: e.targetReps })}
                        </Text>
                      </Pressable>
                    }
                    testID={`editor-row-${i}`}>
                    {open === i ? (
                    <View style={styles.steppers}>
                      <Stepper
                        value={t('editor.sets', { n: e.targetSets })}
                        minusLabel={t('editor.fewerSets')}
                        plusLabel={t('editor.moreSets')}
                        onMinus={() => actions.setTarget(workout.id, i, { targetSets: e.targetSets - 1 })}
                        onPlus={() => actions.setTarget(workout.id, i, { targetSets: e.targetSets + 1 })}
                        testID={`sets-${i}`}
                      />
                      <Stepper
                        value={t('editor.reps', { n: e.targetReps })}
                        minusLabel={t('editor.fewerReps')}
                        plusLabel={t('editor.moreReps')}
                        onMinus={() => actions.setTarget(workout.id, i, { targetReps: e.targetReps - 1 })}
                        onPlus={() => actions.setTarget(workout.id, i, { targetReps: e.targetReps + 1 })}
                        testID={`reps-${i}`}
                      />
                    </View>
                    ) : null}
                  </CardRow>
                </View>
              </ReanimatedSwipeable>
            );
          }}
        />
      )}

      <Button
        label={t('editor.add')}
        variant="dashed"
        icon="plus"
        onPress={() => router.push({ pathname: '/workouts/add', params: { id: workout.id } })}
        testID="add-exercise"
      />
      <Text style={[styles.caption, styles.center, { color: c.textMuted }]}>{t('editor.tapHint')}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('editor.delete')}
        onPress={() =>
          confirmDelete(t('workouts.deleteTitle', { name: workout.name }), t('workouts.deleteBody'), () => {
            actions.deleteWorkout(workout.id);
            router.back();
          })
        }
        style={({ pressed }) => [styles.delete, pressed && styles.pressed]}
        testID="delete-workout">
        <Text style={[styles.headline, { color: c.danger }]}>{t('editor.delete')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.md, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  missing: { flex: 1, padding: space.md },
  field: { borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.ms },
  input: { ...font.titleSmall, minHeight: space.xl, paddingVertical: 0 },
  section: { ...font.section, textTransform: 'uppercase' },
  leading: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  art: { borderRadius: radius.sm, padding: space.xs },
  target: { minWidth: size.touch, minHeight: size.touch, borderRadius: radius.md, paddingHorizontal: space.ms, alignItems: 'center', justifyContent: 'center' },
  targetText: { ...font.headline },
  delete: { minHeight: size.touch, alignItems: 'center', justifyContent: 'center', marginTop: space.lg },
  center: { textAlign: 'center' },
  headline: { ...font.headline },
  pressed: { opacity: 0.7 },
  steppers: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingTop: space.xs },
  body: { ...font.body },
  callout: { ...font.callout },
  caption: { ...font.caption },
});
