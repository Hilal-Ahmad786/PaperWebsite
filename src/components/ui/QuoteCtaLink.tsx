'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { trackQuoteCtaClick } from '@/lib/analytics';
import { beaconTrack } from '@/lib/tracking/beacon';

interface QuoteCtaLinkProps {
  href: string;
  /** Where the CTA sits, e.g. 'hero', 'product_hero', 'product_footer_cta'. */
  ctaLocation: string;
  productCategory?: string;
  className?: string;
  children: ReactNode;
}

/**
 * A commercial quote CTA (e.g. "Get a quote", "Request offer"). On click it
 * pushes the diagnostic/remarketing `quote_cta_click` dataLayer event and a
 * first-party `quote_click` beacon. This is NOT a primary conversion — it marks
 * high intent before the form. Use it only for quote/commercial CTAs, never for
 * ordinary navigation links.
 */
export function QuoteCtaLink({ href, ctaLocation, productCategory, className, children }: QuoteCtaLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackQuoteCtaClick({ ctaLocation, productCategory, sourceComponent: 'quote_cta_link' });
        beaconTrack('quote_click', { location: ctaLocation });
      }}
    >
      {children}
    </Link>
  );
}
