'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  OPEN_CONSENT_EVENT,
  getSavedConsent,
  saveConsent,
} from '@/lib/consent';

type Copy = { message: string; accept: string; reject: string; privacy: string };

// Small self-contained dictionary so the banner needs no message-file changes.
// EN is the fallback for any locale not listed.
const COPY: Record<string, Copy> = {
  en: {
    message:
      'We use cookies and similar technologies to measure website performance, improve our services and support advertising. You can accept all cookies or reject non-essential cookies.',
    accept: 'Accept all',
    reject: 'Reject non-essential',
    privacy: 'Privacy policy',
  },
  de: {
    message:
      'Wir verwenden Cookies und ähnliche Technologien, um die Leistung der Website zu messen, unsere Dienste zu verbessern und Werbung zu unterstützen. Sie können alle Cookies akzeptieren oder nicht notwendige Cookies ablehnen.',
    accept: 'Alle akzeptieren',
    reject: 'Nicht notwendige ablehnen',
    privacy: 'Datenschutz',
  },
  tr: {
    message:
      'Web sitesi performansını ölçmek, hizmetlerimizi geliştirmek ve reklam çalışmalarını desteklemek için çerezler ve benzer teknolojiler kullanıyoruz. Tüm çerezleri kabul edebilir veya zorunlu olmayan çerezleri reddedebilirsiniz.',
    accept: 'Tümünü kabul et',
    reject: 'Zorunlu olmayanları reddet',
    privacy: 'Gizlilik politikası',
  },
  ar: {
    message:
      'نستخدم ملفات تعريف الارتباط والتقنيات المشابهة لقياس أداء الموقع وتحسين خدماتنا ودعم الإعلانات. يمكنك قبول جميع ملفات تعريف الارتباط أو رفض غير الضرورية منها.',
    accept: 'قبول الكل',
    reject: 'رفض غير الضروري',
    privacy: 'سياسة الخصوصية',
  },
  es: {
    message:
      'Utilizamos cookies y tecnologías similares para medir el rendimiento del sitio web, mejorar nuestros servicios y apoyar la publicidad. Puede aceptar todas las cookies o rechazar las no esenciales.',
    accept: 'Aceptar todo',
    reject: 'Rechazar no esenciales',
    privacy: 'Política de privacidad',
  },
  fr: {
    message:
      'Nous utilisons des cookies et des technologies similaires pour mesurer les performances du site, améliorer nos services et soutenir la publicité. Vous pouvez accepter tous les cookies ou refuser les cookies non essentiels.',
    accept: 'Tout accepter',
    reject: 'Refuser les non essentiels',
    privacy: 'Confidentialité',
  },
  it: {
    message:
      'Utilizziamo cookie e tecnologie simili per misurare le prestazioni del sito, migliorare i nostri servizi e supportare la pubblicità. Puoi accettare tutti i cookie o rifiutare quelli non essenziali.',
    accept: 'Accetta tutti',
    reject: 'Rifiuta non essenziali',
    privacy: 'Privacy',
  },
};

/**
 * First-party cookie-consent banner wired to Google Consent Mode v2.
 *
 * - Shows only when no choice is saved (returning visitors are handled in
 *   ConsentMode before GTM loads, so this never flashes for them).
 * - "Accept all" / "Reject non-essential" push the corresponding
 *   gtag('consent','update', …) and persist the choice.
 * - Re-opens on the `pmw:open-consent` event (footer "Cookie settings" link).
 * - SSR-safe: renders nothing until mounted, so there's no hydration mismatch.
 */
export function CookieConsentBanner() {
  const locale = useLocale();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (getSavedConsent() === null) setVisible(true);

    const reopen = () => setVisible(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  if (!mounted || !visible) return null;

  const copy = COPY[locale] ?? COPY.en;

  const choose = (choice: 'granted' | 'denied') => {
    saveConsent(choice); // persists + pushes gtag consent update
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label={copy.message}
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border-primary bg-background-secondary/98 backdrop-blur-md shadow-[0_-8px_24px_rgba(0,0,0,0.25)]"
    >
      <div className="container mx-auto max-w-screen-2xl px-6 py-4 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-3xl text-sm leading-relaxed text-text-secondary">
            {copy.message}
          </p>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => choose('denied')}
              className="order-2 rounded-sm border border-border-primary px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-brand-primary hover:bg-background-tertiary sm:order-1"
            >
              {copy.reject}
            </button>
            <button
              type="button"
              onClick={() => choose('granted')}
              className="order-1 rounded-sm bg-brand-primary px-5 py-2.5 text-sm font-semibold text-background-primary transition-colors hover:bg-brand-secondary sm:order-2"
            >
              {copy.accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
