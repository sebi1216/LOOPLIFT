import { useColorScheme } from 'react-native';

import { schemeFor, useSettings } from '@/data/settings';

import { palette } from './tokens';

// Colours for the current look: the Appearance setting (System, Light, Dark), where System
// follows the phone. Use this in screens and components.
export function useColors() {
  const { theme } = useSettings();
  return palette[schemeFor(theme, useColorScheme())];
}

// 'light' or 'dark' for the current look, for native controls that take a colour scheme.
export function useScheme() {
  const { theme } = useSettings();
  return schemeFor(theme, useColorScheme());
}
