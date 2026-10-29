import { DateTimePicker } from '@expo/ui/community/datetime-picker';

import { getLocale } from '@/i18n';
import { toIsoDate } from '@/data/schedule';

import { useColors } from './use-colors';

type Props = { value: string; onChange: (iso: string) => void; testID?: string };

// The platform's own date picker (compact on iOS). The web preview uses date-field.web.tsx,
// because @expo/ui's picker renders nothing on web.
// The picker takes no accessibility label: put a visible label Text right before it, which
// VoiceOver reads first ("Starts on", then the date).
export function DateField({ value, onChange, testID }: Props) {
  const c = useColors();
  const [y, m, d] = value.split('-').map(Number);
  return (
    <DateTimePicker
      testID={testID}
      value={new Date(y, m - 1, d)}
      mode="date"
      display="compact"
      accentColor={c.accent}
      locale={getLocale() === 'de' ? 'de_DE' : 'en_GB'}
      onValueChange={(_, date) => onChange(toIsoDate(date))}
    />
  );
}
