// Design tokens: the only place for colours, spacing, sizes and fonts.
// Values come from the picked direction "C Loop Ring" (docs/design/direction.md, design file
// docs/design/looplift.figcraft). Every text and background pair is contrast-checked in light and
// dark; the table lives in docs/design/direction.md. Recheck before changing a colour.
// Source of truth is this file. The design file mirrors it by hand.
// Screens and components import from here (or from useColors), never hard-code values.

const light = {
  bg: '#FFF8F1',
  bgRaised: '#FFFFFF',
  text: '#2A1B12',
  textMuted: '#6B5547',
  accent: '#6D3FD9',
  onAccent: '#FFFFFF',
  // Accent tint behind secondary buttons, steppers and sets x reps pills.
  accentSoft: '#EFE8FC',
  // Loop ring segments and loop chips: the current slot uses accent, the others these.
  loopPull: '#E4D9FA',
  loopRest: '#F1E6DA',
  // Dashed outline of rest days (non-text, 3:1).
  restOutline: '#9C8573',
  border: '#EFE2D6',
  danger: '#B42318',
  success: '#067647',
} as const;

const dark: Record<keyof typeof light, string> = {
  bg: '#17110D',
  bgRaised: '#241B15',
  text: '#F7EEE6',
  textMuted: '#C2AE9F',
  accent: '#A98BFA',
  onAccent: '#17110D',
  accentSoft: '#2E2445',
  loopPull: '#3B3058',
  loopRest: '#3A2E25',
  restOutline: '#8A7464',
  border: '#3A2E25',
  danger: '#F97066',
  success: '#47CD89',
};

export type ColorName = keyof typeof light;
export const palette = { light, dark } as const;

// 4 pt grid. Side padding of a screen is space.md (16).
// xxs (2) is the one exception: inside pills and between a label and its line under it.
export const space = { xxs: 2, xs: 4, sm: 8, ms: 12, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

// House rule: every tappable is at least 48 x 48 (covers 44 pt iOS and 48 dp Android).
// ring: diameter of the loop ring on Today (the small one in the rotation editor is ringSmall);
// ringStroke and ringStrokeSmall are their arc widths.
export const size = {
  touch: 48,
  maxContent: 640,
  ring: 200,
  ringSmall: 84,
  ringStroke: 22,
  ringStrokeSmall: 10,
  dayBubble: 44,
} as const;

// sm: calendar day cells, md: inputs and grouped lists, lg: cards and list rows, full: pills and buttons.
export const radius = { sm: 12, md: 16, lg: 22, full: 999 } as const;

// Type ramp. Font scaling stays on, so never put fixed heights on text containers.
export const font = {
  hero: { fontSize: 36, lineHeight: 42, fontWeight: '700' },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '700' },
  // Sheet titles (Change-a-day): long dates must fit on a phone.
  titleSmall: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 24 },
  callout: { fontSize: 15, lineHeight: 20 },
  caption: { fontSize: 13, lineHeight: 18 },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '500' },
  // Uppercase section headers ("EXERCISES · DRAG TO REORDER").
  section: { fontSize: 11, lineHeight: 14, fontWeight: '500', letterSpacing: 0.5 },
} as const;
