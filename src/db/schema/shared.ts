import { timestamp, uuid } from 'drizzle-orm/pg-core';

/** Immutable UUID primary key. */
export const pk = () => uuid('id').defaultRandom().primaryKey();

/** UTC timestamps (stored as timestamptz). */
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};
