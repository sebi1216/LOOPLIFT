import { Children, cloneElement, isValidElement, useState, type ReactElement, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '@/i18n';

import { font, radius, size, space } from './tokens';
import { useColors } from './use-colors';

export type MenuItem = { id: string; title: string; destructive?: boolean };

type Props = {
  items: MenuItem[];
  onSelect: (id: string) => void;
  children: ReactNode;
  testID?: string;
};

// Web preview only: @expo/ui's MenuView does not fire actions on web, so this shows a small
// action sheet in a modal. iPhone and Android use the native menu (action-menu.tsx).
export function ActionMenu({ items, onSelect, children, testID }: Props) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  const child = Children.only(children);
  const trigger = isValidElement(child)
    ? cloneElement(child as ReactElement<{ onPress?: () => void }>, { onPress: () => setOpen(true) })
    : child;
  return (
    <View testID={testID}>
      {trigger}
      <Modal transparent visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
          onPress={() => setOpen(false)}
          style={styles.backdrop}>
          <View style={[StyleSheet.absoluteFill, styles.scrim, { backgroundColor: c.text }]} />
          <View accessibilityRole="menu" style={[styles.menu, { backgroundColor: c.bgRaised }]}>
            {[...items, { id: '__cancel', title: t('common.cancel') }].map((i: MenuItem) => (
              <Pressable
                key={i.id}
                accessibilityRole="menuitem"
                accessibilityLabel={i.title}
                onPress={() => {
                  setOpen(false);
                  if (i.id !== '__cancel') onSelect(i.id);
                }}
                style={({ pressed }) => [styles.item, pressed && { backgroundColor: c.accentSoft }]}>
                <Text style={[styles.text, { color: i.destructive ? c.danger : i.id === '__cancel' ? c.accent : c.text }]}>
                  {i.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', padding: space.md },
  scrim: { opacity: 0.3 },
  menu: { width: '100%', maxWidth: size.maxContent, borderRadius: radius.lg, paddingVertical: space.xs },
  item: { minHeight: size.touch, paddingHorizontal: space.md, alignItems: 'center', justifyContent: 'center' },
  text: { ...font.body },
});
