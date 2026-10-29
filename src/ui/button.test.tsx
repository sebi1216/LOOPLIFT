import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './button';

test('Button shows its label and reacts to a tap', async () => {
  const onPress = jest.fn();
  await render(<Button label="Tap me" onPress={onPress} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Tap me' }));
  expect(onPress).toHaveBeenCalledTimes(1);
});
