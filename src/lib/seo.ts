import type { Metadata } from 'next';
import { locales, defaultLocale, type Locale } from '@/i18n';
import {
  getLocalizedPath,
  getLocalizedProductPath,
  type AppPathname,
} from '@/routing';

// Public site origin used for canonical + hreflang absolute URLs and
// metadataBase. Override via env in production.
// {{TODO: NEXT_PUBLIC_SITE_URL final production domain bestätigen}}
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.papermarketworld.com'
).replace(/\/$/, '');

export const SITE_NAME = 'Paper Market World';

type Alternates = NonNullable<Metadata['alternates']>;

/** hreflang map (+ x-default) and canonical for a static, localized route. */
export function staticAlternates(
  currentLocale: Locale,
  route: AppPathname
): Alternates {
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${SITE_URL}${getLocalizedPath(loc, route)}`;
  }
  languages['x-default'] = `${SITE_URL}${getLocalizedPath(defaultLocale, route)}`;
  return {
    canonical: `${SITE_URL}${getLocalizedPath(currentLocale, route)}`,
    languages,
  };
}

/** hreflang map (+ x-default) and canonical for a product detail page. */
export function productAlternates(
  currentLocale: Locale,
  canonicalSlug: string
): Alternates {
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${SITE_URL}${getLocalizedProductPath(loc, canonicalSlug)}`;
  }
  languages['x-default'] = `${SITE_URL}${getLocalizedProductPath(
    defaultLocale,
    canonicalSlug
  )}`;
  return {
    canonical: `${SITE_URL}${getLocalizedProductPath(
      currentLocale,
      canonicalSlug
    )}`,
    languages,
  };
}

/** Open Graph locale code (e.g. de_DE) from our short locale. */
export function ogLocale(locale: Locale): string {
  const map: Record<Locale, string> = {
    en: 'en_US',
    de: 'de_DE',
    tr: 'tr_TR',
    ar: 'ar_AR',
    it: 'it_IT',
    fr: 'fr_FR',
    es: 'es_ES',
  };
  return map[locale];
}
