import { NextResponse } from 'next/server';
import { marketIndices, paperMarketIndicators } from '@/content/market-indices';
import { MarketIndex } from '@/types';

export const revalidate = 60 * 60 * 12;

type FrankfurterResponse = {
  amount: number;
  base: string;
  date: string;
  rates: {
    EUR?: number;
    TRY?: number;
  };
};

const formatter = {
  eurUsd: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }),
  try: new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
};

function getFallbackResponse() {
  return NextResponse.json(
    {
      indices: marketIndices,
      updatedAt: marketIndices[0]?.updatedAt,
      source: 'Static fallback',
      status: 'fallback',
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
      },
    },
  );
}

function buildFxIndicators(data: FrankfurterResponse): MarketIndex[] | null {
  const eurRate = data.rates.EUR;
  const tryRate = data.rates.TRY;

  if (!eurRate || !tryRate) {
    return null;
  }

  const eurUsd = 1 / eurRate;
  const eurTry = tryRate / eurRate;

  return [
    {
      label: 'USD/TRY',
      value: formatter.try.format(tryRate),
      change: 'Daily FX',
      trend: 'neutral',
      source: 'Frankfurter / ECB',
      updatedAt: data.date,
    },
    {
      label: 'EUR/USD',
      value: formatter.eurUsd.format(eurUsd),
      change: 'Daily FX',
      trend: 'neutral',
      source: 'Frankfurter / ECB',
      updatedAt: data.date,
    },
    {
      label: 'EUR/TRY',
      value: formatter.try.format(eurTry),
      change: 'Daily FX',
      trend: 'neutral',
      source: 'Frankfurter / ECB',
      updatedAt: data.date,
    },
  ];
}

export async function GET() {
  try {
    const response = await fetch(
      'https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,TRY',
      {
        next: { revalidate },
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      return getFallbackResponse();
    }

    const data = (await response.json()) as FrankfurterResponse;
    const fxIndicators = buildFxIndicators(data);

    if (!fxIndicators) {
      return getFallbackResponse();
    }

    return NextResponse.json(
      {
        indices: [...fxIndicators, ...paperMarketIndicators],
        updatedAt: data.date,
        source: 'Frankfurter daily FX with manual paper indicators',
        status: 'live',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=86400',
        },
      },
    );
  } catch {
    return getFallbackResponse();
  }
}
