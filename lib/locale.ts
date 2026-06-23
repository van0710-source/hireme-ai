const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  es: 'es-ES',
  ja: 'ja-JP',
  de: 'de-DE',
  fr: 'fr-FR',
  pt: 'pt-BR',
  ko: 'ko-KR',
};

export function mapSiteLocaleToCreem(siteLocale?: string): string {
  if (!siteLocale) return 'en-US';
  return LOCALE_MAP[siteLocale] ?? 'en-US';
}
