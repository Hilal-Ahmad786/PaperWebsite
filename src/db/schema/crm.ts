import { pgTable, text, timestamp, jsonb, uuid, index } from 'drizzle-orm/pg-core';
import { pk, timestamps } from './shared';
import { users } from './identity';
import { leadStage, leadPriority, leadSource } from './enums';

/** Inbound sales inquiries (contact form, chat widget, manual entry). */
export const leads = pgTable(
  'leads',
  {
    id: pk(),
    name: text('name').notNull(),
    company: text('company'),
    email: text('email').notNull(),
    phone: text('phone'),
    country: text('country'),
    vatId: text('vat_id'),
    product: text('product'),
    quantity: text('quantity'),
    message: text('message'),
    locale: text('locale'),
    stage: leadStage('stage').default('new').notNull(),
    priority: leadPriority('priority').default('normal').notNull(),
    source: leadSource('source').default('website_form').notNull(),
    assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
    // Arbitrary extra form fields captured at submit time.
    meta: jsonb('meta').$type<Record<string, unknown>>().default({}).notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index('leads_stage_idx').on(t.stage),
    index('leads_created_idx').on(t.createdAt),
    index('leads_email_idx').on(t.email),
  ]
);

/** Chronological notes / activity on a lead. */
export const leadNotes = pgTable(
  'lead_notes',
  {
    id: pk(),
    leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
    authorUserId: uuid('author_user_id').references(() => users.id, { onDelete: 'set null' }),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('lead_notes_lead_idx').on(t.leadId)]
);
