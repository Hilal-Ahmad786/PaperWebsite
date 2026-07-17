'use client';

// ---------------------------------------------------------------------------
// Privacy-safe dataLayer helpers (GTM-centric tracking).
//
// These helpers ONLY push clean, semantic events into `window.dataLayer`.
// They never fire a network request themselves, and they never hardcode GA4,
// Google Ads, conversion IDs/labels or gtag snippets. All GA4 tags, Google Ads
// conversion tags, remarketing tags, enhanced conversions and the conversion
// linker are configured LATER inside the GTM container — GTM decides what to do
// with each event pushed here, so everything inherits Consent Mode v2 gating.
//
// PRIVACY RULE: never push personal data (email, phone, name, message body,
// company details, raw file name/content, IP or device fingerprint) into the
// dataLayer. Only the safe, structured parameters below are allowed. The
// separate first-party tracking system (lib/tracking/beacon.ts) keeps its own
// internal identifiers server-side and is unaffected by this file.
// ---------------------------------------------------------------------------

type Primitive = string | number | boolean | null | undefined;

/** A single, already-normalised dataLayer push (snake_case keys). */
export type DataLayerEvent = Record<string, Primitive>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const isDev = process.env.NODE_ENV !== 'production';

/** Browser-derived, non-sensitive page context. Empty on the server. */
function browserContext(): DataLayerEvent {
  if (typeof window === 'undefined') return {};
  return {
    page_path: window.location.pathname,
    page_url: window.location.href,
    page_language: document.documentElement.lang || undefined,
  };
}

/** ISO timestamp; guarded so it can never throw during a push. */
function nowIso(): string | undefined {
  try {
    return new Date().toISOString();
  } catch {
    return undefined;
  }
}

/** Drop undefined / null / empty values so pushes stay clean and consistent. */
function clean(obj: DataLayerEvent): DataLayerEvent {
  const out: DataLayerEvent = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === '') continue;
    out[key] = value;
  }
  return out;
}

/**
 * Base utility. Safe on the server (no-op), safe when GTM is missing (the push
 * just sits in the array until/if GTM loads). Auto-enriches with page context +
 * timestamp; explicit event keys always win over the auto-derived ones.
 */
export function pushToDataLayer(event: DataLayerEvent): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  const payload = clean({ timestamp: nowIso(), ...browserContext(), ...event });
  window.dataLayer.push(payload);
  if (isDev) {
    // Dev-only visibility. Helpers never receive personal data, so this is safe.
    // eslint-disable-next-line no-console
    console.debug('[dataLayer]', payload.event, payload);
  }
}

// Shared, environment-agnostic types + mappers. Re-exported so existing client
// code can keep importing them from '@/lib/analytics'. Server components must
// import these from '@/lib/analytics.shared' instead (this file is client-only).
export {
  productCategoryFromSlug,
  contactMethodFromChannel,
  contactMethodFromHref,
  type ContactMethod,
  type ContactChannel,
} from '@/lib/analytics.shared';

import type { ContactMethod } from '@/lib/analytics.shared';

// ---------------------------------------------------------------------------
// Event helpers
// ---------------------------------------------------------------------------

export interface ContactSubmitParams {
  formName?: string;
  leadType?: string;
  productCategory?: string;
  productSelected?: string;
  pageLanguage?: string;
  countrySelected?: string;
  quantityRange?: string;
  pagePath?: string;
  businessContext?: string;
  sourceComponent?: string;
}

/**
 * PRIMARY conversion — quote/contact form submitted successfully.
 * dataLayer event: `generate_lead`. Fire ONLY after a successful API response.
 */
export function trackContactSubmit(params: ContactSubmitParams = {}): void {
  pushToDataLayer({
    event: 'generate_lead',
    form_name: params.formName ?? 'quote_form',
    lead_type: params.leadType ?? 'quote_request',
    product_category: params.productCategory ?? 'general',
    product_selected: params.productSelected,
    page_language: params.pageLanguage,
    country_selected: params.countrySelected,
    quantity_range: params.quantityRange,
    page_path: params.pagePath,
    business_context: params.businessContext ?? 'b2b',
    source_component: params.sourceComponent ?? 'contact_form',
  });
}

