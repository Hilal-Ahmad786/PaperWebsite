import { MarketIndex } from '@/types';

// In production, this would come from an API or CMS
// For now, these are sample/placeholder values
export const marketIndices: MarketIndex[] = [
  {
    label: 'NBSK PULP',
    value: '$1,200',
    change: '▲ 2.3%',
    isUp: true,
  },
  {
    label: 'TESTLINER EU',
    value: '€650',
    change: '▼ 0.8%',
    isUp: false,
  },
  {
    label: 'KRAFTLINER',
    value: '$890',
    change: '▲ 1.2%',
    isUp: true,
  },
  {
    label: 'FREIGHT INDEX',
    value: '$3,200',
    change: '▲ 5.1%',
    isUp: true,
  },
  {
    label: 'DUPLEX BOARD TR',
    value: '₺12,500',
    change: '▲ 0.5%',
    isUp: true,
  },
  {
    label: 'FBB CHINA',
    value: '¥4,200',
    change: '▼ 1.3%',
    isUp: false,
  },
];
