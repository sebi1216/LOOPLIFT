import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './button';

// The native animation runtime does not exist under Jest; here the press animation is a no-op.
jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { createAnimatedComponent: <T,>(component: T) => component },
  useReducedMotion: () => false,
}));

test('Button shows its label and reacts to a tap', async () => {
  const onPress = jest.fn();
  await render(<Button label="Tap me" onPress={onPress} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Tap me' }));
  expect(onPress).toHaveBeenCalledTimes(1);
});
