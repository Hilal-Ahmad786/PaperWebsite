import { cookies } from 'next/headers';
import { common } from './dict/common';
import { nav } from './dict/nav';
import { login } from './dict/login';
import { dashboard } from './dict/dashboard';
import { leads } from './dict/leads';
import { content } from './dict/content';
import { products } from './dict/products';
import { offers } from './dict/offers';
import { market } from './dict/market';
import { media } from './dict/media';
import { translations } from './dict/translations';
import { seo } from './dict/seo';
import { analytics } from './dict/analytics';
import { clicks } from './dict/clicks';
import { clickprotection } from './dict/clickprotection';
import { users } from './dict/users';
import { roles } from './dict/roles';
import { settings } from './dict/settings';
import { audit } from './dict/audit';

export const ADMIN_LOCALES = ['en', 'tr'] as const;
export type AdminLocale = (typeof ADMIN_LOCALES)[number];
export const ADMIN_LOCALE_COOKIE = 'pmw_admin_locale';
export const DEFAULT_ADMIN_LOCALE: AdminLocale = 'en';

type Dict = { en: Record<string, string>; tr: Record<string, string> };

const MODULES: Dict[] = [
  common,
  nav,
  login,
  dashboard,
  leads,
  content,
  products,
  offers,
  market,
  media,
  translations,
  seo,
  analytics,
  clicks,
  clickprotection,
  users,
  roles,
  settings,
  audit,
];

function merge(locale: AdminLocale): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of MODULES) Object.assign(out, m[locale]);
  return out;
}

const MESSAGES: Record<AdminLocale, Record<string, string>> = {
  en: merge('en'),
  tr: merge('tr'),
};

/** Resolve the current admin UI locale from the cookie (default en). */
export async function getAdminLocale(): Promise<AdminLocale> {
  const jar = await cookies();
  const value = jar.get(ADMIN_LOCALE_COOKIE)?.value;
  return value === 'tr' ? 'tr' : 'en';
}

export type Translator = (key: string, params?: Record<string, string | number>) => string;

/** Build a translator for a locale. Falls back to English, then the key itself. */
export function translator(locale: AdminLocale): Translator {
  const table = MESSAGES[locale] ?? MESSAGES.en;
  return (key, params) => {
    let str = table[key] ?? MESSAGES.en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return str;
  };
}

/** Convenience: resolve locale + translator in one call (for server components). */
export async function getAdminT(): Promise<{ locale: AdminLocale; t: Translator }> {
  const locale = await getAdminLocale();
  return { locale, t: translator(locale) };
}
