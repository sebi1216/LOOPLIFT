import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { View } from 'react-native';

import { getLocale } from '@/i18n';
import { toIsoDate } from '@/data/schedule';

import { useColors } from './use-colors';

type Props = { value: string; onChange: (iso: string) => void; accessibilityLabel: string; testID?: string };

// The platform's own date picker (compact on iOS). The web preview uses date-field.web.tsx,
// because @expo/ui's picker renders nothing on web.
export function DateField({ value, onChange, accessibilityLabel, testID }: Props) {
  const c = useColors();
  const [y, m, d] = value.split('-').map(Number);
  return (
    <View accessibilityLabel={accessibilityLabel}>
      <DateTimePicker
      testID={testID}
      value={new Date(y, m - 1, d)}
      mode="date"
      display="compact"
      accentColor={c.accent}
      locale={getLocale() === 'de' ? 'de_DE' : 'en_GB'}
      onValueChange={(_, date) => onChange(toIsoDate(date))}
      />
    </View>
  );
}
