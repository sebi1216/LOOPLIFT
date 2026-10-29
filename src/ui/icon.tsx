import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';

// Content icons: SF Symbols on iOS, Material Symbols on Android and web (rules.md 1).
// Icons are decoration next to a text label; the tappable around them carries the label.
const names = {
  plus: { ios: 'plus', android: 'add', web: 'add' },
  minus: { ios: 'minus', android: 'remove', web: 'remove' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  chevronLeft: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  handle: { ios: 'line.3.horizontal', android: 'drag_handle', web: 'drag_handle' },
  pin: { ios: 'pin.fill', android: 'keep', web: 'keep' },
  arrow: { ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' },
  more: { ios: 'ellipsis', android: 'more_horiz', web: 'more_horiz' },
  remove: { ios: 'minus.circle', android: 'do_not_disturb_on', web: 'do_not_disturb_on' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  loop: { ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
} as const satisfies Record<string, ComponentProps<typeof SymbolView>['name']>;

export type IconName = keyof typeof names;

export function Icon({ name, size, color }: { name: IconName; size: number; color: string }) {
  return (
    <SymbolView
      name={names[name]}
      size={size}
      tintColor={color}
      accessible={false}
      importantForAccessibility="no"
      aria-hidden
    />
  );
}
