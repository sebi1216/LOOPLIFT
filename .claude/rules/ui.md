---
paths:
  - "src/app/**"
  - "src/ui/**"
---

# UI rules (loaded when you work on screens or components)

Why and examples: docs/design/direction.md. These rules win over generic skill advice.

## Layers
- Navigation = platform: native tabs (src/ui/app-tabs.tsx), native stack headers, native sheets, @expo/ui controls. Never build a custom tab bar, header or back button unless direction.md says so.
- Content = brand: colours, type, cards, imagery. No glass effects in content.

## Tokens
- Only values from src/ui/tokens.ts and useColors(). No hex colours, raw font sizes, raw spacing or fixed text heights in screens.
- 4 pt grid, screen side padding 16 (space.md), use gap instead of margins.

## Touch and accessibility
- Every tappable: at least 48 x 48 (size.touch or hitSlop), accessibilityRole and accessibilityLabel.
- Contrast only from checked token pairs: 4.5:1 body text, 3:1 large text and icons, light and dark.
- Status = icon plus label, never colour alone. One accent colour = act or selected.
- Font scaling stays on; layouts must survive 200% text.

## Text
- All user-facing text through src/i18n (EN and DE). German is often about 30% longer (E).
- Short copy. No em dashes.

## Sizes and platforms
- Every screen works on a small phone (375 wide), a large phone, a tablet and web. Wide screens: centred column with size.maxContent.
- Wrap screen content in SafeAreaView (react-native-safe-area-context). The web preview shows insets as 0, so it cannot prove this.
- Icons: SF Symbols on iOS, Material Symbols on Android.
- No .ios.tsx or .android.tsx files unless a real native difference needs one.
- Every state (empty, loading, error, filled) is reachable by URL, for example ?state=empty.
- Respect Reduce Motion; short springs over long animations.
