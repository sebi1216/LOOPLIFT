import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { resolveDay, resolveRange, type Schedule } from '@/data/schedule';
import { actions, ops, useAppData, useToday } from '@/data/store';
import { dayOfMonth, longDate, t } from '@/i18n';
import { Button } from '@/ui/button';
import { CardRow } from '@/ui/card-row';
import { Chip } from '@/ui/chip';
import { DateField } from '@/ui/date-field';
import { DayCell } from '@/ui/day-cell';
import { HeaderButton } from '@/ui/header-button';
import { Icon } from '@/ui/icon';
import { LoopRing } from '@/ui/loop-ring';
import { NumberBubble } from '@/ui/number-bubble';
import { dayVariant, planLabel, slotLabel } from '@/ui/plan-label';
import { SortableList } from '@/ui/sortable-list';
import { font, radius, size, space } from '@/ui/tokens';
import { useColors } from '@/ui/use-colors';

type DraftSlot = { key: string; slot: string };
let keyCount = 0;
const draftSlot = (slot: string): DraftSlot => ({ key: `s${keyCount++}`, slot });

// Rotation editor: the ordered days of the loop (workouts and Rest) and its start date.
// Changes stay a draft until Save. Pushed from Calendar "Edit". Empty: ?state=empty.
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
  const week = resolveRange(draft, today, 7);

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
        <View style={styles.titleRow}>
          <View style={styles.flex}>
            <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
              {t('loop.title')}
            </Text>
            <Text style={[styles.callout, { color: c.textMuted }]}>{slots.length === 0 ? t('loop.subEmpty') : t('loop.sub', { n: slots.length })}</Text>
          </View>
          <LoopRing slots={slots.map((s) => s.slot)} current={current} diameter={size.ringSmall} stroke={size.ringStrokeSmall} />
        </View>

        <View style={[styles.field, { backgroundColor: c.bgRaised }]}>
          <Text style={[styles.body, { color: c.text }]}>{t('loop.startsOn')}</Text>
          <DateField value={startDate} onChange={setStartDate} testID="start-date" />
        </View>

        <Text style={[styles.section, { color: c.textMuted }]}>{t('loop.days').toUpperCase()}</Text>
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
                  subtitle={workout ? t('common.exercises', { n: workout.exercises.length }) : t('loop.recovery')}
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
                      style={styles.iconButton}
                      testID={`remove-slot-${i}`}>
                      <Icon name="remove" size={22} color={c.textMuted} />
                    </Pressable>
                  }
                />
              );
            }}
          />
        )}

        <Button label={t('loop.add')} variant="dashed" icon="plus" onPress={() => setAdding((a) => !a)} testID="add-slot" />
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

        {slots.length > 0 ? (
          <View style={[styles.card, { backgroundColor: c.bgRaised }]}>
            <Text style={[styles.caption, { color: c.textMuted }]}>{t('loop.next7')}</Text>
            <View style={styles.week}>
              {week.map((x) => (
                <DayCell
                  key={x.date}
                  shape="cell"
                  top={dayOfMonth(x.date)}
                  label={planLabel(d, x.plan)}
                  variant={dayVariant(x, today)}
                  rest={x.plan?.kind === 'rest'}
                  accessibilityLabel={t('today.dayA11y', { date: longDate(x.date), plan: planLabel(d, x.plan) || t('today.freeTitle') })}
                />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.md, width: '100%', maxWidth: size.maxContent, alignSelf: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  title: { ...font.title },
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
  section: { ...font.section },
  leading: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  iconButton: { width: size.touch, height: size.touch, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  card: { borderRadius: radius.lg, padding: space.md, gap: space.sm },
  week: { flexDirection: 'row', gap: space.xs },
  flex: { flex: 1 },
  body: { ...font.body },
  callout: { ...font.callout },
  caption: { ...font.caption },
});
