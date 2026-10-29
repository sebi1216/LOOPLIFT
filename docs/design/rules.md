# Design rules

Read before any UI work. On a conflict between skills (`animate-expo`, `hig-*`, `expo-*`, `/designs`, `/build-screen`), this file wins. `CLAUDE.md` still wins over this file. The picked look (tokens, feel) lives in `docs/design/direction.md`.

## 1. Native components first
- Navigation: Expo Router native stack (`Stack`), with the platform's default transitions. Never rebuild a screen transition in JS.
- Tabs: `NativeTabs` from Expo Router (check the SDK 58 docs for the import path). Tab switches never animate.
- Sheets: a sheet that is its own screen is a route with `presentation: 'formSheet'` (detents and grabber from the platform).
- Controls: `@expo/ui` (SwiftUI on iOS, Jetpack Compose on Android) for pickers, toggles, sliders, steppers, segmented controls, menus and context menus.
- Icons: SF Symbols on iOS via `expo-symbols`, Material Symbols on Android.
- Custom components only for content (loop ring, day cards), never for chrome. If a native one exists, use it and say why if you don't.

## 2. Type
- System font (San Francisco on iOS, Roboto on Android) unless `/designs` picks a brand font and logs it in `direction.md`.
- Sizes come from `src/ui/tokens.ts`. Text scales with the user's font size: never fix a height that holds text.
- Allow for German: labels run about 30% longer than English. Check DE before calling a screen done.

## 3. Apple HIG wins on iOS conventions
- On iOS, the `hig-*` skills decide navigation, modality, control choice, alerts, sheets and wording of buttons ("Delete", not "OK").
- On Android, follow the platform's own (Material) conventions that the native components bring; the HIG does not apply there.
- The HIG skills write SwiftUI or UIKit examples. Translate them to Expo Router, `@expo/ui` and React Native; never add Swift code.
- They look for `.claude/apple-design-context.md`. It does not exist; the context is in `docs/brief.md` and `docs/design/direction.md`.
- Prefer undo over "Are you sure?". Use an alert only for destructive actions that cannot be undone.

## 4. Motion follows `animate-expo`
- Run its gate first: frequent actions (tabs, toggles, scrolling) get no animation.
- Reanimated 4 and Gesture Handler are installed. Use spring and easing values from its tables only; never use `ease-in` or `scale(0)`.
- Reduced motion ships with every animation.
- Haptics need `expo-haptics`, which is not installed yet. The same goes for `react-native-keyboard-controller`, Lottie and Skia: the skill's `npx expo install` lines never run without Sebastian's OK (CLAUDE.md rule 3).
- Feel is judged on the iPhone. Expo Go shows whether it works; a dev build shows whether it feels right.

## 5. Always (from CLAUDE.md, repeated so no skill overrides it)
- Tokens only, no raw colours or sizes in screens.
- Tap targets at least 48 x 48 (wins over the 44 pt in HIG and `animate-expo`; use `hitSlop` if the visual is smaller), each with a role and label.
- Every state has a URL (`?state=empty`).
- Platform owns navigation, brand owns content.
