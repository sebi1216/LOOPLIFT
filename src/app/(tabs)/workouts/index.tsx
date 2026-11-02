import { router, Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { actions, useAppData } from '@/data/store';
import { t } from '@/i18n';
import { ActionMenu } from '@/ui/action-menu';
import { Button } from '@/ui/button';
import { CardRow } from '@/ui/card-row';
import { confirmDelete } from '@/ui/confirm';
import { HeaderButton } from '@/ui/header-button';
import { Icon } from '@/ui/icon';
import { LiftArt, workoutArtId } from '@/ui/lift-art';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';

// Workouts (direction S1): the templates, each with its own drawing (decision #14), exercise
// count and where it sits in the loop. Tap to edit, ••• to duplicate or delete, + or New workout
// for a new one. Empty: ?state=empty.
export default function Workouts() {
  const c = useColors();
  const d = useAppData();
  const slots = d.schedule.rotation?.slots ?? [];

  const create = () => {
    const id = actions.addWorkout(t('workouts.newName'));
    if (id) router.push({ pathname: '/workouts/[id]', params: { id } });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderButton label={t('workouts.add')} icon="plus" onPress={create} testID="add-workout" />
          ),
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: c.bg }}
        contentContainerStyle={styles.content}>
        {d.workouts.length === 0 ? (
          <View style={[styles.card, { backgroundColor: c.bgRaised }]} testID="empty-state">
            <Text style={[styles.headline, { color: c.text }]}>{t('workouts.empty')}</Text>
            <Text style={[styles.callout, { color: c.textMuted }]}>{t('workouts.emptyBody')}</Text>
            <Button label={t('today.ctaWorkout')} onPress={create} testID="empty-cta" />
          </View>
        ) : (
          <View style={styles.list} testID="workout-list">
            {d.workouts.map((w) => {
              const sets = w.exercises.reduce((n, e) => n + e.targetSets, 0);
              const loopDay = slots.indexOf(w.id);
              return (
                <CardRow
                  key={w.id}
                  title={w.name}
                  onPress={() => router.push({ pathname: '/workouts/[id]', params: { id: w.id } })}
                  testID={`workout-${w.id}`}
                  leading={
                    <View style={[styles.art, { backgroundColor: c.artTint }]}>
                      <LiftArt id={workoutArtId(w)} color={c.accent} width={size.touch * 1.5} />
                    </View>
                  }
                  subtitle={
                    <View style={styles.sub}>
                      <Text style={[styles.callout, { color: c.textMuted }]}>
                        {t('workouts.meta', { n: w.exercises.length, sets })}
                      </Text>
                      <View style={[styles.pill, { backgroundColor: loopDay >= 0 ? c.accentSoft : c.field }]}>
                        <Text style={[styles.pillText, { color: loopDay >= 0 ? c.accent : c.textMuted }]}>
                          {loopDay >= 0 ? t('workouts.loopDay', { n: loopDay + 1 }) : t('workouts.notInLoop')}
                        </Text>
                      </View>
                    </View>
                  }
                  trailing={
                    <ActionMenu
                      testID={`menu-${w.id}`}
                      items={[
                        { id: 'duplicate', title: t('workouts.duplicate') },
                        { id: 'delete', title: t('common.delete'), destructive: true },
                      ]}
                      onSelect={(id) => {
                        if (id === 'duplicate') actions.duplicateWorkout(w.id, t('workouts.copyName', { name: w.name }));
                        if (id === 'delete')
                          confirmDelete(t('workouts.deleteTitle', { name: w.name }), t('workouts.deleteBody'), () =>
                            actions.deleteWorkout(w.id),
                          );
                      }}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('workouts.more', { name: w.name })}
                        style={styles.more}
                        testID={`more-${w.id}`}>
                        <Icon name="more" size={24} color={c.textMuted} />
                      </Pressable>
                    </ActionMenu>
                  }
                />
              );
            })}
          </View>
        )}
        {d.workouts.length > 0 ? (
          <>
            <Button label={t('workouts.add')} variant="dashed" icon="plus" onPress={create} testID="new-workout" />
            <Text style={[styles.caption, styles.center, { color: c.textMuted }]}>{t('workouts.hint')}</Text>
          </>
        ) : null}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.md, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  list: { gap: space.sm },
  card: { borderRadius: radius.lg, padding: space.md, gap: space.ms },
  sub: { gap: space.xs, alignItems: 'flex-start' },
  art: { borderRadius: radius.lg, padding: space.sm },
  pill: { borderRadius: radius.full, paddingHorizontal: space.sm, paddingVertical: space.xxs },
  pillText: { ...font.caption, fontWeight: '600' },
  center: { textAlign: 'center' },
  more: { width: size.touch, height: size.touch, alignItems: 'center', justifyContent: 'center' },
  headline: { ...font.headline },
  callout: { ...font.callout },
  caption: { ...font.caption },
});
