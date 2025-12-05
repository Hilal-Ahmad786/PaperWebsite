'use client';

import { marketIndices } from '@/content/market-indices';

export function MarketTicker() {
  // Duplicate the indices array for seamless infinite scroll
  const duplicatedIndices = [...marketIndices, ...marketIndices];

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
              className={`text-xs font-medium ${
                index.isUp ? 'text-brand-primary' : 'text-red-500'
              }`}
            >
              {index.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
