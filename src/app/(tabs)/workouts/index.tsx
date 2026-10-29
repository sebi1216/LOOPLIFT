import { router, Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { resolveDay } from '@/data/schedule';
import { actions, useAppData, useToday } from '@/data/store';
import { t } from '@/i18n';
import { ActionMenu } from '@/ui/action-menu';
import { Button } from '@/ui/button';
import { CardRow } from '@/ui/card-row';
import { confirmDelete } from '@/ui/confirm';
import { HeaderButton } from '@/ui/header-button';
import { Icon } from '@/ui/icon';
import { NumberBubble } from '@/ui/number-bubble';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';

// Workouts: the templates with exercise count and where they sit in the loop.
// Tap to edit, ••• to duplicate or delete, + for a new one. Empty: ?state=empty.
export default function Workouts() {
  const c = useColors();
  const d = useAppData();
  const today = useToday();
  const slots = d.schedule.rotation?.slots ?? [];
  const now = resolveDay(d.schedule, today);
  const todayWorkout = now.plan?.kind === 'workout' ? now.plan.workoutId : null;

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
            {d.workouts.map((w, i) => {
              const sets = w.exercises.reduce((n, e) => n + e.targetSets, 0);
              const loopDay = slots.indexOf(w.id);
              return (
                <CardRow
                  key={w.id}
                  title={w.name}
                  onPress={() => router.push({ pathname: '/workouts/[id]', params: { id: w.id } })}
                  testID={`workout-${w.id}`}
                  leading={<NumberBubble n={i + 1} tone={w.id === todayWorkout ? 'accent' : 'soft'} />}
                  subtitle={
                    <View style={styles.sub}>
                      <Text style={[styles.caption, { color: c.textMuted }]}>
                        {t('workouts.meta', { n: w.exercises.length, sets })}
                      </Text>
                      <View style={styles.loopLine}>
                        <Icon name="loop" size={11} color={loopDay >= 0 ? c.accent : c.textMuted} />
                        <Text style={[styles.caption, { color: loopDay >= 0 ? c.accent : c.textMuted }]}>
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
          <Text style={[styles.caption, { color: c.textMuted }]}>{t('workouts.hint')}</Text>
        ) : null}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.md, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  list: { gap: space.sm },
  card: { borderRadius: radius.lg, padding: space.md, gap: space.ms },
  sub: { gap: space.xxs },
  loopLine: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  more: { width: size.touch, height: size.touch, alignItems: 'center', justifyContent: 'center' },
  headline: { ...font.headline },
  callout: { ...font.callout },
  caption: { ...font.caption },
});
