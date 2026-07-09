import { pgEnum } from 'drizzle-orm/pg-core';

/** Admin UI language for a user. Matches the public site's primary locales. */
export const userLocale = pgEnum('user_locale', ['en', 'de', 'tr', 'ar', 'it', 'fr', 'es']);

/** Sales-inquiry pipeline stages (paper trading context). */
export const leadStage = pgEnum('lead_stage', [
  'new',
  'contacted',
  'qualifying',
  'quoted',
  'negotiation',
  'won',
  'lost',
]);

export const leadPriority = pgEnum('lead_priority', ['low', 'normal', 'high', 'urgent']);

export const leadSource = pgEnum('lead_source', [
  'website_form',
  'chat_widget',
  'phone',
  'email',
  'referral',
  'manual',
  'unknown',
]);

/** Publishing lifecycle shared by CMS content (products, insights, offers). */
export const contentStatus = pgEnum('content_status', ['draft', 'scheduled', 'published', 'archived']);

/** CMS content type. */
export const contentType = pgEnum('content_type', ['insight', 'page', 'faq']);

export const mediaVisibility = pgEnum('media_visibility', ['public', 'private']);

export const stockOfferStatus = pgEnum('stock_offer_status', ['available', 'reserved', 'sold', 'hidden']);
