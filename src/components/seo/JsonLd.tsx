import { SITE_NAME, SITE_URL } from '@/lib/seo';

// Domain contact email — keep in sync with footer / contact route.
// {{TODO: Domain-E-Mail bestätigen (info@papermarketworld.com)}}
const CONTACT_EMAIL = 'info@papermarketworld.com';

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD is static, server-rendered content (no user input) — safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Sitewide Organization schema (name, logo, address, contactPoint). */
export function OrganizationJsonLd() {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo.png`,
        email: CONTACT_EMAIL,
        // {{TODO: Anschrift Wien für Schema bestätigen}}
        address: {
          '@type': 'PostalAddress',
          streetAddress: '{{TODO: Straße + Nr.}}',
          postalCode: '{{TODO: PLZ}}',
          addressLocality: 'Wien',
          addressCountry: 'AT',
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'sales',
            email: CONTACT_EMAIL,
            telephone: '+436602492186',
            areaServed: ['AT', 'DE', 'EU', 'TR'],
            availableLanguage: ['de', 'en', 'tr', 'ar', 'it', 'fr', 'es'],
          },
        ],
      }}
    />
  );
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  image: string; // absolute or root-relative
  url: string; // absolute canonical URL
  category?: string;
}

/** Product schema for the paper cones landing page. */
export function ProductJsonLd({
  name,
  description,
  image,
  url,
  category,
}: ProductJsonLdProps) {
  const absImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description,
        image: absImage,
        category,
        brand: { '@type': 'Brand', name: SITE_NAME },
        url,
        offers: {
          '@type': 'AggregateOffer',
          availability: 'https://schema.org/InStock',
          priceCurrency: 'EUR',
          seller: { '@type': 'Organization', name: SITE_NAME },
        },
      }}
    />
  );
}
