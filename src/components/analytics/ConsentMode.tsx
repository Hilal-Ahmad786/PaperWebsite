import Script from 'next/script';

/**
 * Google Consent Mode v2 — default state.
 *
 * Runs BEFORE the CMP and GTM (strategy="beforeInteractive") so that every
 * Google tag starts with consent DENIED in the EEA. The vendor CMP
 * (Usercentrics) flips these to "granted" via gtag('consent','update', …)
 * once the user accepts. Until then, tags run in cookieless "modeling" mode.
 *
 * Covers all v2 signals: ad_storage, ad_user_data, ad_personalization,
 * analytics_storage (+ functionality/personalization/security).
 */
export function ConsentModeDefault() {
  const inline = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted',
      wait_for_update: 500
    });
    gtag('set', 'url_passthrough', true);
    gtag('set', 'ads_data_redaction', true);
  `;

  return (
    <Script
      id="consent-mode-default"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: inline }}
    />
  );
}
