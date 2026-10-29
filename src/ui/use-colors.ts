import { useColorScheme } from 'react-native';

import { palette } from './tokens';

// Colours for the current light or dark mode. Use this in screens and components.
export function useColors() {
  return useColorScheme() === 'dark' ? palette.dark : palette.light;
}
