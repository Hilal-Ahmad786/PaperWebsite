// Environment-agnostic tracking helpers (NO 'use client').
//
// Pure types + value mappers that are safe to import from BOTH server and
// client components. Keep anything that touches `window`/`document` out of this
// file — that belongs in `analytics.ts` (client-only). `analytics.ts` re-exports
// everything here so client code can keep importing from '@/lib/analytics'.

/** How a visitor reached out. Kept coarse — never a personal identifier. */
export type ContactMethod = 'whatsapp' | 'phone' | 'email' | 'live_chat' | 'other';

/** Legacy channel prop still used by some components (e.g. Footer links). */
export type ContactChannel = 'whatsapp' | 'tel' | 'mailto';

const CATEGORY_BY_SLUG: Record<string, string> = {
  // Main promoted ads product page.
  'paper-cones-tubes': 'paper_cones_tubes',
};

/** Normalise a product slug into a safe product_category value. */
export function productCategoryFromSlug(slug?: string | null): string {
  if (!slug) return 'general';
  return CATEGORY_BY_SLUG[slug] ?? slug.replace(/-/g, '_');
}

/** Map the legacy `channel` prop to a contact_method value. */
export function contactMethodFromChannel(channel?: ContactChannel): ContactMethod | undefined {
  switch (channel) {
    case 'whatsapp':
      return 'whatsapp';
    case 'tel':
      return 'phone';
    case 'mailto':
      return 'email';
    default:
      return undefined;
  }
}

/** Infer contact_method from an href when no explicit method is provided. */
export function contactMethodFromHref(href: string): ContactMethod {
  const h = href.toLowerCase();
  if (h.includes('wa.me') || h.includes('whatsapp')) return 'whatsapp';
  if (h.startsWith('tel:')) return 'phone';
  if (h.startsWith('mailto:')) return 'email';
  return 'other';
}
