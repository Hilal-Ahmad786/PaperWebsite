import { StockOffer } from '@/types';

export const stockOffers: StockOffer[] = [
  {
    id: 'SO-2024-001',
    productSlug: 'duplex-board',
    gradeName: 'GC1 Duplex Board',
    gsmRange: '300 gsm',
    originCountry: 'Turkey',
    quantityTons: 150,
    port: 'Mersin',
    availability: 'Ready to Ship',
    type: 'prime',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'SO-2024-002',
    productSlug: 'testliner-fluting',
    gradeName: 'TL3 Testliner',
    gsmRange: '120–140 gsm',
    originCountry: 'Turkey',
    quantityTons: 200,
    port: 'Istanbul',
    availability: 'In Production - 14 days',
    type: 'prime',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'SO-2024-003',
    productSlug: 'duplex-board',
    gradeName: 'GD2 Grey Back',
    gsmRange: '230–280 gsm',
    originCountry: 'India',
    quantityTons: 100,
    port: 'Mumbai',
    availability: 'Ready to Ship',
    type: 'stocklot',
    updatedAt: '2024-11-28T00:00:00Z',
  },
  {
    id: 'SO-2024-004',
    productSlug: 'kraftliner-white-top',
    gradeName: 'White Top Kraftliner',
    gsmRange: '150–175 gsm',
    originCountry: 'EU',
    quantityTons: 80,
    port: 'Hamburg',
    availability: 'Ready to Ship',
    type: 'prime',
    updatedAt: '2024-11-30T00:00:00Z',
  },
  {
    id: 'SO-2024-005',
    productSlug: 'testliner-fluting',
    gradeName: 'Fluting Medium',
    gsmRange: '100–120 gsm',
    originCountry: 'Turkey',
    quantityTons: 300,
    port: 'Izmir',
    availability: 'In 2 Weeks',
    type: 'prime',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'SO-2024-006',
    productSlug: 'fbb',
    gradeName: 'FBB Coated Board',
    gsmRange: '250–300 gsm',
    originCountry: 'China',
    quantityTons: 120,
    port: 'Shanghai',
    availability: 'Ready to Ship',
    type: 'stocklot',
    updatedAt: '2024-11-25T00:00:00Z',
  },
];

export function getOffersByProduct(productSlug: string): StockOffer[] {
  return stockOffers.filter(offer => offer.productSlug === productSlug);
}

export function getOffersByType(type: 'prime' | 'stocklot'): StockOffer[] {
  return stockOffers.filter(offer => offer.type === type);
}

export function getOfferById(id: string): StockOffer | undefined {
  return stockOffers.find(offer => offer.id === id);
}
