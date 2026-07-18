import Script from 'next/script';

/**
 * Google Consent Mode v2 — default state.
 *
 * Runs BEFORE the cookie banner and GTM (strategy="beforeInteractive") so every
 * Google tag starts with ad/analytics consent DENIED. Our own first-party
 * banner (CookieConsentBanner) flips these to "granted" via
 * gtag('consent','update', …) once the user clicks Accept. Until then, tags run
 * in cookieless "modeling" mode.
 *
 * It also (a) exposes `window.gtag` so client components can call the consent
 * API, and (b) re-applies a previously saved choice from localStorage before
 * GTM loads, so returning visitors who already accepted are tracked from the
 * first pageview without waiting for React to mount the banner.
 *
 * Keep this in sync with the storage key + signals in `src/lib/consent.ts`.
 */
export function ConsentModeDefault() {
  const inline = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = window.gtag || gtag;
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      personalization_storage: 'denied',
      security_storage: 'granted',
      wait_for_update: 500
    });
    gtag('set', 'url_passthrough', true);
    gtag('set', 'ads_data_redaction', true);
    try {
      if (localStorage.getItem('pmw_consent') === 'granted') {
        gtag('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted'
        });
      }
    } catch (e) {}
  `;

  return (
    <Script
      id="consent-mode-default"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: inline }}
    />
  );
}
