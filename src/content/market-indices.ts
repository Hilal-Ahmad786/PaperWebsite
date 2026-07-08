import { MarketIndex } from '@/types';

const manualUpdatedAt = '2026-06-08';

export const paperMarketIndicators: MarketIndex[] = [
  {
    label: 'NBSK PULP',
    value: '$1,200/MT',
    change: 'Indicative',
    trend: 'neutral',
    source: 'Supplier benchmark',
    updatedAt: manualUpdatedAt,
  },
  {
    label: 'TESTLINER EU',
    value: '€650/MT',
    change: 'Indicative',
    trend: 'neutral',
    source: 'Supplier benchmark',
    updatedAt: manualUpdatedAt,
  },
  {
    label: 'KRAFTLINER',
    value: '$890/MT',
    change: 'Indicative',
    trend: 'neutral',
    source: 'Supplier benchmark',
    updatedAt: manualUpdatedAt,
  },
  {
    label: 'DUPLEX BOARD TR',
    value: '₺12,500/MT',
    change: 'Indicative',
    trend: 'neutral',
    source: 'Supplier benchmark',
    updatedAt: manualUpdatedAt,
  },
  {
    label: 'CONTAINER MARKET',
    value: '$3,200/FEU',
    change: 'Indicative',
    trend: 'neutral',
    source: 'Freight benchmark',
    updatedAt: manualUpdatedAt,
  },
];

export const marketIndices: MarketIndex[] = [
  {
    label: 'USD/TRY',
    value: '₺46.08',
    change: 'Daily FX',
    trend: 'neutral',
    source: 'Frankfurter',
    updatedAt: '2026-06-05',
  },
  {
    label: 'EUR/USD',
    value: '$1.1640',
    change: 'Daily FX',
    trend: 'neutral',
    source: 'Frankfurter',
    updatedAt: '2026-06-05',
  },
  ...paperMarketIndicators,
];
