'use client';

/** Shared visitor/session id (same one the click-protection tracker uses). */
export function visitorId(): string | undefined {
  try {
    return sessionStorage.getItem('cp_sid') ?? undefined;
  } catch {
    return undefined;
  }
}

/** CTA events that also count as a conversion (real-lead protection). */
const CONVERSION_EVENTS = new Set(['phone_click', 'whatsapp_click', 'email_click', 'offer_request', 'form_submit']);

/**
 * Fire-and-forget first-party event beacon to the CTA-click counter. Survives
 * navigation (sendBeacon / keepalive). Used for CTA clicks + form submits so the
 * admin "Button clicks" report can count them independent of GTM/GA4. Also
 * notifies the click-protection tracker to mark the visit converted.
 */
export function beaconTrack(event: string, extra: Record<string, unknown> = {}): void {
  if (typeof navigator === 'undefined') return;
  const payload = JSON.stringify({
    event,
    path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    sessionId: visitorId(),
    ...extra,
  });
  try {
    if (navigator.sendBeacon) navigator.sendBeacon('/api/track/click', payload);
    else void fetch('/api/track/click', { method: 'POST', body: payload, keepalive: true });
  } catch {
    /* never block the user action */
  }
  if (CONVERSION_EVENTS.has(event) && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cp:conversion', { detail: { event } }));
  }
}
