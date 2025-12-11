import { RegionInfo } from '@/types';

export const regions: RegionInfo[] = [
  {
    slug: 'europe',
    i18nKey: 'regions.europe',
    mainPorts: ['Hamburg', 'Rotterdam', 'Antwerp', 'Gdansk'],
    typicalCustomers: [
      'regions.europe.customers.converters',
      'regions.europe.customers.printers',
      'regions.europe.customers.traders',
    ],
    typicalProducts: ['duplex-board', 'testliner-fluting', 'kraftliner-white-top'],
  },
  {
    slug: 'turkey-mena',
    i18nKey: 'regions.turkeyMena',
    mainPorts: ['Istanbul', 'Mersin', 'Izmir', 'Ambarli'],
    typicalCustomers: [
      'regions.turkeyMena.customers.boxPlants',
      'regions.turkeyMena.customers.packaging',
      'regions.turkeyMena.customers.export',
    ],
    typicalProducts: ['testliner-fluting', 'duplex-board', 'kraftliner-white-top'],
  },
  {
    slug: 'asia',
    i18nKey: 'regions.asia',
    mainPorts: ['Shanghai', 'Mumbai', 'Jakarta', 'Singapore'],
    typicalCustomers: [
      'regions.asia.customers.manufacturers',
      'regions.asia.customers.traders',
      'regions.asia.customers.converters',
    ],
    typicalProducts: ['duplex-board', 'triplex-board', 'testliner-fluting'],
  },
];

export function getRegionBySlug(slug: string): RegionInfo | undefined {
  return regions.find(r => r.slug === slug);
}
