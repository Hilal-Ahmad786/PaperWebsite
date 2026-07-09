/** Editable brand & contact settings (plain module, importable by server + client). */
export const BRAND_SETTING_KEYS = [
  { key: 'brand.name', label: 'Brand name' },
  { key: 'brand.tagline', label: 'Tagline' },
  { key: 'contact.email', label: 'Contact email' },
  { key: 'contact.phoneDisplay', label: 'Phone (display)' },
  { key: 'contact.phoneE164', label: 'Phone (E.164)' },
  { key: 'contact.whatsappE164', label: 'WhatsApp (E.164)' },
  { key: 'contact.address', label: 'Address' },
  { key: 'contact.workingHours', label: 'Working hours' },
] as const;

/** Global SEO defaults. */
export const SEO_SETTING_KEYS = [
  { key: 'seo.defaultTitle', label: 'Default meta title' },
  { key: 'seo.defaultDescription', label: 'Default meta description' },
  { key: 'seo.ogImage', label: 'Default OG image URL' },
  { key: 'seo.twitterHandle', label: 'Twitter/X handle' },
  { key: 'seo.gaMeasurementId', label: 'GA4 Measurement ID' },
  { key: 'seo.gtmContainerId', label: 'Google Tag Manager ID' },
  { key: 'seo.robotsDirective', label: 'robots.txt directive' },
] as const;
