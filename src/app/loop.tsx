import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { resolveDay, type Schedule } from '@/data/schedule';
import { actions, ops, useAppData, useToday } from '@/data/store';
import { t } from '@/i18n';
import { Button } from '@/ui/button';
import { CardRow } from '@/ui/card-row';
import { Chip } from '@/ui/chip';
import { DateField } from '@/ui/date-field';
import { HeaderButton } from '@/ui/header-button';
import { HeroCard } from '@/ui/hero-card';
import { Icon } from '@/ui/icon';
import { LoopRing } from '@/ui/loop-ring';
import { NumberBubble } from '@/ui/number-bubble';
import { slotLabel } from '@/ui/plan-label';
import { SortableList } from '@/ui/sortable-list';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';

type DraftSlot = { key: string; slot: string };
let keyCount = 0;
const draftSlot = (slot: string): DraftSlot => ({ key: `s${keyCount++}`, slot });

// Rotation editor (direction S1): the loop as a hero ring, its days in order (workouts and Rest)
// and its start date. Changes stay a draft until Save. Pushed from Today (Edit loop, the loop
// card). Empty: ?state=empty.
export default function RotationEditor() {
  const c = useColors();
  const d = useAppData();
  const today = useToday();
  const [startDate, setStartDate] = useState(d.schedule.rotation?.startDate ?? today);
  const [slots, setSlots] = useState<DraftSlot[]>(() => (d.schedule.rotation?.slots ?? []).map(draftSlot));
  const [adding, setAdding] = useState(false);
  const [dragging, setDragging] = useState(false);

  const draft: Schedule = { ...d.schedule, rotation: { startDate, slots: slots.map((s) => s.slot) } };
  const now = resolveDay(draft, today);
  const current = now.source === 'loop' ? (now.slotIndex ?? null) : null;

  const save = () => {
    actions.setRotation({ startDate, slots: slots.map((s) => s.slot) });
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderButton label={t('common.save')} onPress={save} testID="save-loop" />
          ),
        }}
      />
      <ScrollView scrollEnabled={!dragging} style={{ backgroundColor: c.bg }} contentContainerStyle={styles.content} testID="rotation-editor">
        <HeroCard style={styles.hero} testID="loop-hero">
          <View
            accessible
            accessibilityLabel={slots.length === 0 ? t('loop.subEmpty') : `${t('loop.daysCount', { n: slots.length })} ${t('loop.inYourLoop')}`}>
            <LoopRing slots={slots.map((s) => s.slot)} current={current} diameter={size.ringMedium} stroke={size.ringStroke} tone="hero">
              {slots.length === 0 ? (
                <Text style={[styles.headline, styles.center, { color: c.onHero }]}>{t('loop.subEmpty')}</Text>
              ) : (
                <>
                  <Text style={[styles.title, styles.center, { color: c.onHero }]} testID="loop-count">
                    {t('loop.daysCount', { n: slots.length })}
                  </Text>
                  <Text style={[styles.callout, styles.center, { color: c.onHero }]}>{t('loop.inYourLoop')}</Text>
                </>
              )}
            </LoopRing>
          </View>
          {slots.length > 0 ? (
            <Text style={[styles.callout, styles.center, { color: c.onHero }]}>
              {t('loop.order', { names: slots.map((s) => slotLabel(d, s.slot)).join(', ') })}
            </Text>
          ) : null}
        </HeroCard>

        <Text style={[styles.section, { color: c.textMuted }]}>{t('loop.daysInOrder')}</Text>
        {slots.length === 0 ? (
          <Text style={[styles.callout, { color: c.textMuted }]} testID="empty-state">
            {t('loop.empty')}
          </Text>
        ) : (
          <SortableList
          onDragging={setDragging}
            items={slots}
            keyOf={(s) => s.key}
            labelOf={(s) => slotLabel(d, s.slot)}
            onMove={(from, to) => setSlots((list) => ops.move(list, from, to))}
            testID="loop-slots"
            renderItem={(s, i, handle) => {
              const name = slotLabel(d, s.slot);
              const workout = d.workouts.find((w) => w.id === s.slot);
              return (
                <CardRow
                  title={name}
                  subtitle={workout ? t('loop.workoutLifts', { n: workout.exercises.length }) : t('loop.recoveryDay')}
                  leading={
                    <View style={styles.leading}>
                      {handle}
                      <NumberBubble n={i + 1} tone={i === current ? 'accent' : s.slot === 'rest' ? 'rest' : 'soft'} />
                    </View>
                  }
                  trailing={
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('loop.remove', { name })}
                      onPress={() => setSlots((list) => list.filter((x) => x.key !== s.key))}
                      style={({ pressed }) => [styles.iconButton, { backgroundColor: c.field }, pressed && styles.pressed]}
                      testID={`remove-slot-${i}`}>
                      <Icon name="minus" size={20} color={c.text} />
                    </Pressable>
                  }
                />
              );
            }}
          />
        )}

        <Button label={t('loop.addDay')} variant="dashed" icon="plus" onPress={() => setAdding((a) => !a)} testID="add-slot" />
        {adding ? (
          <View style={styles.chips}>
            {[...d.workouts.map((w) => w.id), 'rest'].map((slot) => (
              <Chip
                key={slot}
                label={slotLabel(d, slot)}
                rest={slot === 'rest'}
                accessibilityLabel={t('loop.addThis', { name: slotLabel(d, slot) })}
                onPress={() => setSlots((list) => [...list, draftSlot(slot)])}
                testID={`add-${slot}`}
              />
            ))}
          </View>
        ) : null}

        <Text style={[styles.section, { color: c.textMuted }]}>{t('loop.starts')}</Text>
        <View style={[styles.field, { backgroundColor: c.bgRaised }]}>
          <Text style={[styles.body, { color: c.text }]}>{t('loop.startDate')}</Text>
          <DateField value={startDate} onChange={setStartDate} testID="start-date" />
        </View>
        <Text style={[styles.caption, styles.center, { color: c.textMuted }]}>{t('loop.footer')}</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.md, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  hero: { alignItems: 'center' },
  title: { ...font.title },
  headline: { ...font.headline },
  center: { textAlign: 'center' },
  pressed: { opacity: 0.7 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: space.sm,
    borderRadius: radius.md,
    paddingLeft: space.md,
    paddingRight: space.xs,
    minHeight: size.touch + space.sm,
  },
  section: { ...font.section, textTransform: 'uppercase' },
  leading: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  iconButton: { width: size.touch, height: size.touch, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  flex: { flex: 1 },
  body: { ...font.body },
  callout: { ...font.callout },
  caption: { ...font.caption },
});
