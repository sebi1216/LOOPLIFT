import { useState } from 'react';
import { Pressable, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { motion } from './tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle> };

// A tappable that gives way under the finger: feedback on press-in, a CSS transition on the UI
// thread, so the label and icons move with it. Reduce Motion: a plain opacity change instead.
export function PressScale({ style, onPressIn, onPressOut, ...rest }: Props) {
  const reduced = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const feedback: ViewStyle = reduced
    ? { opacity: pressed ? 0.7 : 1 }
    : { transform: [{ scale: pressed ? motion.pressScale : 1 }] };
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e: GestureResponderEvent) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={[style, feedback, { transitionProperty: reduced ? 'opacity' : 'transform', transitionDuration: motion.press }]}
    />
  );
}
