// Product Types
export type ProductSlug =
  | 'duplex-board'
  | 'testliner-fluting'
  | 'kraftliner-white-top'
  | 'fbb';

export type ProductCategory = 'board' | 'containerboard';

export interface SpecItem {
  labelKey: string;
  value: string;
}

export interface Product {
  slug: ProductSlug;
  i18nKey: string; // e.g., "products.duplexBoard"
  category: ProductCategory;
  specTable: SpecItem[];
  applications: string[]; // translation keys
  origins: string[]; // e.g., ["Turkey", "EU", "India", "China"]
  typicalIndustries: string[]; // translation keys
}

// Stock Offer Types
export type OfferType = 'prime' | 'stocklot';

export interface StockOffer {
  id: string;
  productSlug: ProductSlug;
  gradeName: string;
  gsmRange: string;
  originCountry: string;
  quantityTons: number;
  port: string;
  availability: string;
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
  isUp: boolean;
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
