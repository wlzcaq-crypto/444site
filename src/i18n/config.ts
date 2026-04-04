export const locales = ['en', 'ru', 'es', 'fr', 'de', 'zh', 'ja', 'pt', 'it', 'ko'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
  pt: 'Português',
  it: 'Italiano',
  ko: '한국어',
};

export const localeFlags: Record<Locale, string> = {
  en: 'GB',
  ru: 'RU',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  zh: 'CN',
  ja: 'JP',
  pt: 'BR',
  it: 'IT',
  ko: 'KR',
};
