'use client';

import { useLocale } from 'next-intl';
import { openCookieSettings } from '@/lib/consent';

const LABEL: Record<string, string> = {
  en: 'Cookie settings',
  de: 'Cookie-Einstellungen',
  tr: 'Çerez ayarları',
  ar: 'إعدادات ملفات تعريف الارتباط',
  es: 'Configuración de cookies',
  fr: 'Paramètres des cookies',
  it: 'Impostazioni cookie',
};

/**
 * Footer link that clears the saved consent choice and re-opens the cookie
 * banner so visitors can change their decision at any time.
 */
export function CookieSettingsLink({ className }: { className?: string }) {
  const locale = useLocale();
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      {LABEL[locale] ?? LABEL.en}
    </button>
  );
}
