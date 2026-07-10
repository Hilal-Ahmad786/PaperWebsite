/**
 * Read-through data loaders for the public site. Each returns database-managed
 * content when a DB is configured and has rows, otherwise falls back to the
 * static `src/content/*` files — so the live site never breaks when the DB is
 * empty or unconfigured, and admin edits take over once present.
 */
import { asc, desc, eq } from 'drizzle-orm';
import { isDbConfigured, db } from '@/db';
import { marketIndices, contentEntries } from '@/db/schema';
import { pickLocalized } from '@/lib/admin/localized';
import { paperMarketIndicators } from '@/content/market-indices';
import type { MarketIndex } from '@/types';

/** Paper market indicators — DB rows if any active, else the static list. */
export async function getPaperMarketIndicators(): Promise<MarketIndex[]> {
  if (!isDbConfigured || !db) return paperMarketIndicators;
  try {
    const rows = await db
      .select()
      .from(marketIndices)
      .where(eq(marketIndices.isActive, true))
      .orderBy(asc(marketIndices.sortOrder));
    if (!rows.length) return paperMarketIndicators;
    return rows.map((r) => ({
      label: pickLocalized(r.label, 'en') || r.code,
      value: r.value ?? '',
      change: r.changePct ?? 'Indicative',
      trend: r.trend === 'up' ? 'up' : r.trend === 'down' ? 'down' : 'neutral',
      source: r.region ?? 'Supplier benchmark',
      updatedAt: r.updatedAt.toISOString().slice(0, 10),
    }));
  } catch {
    return paperMarketIndicators;
  }
}

export interface PublicInsight {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  tags: string[];
  publishedAt: string | null;
}

/** Published insights from the CMS for a given locale (empty if none/no DB). */
export async function getPublishedInsights(locale: string): Promise<PublicInsight[]> {
  if (!isDbConfigured || !db) return [];
  try {
    const rows = await db
      .select()
      .from(contentEntries)
      .where(eq(contentEntries.status, 'published'))
      .orderBy(desc(contentEntries.publishedAt));
    return rows
      .filter((r) => r.type === 'insight')
      .map((r) => ({
        slug: r.slug,
        title: pickLocalized(r.title, locale),
        excerpt: pickLocalized(r.excerpt, locale),
        coverImage: r.coverImage,
        tags: r.tags ?? [],
        publishedAt: r.publishedAt ? r.publishedAt.toISOString().slice(0, 10) : null,
      }))
      .filter((r) => r.title);
  } catch {
    return [];
  }
}

export interface ProductOverrideView {
  name: string;
  summary: string;
  category: string | null;
  images: string[];
  sortOrder: number;
  isHidden: boolean;
}

/** Map of canonical slug → override (localized to `locale`). Empty if none/no DB. */
export async function getProductOverrides(locale: string): Promise<Record<string, ProductOverrideView>> {
  if (!isDbConfigured || !db) return {};
  try {
    const { productOverrides } = await import('@/db/schema');
    const rows = await db.select().from(productOverrides);
    const map: Record<string, ProductOverrideView> = {};
    for (const r of rows) {
      map[r.slug] = {
        name: pickLocalized(r.name, locale),
        summary: pickLocalized(r.summary, locale),
        category: r.category,
        images: r.images ?? [],
        sortOrder: r.sortOrder,
        isHidden: r.isHidden,
      };
    }
    return map;
  } catch {
    return {};
  }
}
