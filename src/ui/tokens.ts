// Design tokens: the only place for colours, spacing, sizes and fonts.
// Starter values: /kickoff or docs/design/direction.md replace them. Check contrast per pair
// (text on bg, textMuted on bg, onAccent on accent) in light and dark before using new colours.
// Source of truth is this file. A design file (if any) mirrors it by hand.
// Screens and components import from here (or from useColors), never hard-code values.

const light = {
  bg: '#FFFFFF',
  bgRaised: '#F3F4F6',
  text: '#111827',
  textMuted: '#4B5563',
  accent: '#1D6FD8',
  onAccent: '#FFFFFF',
  border: '#E5E7EB',
  danger: '#B42318',
  success: '#067647',
} as const;

const dark: Record<keyof typeof light, string> = {
  bg: '#0B0F14',
  bgRaised: '#1A2029',
  text: '#F3F4F6',
  textMuted: '#AAB2BD',
  accent: '#5AA2FF',
  onAccent: '#0B0F14',
  border: '#2A313B',
  danger: '#F97066',
  success: '#47CD89',
};

export type ColorName = keyof typeof light;
export const palette = { light, dark } as const;

// 4 pt grid. Side padding of a screen is space.md (16).
export const space = { xs: 4, sm: 8, ms: 12, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

// House rule: every tappable is at least 48 x 48 (covers 44 pt iOS and 48 dp Android).
export const size = { touch: 48, maxContent: 640 } as const;

export const radius = { sm: 8, md: 12, lg: 16, full: 999 } as const;

// Type ramp. Font scaling stays on, so never put fixed heights on text containers.
export const font = {
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 24 },
  caption: { fontSize: 13, lineHeight: 18 },
} as const;
