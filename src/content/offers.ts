import { StockOffer } from '@/types';

export const stockOffers: StockOffer[] = [
  {
    id: 'SO-2024-001',
    productSlug: 'duplex-board',
    gradeName: 'GC1 Duplex Board',
    gradeNameKey: 'stockOffers.items.so2024001.gradeName',
    gsmRange: '300 gsm',
    originCountry: 'Turkey',
    originKey: 'origins.turkey',
    quantityTons: 150,
    port: 'Mersin',
    availability: 'Ready to Ship',
    availabilityKey: 'stockOffers.availability.readyToShip',
    type: 'prime',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'SO-2024-002',
    productSlug: 'testliner-fluting',
    gradeName: 'TL3 Testliner',
    gradeNameKey: 'stockOffers.items.so2024002.gradeName',
    gsmRange: '120–140 gsm',
    originCountry: 'Turkey',
    originKey: 'origins.turkey',
    quantityTons: 200,
    port: 'Istanbul',
    availability: 'In Production - 14 days',
    availabilityKey: 'stockOffers.availability.inProduction14Days',
    type: 'prime',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'SO-2024-003',
    productSlug: 'duplex-board',
    gradeName: 'GD2 Grey Back',
    gradeNameKey: 'stockOffers.items.so2024003.gradeName',
    gsmRange: '230–280 gsm',
    originCountry: 'India',
    originKey: 'origins.india',
    quantityTons: 100,
    port: 'Mumbai',
    availability: 'Ready to Ship',
    availabilityKey: 'stockOffers.availability.readyToShip',
    type: 'stocklot',
    updatedAt: '2024-11-28T00:00:00Z',
  },
  {
    id: 'SO-2024-004',
    productSlug: 'kraftliner-white-top',
    gradeName: 'White Top Kraftliner',
    gradeNameKey: 'stockOffers.items.so2024004.gradeName',
    gsmRange: '150–175 gsm',
    originCountry: 'EU',
    originKey: 'origins.eu',
    quantityTons: 80,
    port: 'Hamburg',
    availability: 'Ready to Ship',
    availabilityKey: 'stockOffers.availability.readyToShip',
    type: 'prime',
    updatedAt: '2024-11-30T00:00:00Z',
  },
  {
    id: 'SO-2024-005',
    productSlug: 'testliner-fluting',
    gradeName: 'Fluting Medium',
    gradeNameKey: 'stockOffers.items.so2024005.gradeName',
    gsmRange: '100–120 gsm',
    originCountry: 'Turkey',
    originKey: 'origins.turkey',
    quantityTons: 300,
    port: 'Izmir',
    availability: 'In 2 Weeks',
    availabilityKey: 'stockOffers.availability.in2Weeks',
    type: 'prime',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'SO-2024-006',
    productSlug: 'triplex-board',
    gradeName: 'Triplex Board Coated',
    gradeNameKey: 'stockOffers.items.so2024006.gradeName',
    gsmRange: '250–300 gsm',
    originCountry: 'China',
    originKey: 'origins.china',
    quantityTons: 120,
    port: 'Shanghai',
    availability: 'Ready to Ship',
    availabilityKey: 'stockOffers.availability.readyToShip',
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
