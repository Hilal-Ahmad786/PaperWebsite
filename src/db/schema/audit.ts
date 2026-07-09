import { pgTable, text, timestamp, jsonb, uuid, integer, index } from 'drizzle-orm/pg-core';
import { pk } from './shared';
import { users } from './identity';

/** Append-only audit trail. */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: pk(),
    actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(), // login, lead.stage_change, content.publish, ...
    entityType: text('entity_type'),
    entityId: text('entity_id'),
    summary: text('summary'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    ip: text('ip'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('audit_actor_idx').on(t.actorUserId),
    index('audit_action_idx').on(t.action),
    index('audit_created_idx').on(t.createdAt),
  ]
);

/** Lightweight first-party analytics events (page views, CTA clicks, form submits). */
export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: pk(),
    type: text('type').notNull(), // page_view, cta_click, form_submit, ...
    path: text('path'),
    locale: text('locale'),
    referrer: text('referrer'),
    country: text('country'),
    device: text('device'),
    durationMs: integer('duration_ms'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('analytics_type_idx').on(t.type), index('analytics_created_idx').on(t.createdAt)]
);
