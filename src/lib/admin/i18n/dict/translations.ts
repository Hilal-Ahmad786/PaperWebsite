// Admin i18n dictionary for the "translations" module. Keys are full dotted paths.
export const translations = {
  en: {
    'translations.title': 'Translations',
    'translations.subtitle': 'Localization coverage across the site message catalogs.',
    'translations.catalogsIntro': 'Message catalogs live in ',
    'translations.catalogsMid1': '. English (',
    'translations.catalogsMid2':
      ') is the source of truth; each locale below is compared against its leaf keys.',
    'translations.sourceKeys': 'Source keys (en)',
    'translations.locales': 'Locales',
    'translations.avgCoverage': 'Average coverage',
    'translations.locale': 'Locale',
    'translations.keys': 'Keys',
    'translations.translated': 'Translated',
    'translations.missing': 'Missing',
    'translations.coverage': 'Coverage',
  } as Record<string, string>,
  tr: {
    'translations.title': 'Çeviriler',
    'translations.subtitle': 'Site mesaj kataloglarındaki yerelleştirme kapsamı.',
    'translations.catalogsIntro': 'Mesaj katalogları şurada bulunur: ',
    'translations.catalogsMid1': '. İngilizce (',
    'translations.catalogsMid2':
      ') kaynak referanstır; aşağıdaki her dil, bu kataloğun anahtarlarıyla karşılaştırılır.',
    'translations.sourceKeys': 'Kaynak anahtarlar (en)',
    'translations.locales': 'Diller',
    'translations.avgCoverage': 'Ortalama kapsam',
    'translations.locale': 'Dil',
    'translations.keys': 'Anahtarlar',
    'translations.translated': 'Çevrildi',
    'translations.missing': 'Eksik',
    'translations.coverage': 'Kapsam',
  } as Record<string, string>,
};
