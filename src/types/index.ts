// Product Types
export type ProductSlug =
  | 'duplex-board'
  | 'testliner-fluting'
  | 'kraftliner-white-top'
  | 'triplex-board'
  | 'paper-cones-tubes';

export type ProductCategory = 'board' | 'containerboard' | 'converted';

export interface SpecItem {
  labelKey: string;
  value: string;
  valueKey?: string;
}

export interface ProductImage {
  src: string;
  altKey: string;
  captionKey?: string;
}

// Optional rich "landing page" content used for SEM/Ads landing pages
// (currently the paper cones / Hülsen page). Each field is gated by
// presence in the product page renderer, so non-landing products are
// unaffected and the existing design is preserved.
export interface HuelseType {
  nameKey: string;
  descKey: string;
}

export interface ProductComparison {
  introKey: string;
  pointKeys: string[];
  sustainabilityHeadingKey: string;
  sustainabilityBodyKey: string;
  sustainabilityLinkLabelKey: string;
}

export interface Product {
  slug: ProductSlug;
  i18nKey: string; // e.g., "products.duplexBoard"
  category: ProductCategory;
  specTable: SpecItem[];
  applications: string[]; // translation keys
  origins: string[]; // e.g., ["Turkey", "EU", "India", "China"]
  typicalIndustries: string[]; // translation keys
  heroImage?: ProductImage;
  images?: ProductImage[];
  // --- Optional landing-page content (Ads target pages) ---
  subtitleKey?: string; // hero subline under the H1
  specsHeadingKey?: string; // override for the specs H2
  applicationsHeadingKey?: string; // override for the applications H2
  huelseTypes?: HuelseType[]; // "Hülsentypen für die Textilindustrie"
  comparison?: ProductComparison; // "Papierhülsen vs. Kunststoffhülsen"
  customSectionKey?: string; // "Bedruckte & individuelle Hülsen nach Maß"
  b2bNoteKey?: string; // B2B sales filter line near CTA
}

// Stock Offer Types
export type OfferType = 'prime' | 'stocklot';

export interface StockOffer {
  id: string;
  productSlug: ProductSlug;
  gradeName: string;
  gradeNameKey?: string;
  gsmRange: string;
  originCountry: string;
  originKey?: string;
  quantityTons: number;
  port: string;
  availability: string;
  availabilityKey?: string;
  type: OfferType;
  updatedAt: string; // ISO date string
}

// Region Types
export type RegionSlug = 'europe' | 'turkey-mena' | 'asia';

export interface RegionInfo {
  slug: RegionSlug;
  i18nKey: string;
  mainPorts: string[];
  typicalCustomers: string[]; // translation keys
  typicalProducts: ProductSlug[];
}

// Article/Blog Types
export type ArticleCategory =
  | 'market-update'
  | 'grade-guide'
  | 'logistics'
  | 'sustainability';

export interface ArticleMeta {
  slug: string;
  locale: string;
  title: string;
  description: string;
  category: ArticleCategory;
  publishedAt: string; // ISO date
}

// Market Ticker Types
export interface MarketIndex {
  label: string;
  value: string;
  change: string;
  isUp?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  source?: string;
  updatedAt?: string;
}

// Contact Form Types
export interface ContactFormData {
  name: string;
  company: string;
  country: string;
  email: string;
  phone: string;
  productSlug?: ProductSlug;
  gsmRange?: string;
  quantity?: string;
  destinationPort?: string;
  message: string;
}

// Navigation Types
export interface NavItem {
  labelKey: string;
  href: string;
}
