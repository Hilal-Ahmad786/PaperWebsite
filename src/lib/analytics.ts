'use client';

// Lightweight dataLayer helpers. Actual GA4 events and Google Ads conversion
// tags are mapped from these dataLayer events inside the GTM container, so they
// inherit Consent Mode v2 gating. Nothing here fires a network request itself.

type DataLayerEvent = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

export function pushToDataLayer(event: DataLayerEvent) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

export interface LeadDetail {
  product?: string;
  huelseType?: string;
  quantity?: string;
}

/** PRIMARY conversion: contact / quote form submitted. */
export function trackContactSubmit(detail: LeadDetail = {}) {
  pushToDataLayer({
    event: 'generate_lead',
    form_name: 'contact_quote',
    product: detail.product || undefined,
    huelse_type: detail.huelseType || undefined,
    quantity: detail.quantity || undefined,
  });
}

export type ContactChannel = 'whatsapp' | 'tel' | 'mailto';

/** SECONDARY conversions: WhatsApp / phone / email click. */
export function trackContactClick(channel: ContactChannel) {
  pushToDataLayer({ event: 'contact_click', contact_channel: channel });
}
