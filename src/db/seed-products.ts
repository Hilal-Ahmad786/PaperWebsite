/**
 * Seed `product_overrides` from the static catalog (src/content/products.ts) +
 * the message catalogs (messages/*.json), so every current product appears in
 * the admin Products section pre-filled with its real name/summary in ALL site
 * languages, ready for the client to edit.
 *
 * Idempotent: re-running refreshes name/summary/category/origins/images/order
 * but preserves any admin-set `isHidden` and `spec_table`.
 * Run with: DATABASE_URL=... npm run db:seed:products
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { requireDb, isDbConfigured } from './index';
import { productOverrides } from './schema';
import { products } from '../content/products';

const LOCALES = ['en', 'de', 'tr', 'ar', 'it', 'fr', 'es'] as const;

function loadCatalog(loc: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.join(process.cwd(), 'messages', `${loc}.json`), 'utf8'));
}

function getByPath(obj: unknown, dotted: string): Record<string, string> | undefined {
  return dotted.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], obj) as
    | Record<string, string>
    | undefined;
}

async function main() {
  if (!isDbConfigured) {
    console.error('DATABASE_URL is not set. Aborting.');
    process.exit(1);
  }
  const db = requireDb();

  const catalogs: Record<string, Record<string, unknown>> = {};
  for (const loc of LOCALES) catalogs[loc] = loadCatalog(loc);

  let i = 0;
  for (const p of products) {
    const name: Record<string, string> = {};
    const summary: Record<string, string> = {};
    for (const loc of LOCALES) {
      const base = getByPath(catalogs[loc], p.i18nKey);
      if (base?.name) name[loc] = base.name;
      if (base?.short) summary[loc] = base.short;
    }

    const images = Array.from(
      new Set(
        [
          p.heroImage?.src,
          ...((p.images ?? []).map((im) => (typeof im === 'string' ? im : im?.src)) as string[]),
        ].filter(Boolean) as string[]
      )
    );
    const origins = (p.origins ?? []) as string[];
    const category = p.category ?? null;

    await db
      .insert(productOverrides)
      .values({ slug: p.slug, name, summary, category, origins, images, sortOrder: i })
      .onConflictDoUpdate({
        target: productOverrides.slug,
        // Preserve admin-set isHidden + spec_table; refresh the rest.
        set: { name, summary, category, origins, images, sortOrder: i, updatedAt: new Date() },
      });

    console.log(`  ✓ ${p.slug} — ${Object.keys(name).length} languages`);
    i++;
  }

  console.log(`\nSeeded ${products.length} products into product_overrides.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
