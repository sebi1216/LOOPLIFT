// All user-facing text lives here, in English and German. Screens call t('key').
// German is often about 30% longer (E): check each new screen once in German.
const en = {
  'home.title': 'Home',
  'home.hello': 'Hello! This is the first screen.',
  'home.button': 'Tap me',
  'home.taps': 'Taps: {count}',
  'home.listTitle': 'Demo items',
  'home.empty': 'Nothing here yet.',
  'profile.title': 'Profile',
  'profile.empty': 'Your profile will live here.',
} as const;

export type StringKey = keyof typeof en;

const de: Record<StringKey, string> = {
  'home.title': 'Start',
  'home.hello': 'Hallo! Das ist der erste Screen.',
  'home.button': 'Tipp mich an',
  'home.taps': 'Angetippt: {count}',
  'home.listTitle': 'Demo-Einträge',
  'home.empty': 'Hier ist noch nichts.',
  'profile.title': 'Profil',
  'profile.empty': 'Hier entsteht dein Profil.',
};

const tables = { en, de } as const;
export type Locale = keyof typeof tables;

// Device language: German if it starts with "de", otherwise English.
function deviceLocale(): Locale {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase().startsWith('de') ? 'de' : 'en';
  } catch {
    return 'en';
  }
}

let current: Locale = deviceLocale();

export function setLocale(locale: Locale) {
  current = locale;
}

export function t(key: StringKey, vars: Record<string, string | number> = {}, locale: Locale = current): string {
  const template: string = tables[locale][key] ?? en[key];
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}