export interface ContactClickParams {
  contactMethod: ContactMethod;
  clickLocation?: string;
  productCategory?: string;
  pageLanguage?: string;
  pagePath?: string;
  sourceComponent?: string;
}

/**
 * SECONDARY conversion — WhatsApp / phone / email / live-chat click.
 * dataLayer event: `contact_click`. Always carries `contact_method`.
 */
export function trackContactClick(params: ContactClickParams): void {
  pushToDataLayer({
    event: 'contact_click',
    contact_method: params.contactMethod,
    click_location: params.clickLocation,
    product_category: params.productCategory,
    page_language: params.pageLanguage,
    page_path: params.pagePath,
    source_component: params.sourceComponent ?? 'tracked_contact_link',
  });
}

export interface QuoteCtaClickParams {
  ctaLocation?: string;
  productCategory?: string;
  pageLanguage?: string;
  pagePath?: string;
  sourceComponent?: string;
}

/**
 * DIAGNOSTIC / remarketing — a high-intent quote CTA was clicked (before the
 * form). dataLayer event: `quote_cta_click`. NOT a primary conversion; use for
 * funnel analysis and remarketing audiences only.
 */
export function trackQuoteCtaClick(params: QuoteCtaClickParams = {}): void {
  pushToDataLayer({
    event: 'quote_cta_click',
    cta_location: params.ctaLocation,
    product_category: params.productCategory,
    page_language: params.pageLanguage,
    page_path: params.pagePath,
    source_component: params.sourceComponent ?? 'quote_cta_link',
  });
}

export interface FormStartParams {
  formName?: string;
  productCategory?: string;
  pageLanguage?: string;
  pagePath?: string;
  sourceComponent?: string;
}

/**
 * DIAGNOSTIC — the user first interacted with the quote/contact form.
 * dataLayer event: `form_start`. Fire ONCE per form instance/page view (guard
 * with a ref in the component), never on every keystroke.
 */
export function trackFormStart(params: FormStartParams = {}): void {
  pushToDataLayer({
    event: 'form_start',
    form_name: params.formName ?? 'quote_form',
    product_category: params.productCategory,
    page_language: params.pageLanguage,
    page_path: params.pagePath,
    source_component: params.sourceComponent ?? 'contact_form',
  });
}

export interface SpecUploadParams {
  formName?: string;
  productCategory?: string;
  /** Safe file extension/type only, e.g. 'pdf' | 'jpg' | 'png' | 'docx' | 'unknown'. */
  fileType?: string;
  uploadContext?: string;
  pageLanguage?: string;
  pagePath?: string;
  sourceComponent?: string;
}

/**
 * HIGH-INTENT secondary — a technical drawing / spec / photo was attached.
 * dataLayer event: `spec_upload`. NEVER pass the raw file name or content —
 * only a safe `file_type` (extension) and coarse `upload_context`.
 */
export function trackSpecUpload(params: SpecUploadParams = {}): void {
  pushToDataLayer({
    event: 'spec_upload',
    form_name: params.formName ?? 'quote_form',
    product_category: params.productCategory,
    file_type: params.fileType ?? 'unknown',
    upload_context: params.uploadContext,
    page_language: params.pageLanguage,
    page_path: params.pagePath,
    source_component: params.sourceComponent ?? 'contact_form',
  });
}

export interface LeadThankYouViewParams {
  formName?: string;
  leadType?: string;
  productCategory?: string;
  pageLanguage?: string;
  pagePath?: string;
  sourceComponent?: string;
}

/**
 * BACKUP / diagnostic — the /thank-you page was viewed.
 * dataLayer event: `lead_thank_you_view`. Do NOT use as the primary Google Ads
 * conversion when `generate_lead` is reliable, or submissions double-count.
 * This helper never re-fires `generate_lead`.
 */
export function trackLeadThankYouView(params: LeadThankYouViewParams = {}): void {
  pushToDataLayer({
    event: 'lead_thank_you_view',
    form_name: params.formName ?? 'quote_form',
    lead_type: params.leadType ?? 'quote_request',
    product_category: params.productCategory,
    page_language: params.pageLanguage,
    page_path: params.pagePath,
    source_component: params.sourceComponent ?? 'thank_you_page',
  });
}
