import type { ComponentProps } from 'react';
import type { Stack } from 'expo-router';

import { useColors } from './use-colors';

type Options = Exclude<NonNullable<ComponentProps<typeof Stack>['screenOptions']>, (...args: never[]) => unknown>;

// Native stack headers in our colours: cream background, accent for back and header buttons.
// The header itself stays the platform's (large titles on iOS).
export function useStackOptions(): Options {
  const c = useColors();
  return {
    headerTintColor: c.accent,
    headerStyle: { backgroundColor: c.bg },
    headerTitleStyle: { color: c.text },
    headerLargeTitleStyle: { color: c.text },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: c.bg },
  };
}

export const sheetOptions: Options = {
  presentation: 'formSheet',
  sheetGrabberVisible: true,
  sheetAllowedDetents: [0.75, 1],
  headerShown: false,
};
