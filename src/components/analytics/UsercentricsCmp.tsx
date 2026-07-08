import Script from 'next/script';

// {{TODO: NEXT_PUBLIC_USERCENTRICS_SETTINGS_ID aus dem Usercentrics-Konto eintragen}}
const UC_SETTINGS_ID = process.env.NEXT_PUBLIC_USERCENTRICS_SETTINGS_ID;

/**
 * Usercentrics Web CMP v3 (certified vendor CMP) + Google Consent Mode v2.
 *
 * IMPORTANT — configure in the Usercentrics admin (not in code):
 *   1. Enable "Google Consent Mode v2" in the CMP settings so Usercentrics
 *      emits gtag('consent','update', …) on Accept / Reject / Save.
 *   2. Map services (GA4, Google Ads) to the correct consent categories.
 *   3. The banner provides Accept / Reject (Deny) / Manage Settings, and
 *      blocks non-essential tags until consent — required for EEA ads.
 *
 * Renders nothing until the settings ID is provided — safe to ship.
 * Load order is guaranteed by <ConsentModeDefault> (beforeInteractive) →
 * this loader → GTM.
 */
export function UsercentricsCmp() {
  if (!UC_SETTINGS_ID) return null;
  return (
    <Script
      id="usercentrics-cmp"
      src="https://web.cmp.usercentrics.eu/ui/loader.js"
      data-settings-id={UC_SETTINGS_ID}
      strategy="afterInteractive"
    />
  );
}
