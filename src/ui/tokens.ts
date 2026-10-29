// Design tokens: the only place for colours, spacing, sizes and fonts.
// Values come from the picked direction "S1 Loop orbit" in Teal Glow (docs/design/direction.md,
// design file docs/design/looplift.figcraft, frames "Final / ..."). Every text and background pair
// is contrast-checked in light and dark; the table lives in docs/design/direction.md. Recheck
// before changing a colour. Source of truth is this file. The design file mirrors it by hand.
// Screens and components import from here (or from useColors), never hard-code values.

const light = {
  bg: '#F2F5F7',
  bgRaised: '#FFFFFF',
  // Input fields (kg, reps), secondary buttons and search.
  field: '#E8EEF1',
  text: '#0D1B24',
  textMuted: '#51606B',
  accent: '#0B6B5D',
  onAccent: '#FFFFFF',
  // Accent tint behind ticked set rows, hint chips and sets x reps pills.
  accentSoft: '#D6EFEA',
  // Background behind exercise and workout drawings.
  artTint: '#E6F4F1',
  // Loop ring segments and loop chips: the current slot uses accent, the others these.
  loopPull: '#9DC4BE',
  loopRest: '#E8EEF1',
  // Dashed outline of rest days (non-text, 3:1).
  restOutline: '#7C8A94',
  border: '#DCE3E8',
  danger: '#B42318',
  success: '#067647',
  // Hero cards (loop orbit on Today, exercise header, Summary top): a gradient from heroFrom to
  // heroTo with onHero text. Chips on the hero use heroChip (a dark tint keeps white text >= 4.5).
  heroFrom: '#0A5C50',
  heroTo: '#0E7C6B',
  onHero: '#FFFFFF',
  heroChip: '#0000001F',
} as const;

const dark: Record<keyof typeof light, string> = {
  bg: '#0A1215',
  bgRaised: '#131E21',
  field: '#1C2A2E',
  text: '#E9F1F0',
  textMuted: '#9DB0AE',
  accent: '#4FD1B5',
  onAccent: '#0A1215',
  accentSoft: '#12302B',
  artTint: '#12302B',
  loopPull: '#2A5A52',
  loopRest: '#1C2A2E',
  restOutline: '#6B7F84',
  border: '#24343A',
  danger: '#F97066',
  success: '#47CD89',
  heroFrom: '#0A5C50',
  heroTo: '#0E7C6B',
  onHero: '#FFFFFF',
  heroChip: '#0000001F',
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
  // Plot height of the line chart on the exercise screen.
  chart: 160,
} as const;

// sm: inputs and day cells, md: grouped lists and set rows, lg: cards and tiles, xl: hero cards,
// full: pills and buttons.
export const radius = { sm: 12, md: 16, lg: 24, xl: 32, full: 999 } as const;

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
