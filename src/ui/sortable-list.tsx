import type { ReactNode } from 'react';
import { StyleSheet, View, type AccessibilityActionEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { t } from '@/i18n';

import { Icon } from './icon';
import { size, space } from './tokens';
import { useColors } from './use-colors';

type Props<T> = {
  items: T[];
  keyOf: (item: T) => string;
  labelOf: (item: T) => string;
  // `handle` is the drag handle; put it where the design shows it (left edge of the row).
  renderItem: (item: T, index: number, handle: ReactNode) => ReactNode;
  onMove: (from: number, to: number) => void;
  // Called with true when a drag starts and false when it ends, so the screen can stop scrolling.
  onDragging?: (dragging: boolean) => void;
  testID?: string;
};

const GAP = space.sm;
// Snappy, no bounce (animate-expo spring table: "settle" for drag release).
const SETTLE = { damping: 30, stiffness: 400, mass: 1 };

// Drag-to-reorder list for rows of any height (text can scale). The dragged row follows the
// finger; the others make room. Screen readers get Move up / Move down actions instead.
export function SortableList<T>({ items, keyOf, labelOf, renderItem, onMove, onDragging, testID }: Props<T>) {
  const active = useSharedValue(-1);
  const hover = useSharedValue(-1);
  const dragY = useSharedValue(0);
  const heights = useSharedValue<number[]>([]);

  return (
    <View style={styles.list} testID={testID}>
      {items.map((item, index) => (
        <Row
          key={keyOf(item)}
          index={index}
          count={items.length}
          label={labelOf(item)}
          active={active}
          hover={hover}
          dragY={dragY}
          heights={heights}
          onMove={onMove}
          onDragging={onDragging}
          render={(handle) => renderItem(item, index, handle)}
        />
      ))}
    </View>
  );
}

type RowProps = {
  index: number;
  count: number;
  label: string;
  active: SharedValue<number>;
  hover: SharedValue<number>;
  dragY: SharedValue<number>;
  heights: SharedValue<number[]>;
  onMove: (from: number, to: number) => void;
  onDragging?: (dragging: boolean) => void;
  render: (handle: ReactNode) => ReactNode;
};

function Row({ index, count, label, active, hover, dragY, heights, onMove, onDragging, render }: RowProps) {
  const setDragging = (dragging: boolean) => onDragging?.(dragging);
  const c = useColors();

  const pan = usePanGesture({
    minDistance: 2,
    onActivate: () => {
      'worklet';
      active.set(index);
      hover.set(index);
      dragY.set(0);
      scheduleOnRN(setDragging, true);
    },
    onUpdate: (e) => {
      'worklet';
      dragY.set(e.translationY);
      // Where would the row land? Walk past neighbours while the drag covers half of them.
      const h = heights.get();
      let target = index;
      let moved = e.translationY;
      if (moved > 0) {
        while (target < count - 1 && moved > (h[target + 1] ?? 0) / 2) {
          moved -= (h[target + 1] ?? 0) + GAP;
          target += 1;
        }
      } else {
        while (target > 0 && -moved > (h[target - 1] ?? 0) / 2) {
          moved += (h[target - 1] ?? 0) + GAP;
          target -= 1;
        }
      }
      hover.set(target);
    },
    onDeactivate: () => {
      'worklet';
      const to = hover.get();
      active.set(-1);
      hover.set(-1);
      dragY.set(0);
      scheduleOnRN(setDragging, false);
      if (to !== index && to >= 0) scheduleOnRN(onMove, index, to);
    },
  });

  const style = useAnimatedStyle(() => {
    const a = active.get();
    if (a === index) return { transform: [{ translateY: dragY.get() }], zIndex: 2, opacity: 0.95 };
    const h = (heights.get()[a] ?? 0) + GAP;
    let shift = 0;
    if (a >= 0 && a < index && index <= hover.get()) shift = -h;
    if (a >= 0 && a > index && index >= hover.get()) shift = h;
    return { transform: [{ translateY: withSpring(shift, SETTLE) }], zIndex: 0, opacity: 1 };
  });

  const onAction = (e: AccessibilityActionEvent) => {
    if (e.nativeEvent.actionName === 'moveUp' && index > 0) onMove(index, index - 1);
    if (e.nativeEvent.actionName === 'moveDown' && index < count - 1) onMove(index, index + 1);
  };

  const handle = (
    <GestureDetector gesture={pan}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={t('common.dragHandle', { name: label })}
        accessibilityActions={[
          { name: 'moveUp', label: t('common.moveUp') },
          { name: 'moveDown', label: t('common.moveDown') },
        ]}
        onAccessibilityAction={onAction}
        style={styles.handle}>
        <Icon name="handle" size={18} color={c.textMuted} />
      </View>
    </GestureDetector>
  );

  return (
    <Animated.View
      style={style}
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        const next = [...heights.get()];
        next[index] = h;
        heights.set(next);
      }}>
      {render(handle)}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  list: { gap: GAP },
  handle: { width: size.touch - space.md, minHeight: size.touch, alignItems: 'center', justifyContent: 'center' },
});
