import { pgTable, text, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './shared';
import { users } from './identity';

/** Key/value store for editable brand, contact, SEO and global settings. */
export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').$type<unknown>(),
  updatedBy: uuid('updated_by').references(() => users.id),
  ...timestamps,
});

/** Per-provider integration config (GA4, GTM, SendGrid, Blob, ...). */
export const integrationSettings = pgTable('integration_settings', {
  provider: text('provider').primaryKey(),
  enabled: boolean('enabled').default(false).notNull(),
  config: jsonb('config').$type<Record<string, unknown>>().default({}).notNull(),
  ...timestamps,
});
