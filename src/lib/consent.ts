// First-party cookie-consent helpers, integrated with Google Consent Mode v2.
//
// The default (denied) state + `window.gtag` are set up in
// `src/components/analytics/ConsentMode.tsx` (beforeInteractive). These helpers
// let the banner + footer link read/save the visitor's choice and push the
// corresponding `gtag('consent','update', …)` so GTM tags (GA4, Google Ads) can
// start firing after Accept. No GA4/Ads tags are ever hardcoded here — GTM owns
// them. Keep the storage key + signals in sync with ConsentMode.tsx.

export const CONSENT_STORAGE_KEY = 'pmw_consent';

/** Window event the banner listens for so the footer link can re-open it. */
export const OPEN_CONSENT_EVENT = 'pmw:open-consent';

export type ConsentChoice = 'granted' | 'denied';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Call gtag (defined by ConsentMode). Falls back to a dataLayer shim. */
function gtagSafe(...args: unknown[]): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag(...args);
    return;
  }
  // Fallback — ConsentMode normally defines window.gtag before this runs.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args as unknown as Record<string, unknown>);
}

/** Push a Consent Mode v2 update for the ad/analytics signals. */
export function applyConsent(choice: ConsentChoice): void {
  gtagSafe('consent', 'update', {
    analytics_storage: choice,
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
  });
}

/** Read the saved choice, or null if the visitor hasn't chosen yet. */
export function getSavedConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/** Persist the choice + apply it to Consent Mode immediately. */
export function saveConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    /* storage unavailable — consent still applies for this pageview */
  }
  applyConsent(choice);
}

/** Forget the saved choice (used by "Cookie settings"). */
export function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Clear the saved choice and re-open the banner so the visitor can change it. */
export function openCookieSettings(): void {
  clearConsent();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
  }
}
