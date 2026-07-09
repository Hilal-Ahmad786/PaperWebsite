import { pgTable, text, timestamp, jsonb, uuid, boolean, integer, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { pk, timestamps } from './shared';
import { users } from './identity';
import { contentStatus, contentType, stockOfferStatus } from './enums';

/** Localized JSON value: { en: "...", de: "...", ... }. */
type Localized = Record<string, string>;

/**
 * CMS content: insights/blog articles, standalone pages, FAQs.
 * Titles/bodies are localized maps so a single entry serves all site locales.
 */
export const contentEntries = pgTable(
  'content_entries',
  {
    id: pk(),
    type: contentType('type').default('insight').notNull(),
    slug: text('slug').notNull(),
    title: jsonb('title').$type<Localized>().default({}).notNull(),
    excerpt: jsonb('excerpt').$type<Localized>().default({}).notNull(),
    body: jsonb('body').$type<Localized>().default({}).notNull(),
    coverImage: text('cover_image'),
    tags: jsonb('tags').$type<string[]>().default([]).notNull(),
    status: contentStatus('status').default('draft').notNull(),
    seoTitle: jsonb('seo_title').$type<Localized>().default({}).notNull(),
    seoDescription: jsonb('seo_description').$type<Localized>().default({}).notNull(),
    authorUserId: uuid('author_user_id').references(() => users.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('content_type_slug_unique').on(t.type, t.slug),
    index('content_status_idx').on(t.status),
  ]
);

/**
 * Editable overrides / additions for the product catalog. The static
 * `src/content/products.ts` file remains the seed; rows here let the admin
 * tune specs, ordering, visibility and localized copy without a code deploy.
 */
export const productOverrides = pgTable('product_overrides', {
  slug: text('slug').primaryKey(), // canonical product slug
  name: jsonb('name').$type<Localized>().default({}).notNull(),
  summary: jsonb('summary').$type<Localized>().default({}).notNull(),
  category: text('category'),
  specTable: jsonb('spec_table').$type<{ label: string; value: string }[]>().default([]).notNull(),
  origins: jsonb('origins').$type<string[]>().default([]).notNull(),
  images: jsonb('images').$type<string[]>().default([]).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  isHidden: boolean('is_hidden').default(false).notNull(),
  ...timestamps,
});

/** Media library assets (Vercel Blob or external URLs). */
export const mediaAssets = pgTable(
  'media_assets',
  {
    id: pk(),
    url: text('url').notNull(),
    pathname: text('pathname'),
    filename: text('filename').notNull(),
    contentType: text('content_type'),
    size: integer('size'),
    width: integer('width'),
    height: integer('height'),
    alt: jsonb('alt').$type<Localized>().default({}).notNull(),
    uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (t) => [index('media_created_idx').on(t.createdAt)]
);

/** Stock offers (spot lots) surfaced on the public stock-offers page. */
export const stockOffers = pgTable(
  'stock_offers',
  {
    id: pk(),
    title: jsonb('title').$type<Localized>().default({}).notNull(),
    productSlug: text('product_slug'),
    grade: text('grade'),
    gsm: text('gsm'),
    quantityTons: text('quantity_tons'),
    location: text('location'),
    price: text('price'),
    incoterms: text('incoterms'),
    status: stockOfferStatus('status').default('available').notNull(),
    image: text('image'),
    sortOrder: integer('sort_order').default(0).notNull(),
    ...timestamps,
  },
  (t) => [index('stock_offers_status_idx').on(t.status)]
);

/** Market index rows shown in the ticker / insights (editable). */
export const marketIndices = pgTable('market_indices', {
  id: pk(),
  code: text('code').notNull().unique(), // e.g. OCC, KRAFTLINER_EU
  label: jsonb('label').$type<Localized>().default({}).notNull(),
  unit: text('unit'),
  value: text('value'),
  changePct: text('change_pct'),
  trend: text('trend'), // up | down | flat
  region: text('region'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
});
