'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { marketIndices } from '@/content/market-indices';
import { MarketIndex } from '@/types';

type MarketIndicesResponse = {
  indices: MarketIndex[];
  updatedAt?: string;
  source?: string;
  status?: 'live' | 'fallback';
};

const tickerCopy = {
  en: {
    dailyFx: 'Daily FX',
    indicative: 'Indicative',
    updated: 'Updated',
  },
  tr: {
    dailyFx: 'Günlük kur',
    indicative: 'Gösterge',
    updated: 'Güncellendi',
  },
  de: {
    dailyFx: 'Tageskurs',
    indicative: 'Indikativ',
    updated: 'Aktualisiert',
  },
  ar: {
    dailyFx: 'سعر يومي',
    indicative: 'استرشادي',
    updated: 'تم التحديث',
  },
} as const;

function getTrendClass(index: MarketIndex) {
  const trend = index.trend ?? (index.isUp ? 'up' : 'down');

  if (trend === 'up') {
    return 'text-brand-primary';
  }

  if (trend === 'down') {
    return 'text-red-500';
  }

  return 'text-text-tertiary';
}

export function MarketTicker() {
  const locale = useLocale() as keyof typeof tickerCopy;
  const copy = tickerCopy[locale] ?? tickerCopy.en;
  const [indices, setIndices] = useState<MarketIndex[]>(marketIndices);

  useEffect(() => {
    let isMounted = true;

    async function loadMarketIndices() {
      try {
        const response = await fetch('/api/market-indices');

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as MarketIndicesResponse;

        if (isMounted && Array.isArray(data.indices) && data.indices.length) {
          setIndices(data.indices);
        }
      } catch {
        // Keep the static fallback when the free market endpoint is unavailable.
      }
    }

    loadMarketIndices();

    return () => {
      isMounted = false;
    };
  }, []);

  const duplicatedIndices = [...indices, ...indices];

  return (
    <div className="bg-background-secondary border-b border-brand-primary/20 py-3 overflow-hidden">
      <div className="animate-ticker-scroll flex gap-12 whitespace-nowrap">
        {duplicatedIndices.map((index, i) => (
          <div
            key={`${index.label}-${i}`}
            className="flex items-center gap-3 font-mono text-sm"
          >
            <span className="text-text-tertiary font-semibold">
              {index.label}
            </span>
            <span className="text-text-primary font-bold">{index.value}</span>
            <span
              title={[
                index.source,
                index.updatedAt ? `${copy.updated} ${index.updatedAt}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
              className={`text-xs font-medium ${getTrendClass(index)}`}
            >
              {index.change === 'Daily FX' ? copy.dailyFx : copy.indicative}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
