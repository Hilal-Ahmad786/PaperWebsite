import { locales } from '@/i18n';

export const SITE_LOCALES = locales;
export type Localized = Record<string, string>;

/**
 * Read a localized field group out of a FormData object. Inputs are named
 * `<prefix>.<locale>` (e.g. `title.en`, `title.de`). Empty values are dropped.
 */
export function parseLocalized(formData: FormData, prefix: string): Localized {
  const out: Localized = {};
  for (const loc of SITE_LOCALES) {
    const v = String(formData.get(`${prefix}.${loc}`) ?? '').trim();
    if (v) out[loc] = v;
  }
  return out;
}

/** Best display value for a localized map: preferred locale → en → first available. */
export function pickLocalized(value: Localized | null | undefined, preferred = 'en'): string {
  if (!value) return '';
  return value[preferred] ?? value.en ?? Object.values(value)[0] ?? '';
}
