import { MenuView } from '@expo/ui/community/menu';
import type { ReactNode } from 'react';

export type MenuItem = { id: string; title: string; destructive?: boolean };

type Props = {
  items: MenuItem[];
  onSelect: (id: string) => void;
  // The trigger (for example the ••• button). It must carry its own role and label.
  children: ReactNode;
  testID?: string;
};

// The platform's own menu: SwiftUI Menu on iOS, Compose DropdownMenu on Android.
// The web preview uses action-menu.web.tsx, because MenuView actions do not fire on web.
export function ActionMenu({ items, onSelect, children, testID }: Props) {
  return (
    <MenuView
      testID={testID}
      actions={items.map((i) => ({ id: i.id, title: i.title, attributes: { destructive: i.destructive } }))}
      onPressAction={(e) => onSelect(e.nativeEvent.event)}>
      {children}
    </MenuView>
  );
}
