import { createHmac } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { isDbConfigured, requireDb } from '@/db';
import { analyticsEvents } from '@/db/schema';
import { clientIp } from '@/lib/click-protection/request';
import { isInternalIp } from '@/lib/click-protection/config';

export const runtime = 'nodejs';

const NO_CONTENT = new Response(null, { status: 204 });

/** CTA / conversion events counted first-party (independent of GA4/GTM). */
const ALLOWED = new Set([
  'phone_click',
  'whatsapp_click',
  'quote_click',
  'email_click',
  'offer_request',
  'form_start',
  'spec_upload',
  'form_submit',
  'page_view',
]);

const BOT_RE =
  /bot|crawl|spider|slurp|bing|google|yandex|baidu|duckduck|facebook|embedly|headless|lighthouse|ahrefs|semrush|pingdom|uptime|monitor|preview/i;

/** Pseudonymous IP fingerprint: salted HMAC, not the raw IP (GDPR-friendly). */
function hashIp(ip: string): string {
  const pepper = process.env.CRON_SECRET || 'pmw-click-pepper';
  return createHmac('sha256', pepper).update(ip).digest('hex').slice(0, 16);
}

/**
 * Lightweight first-party CTA-click counter. The public site beacons here when a
 * visitor taps Call / WhatsApp / Request a quote, so the admin sees raw counts +
 * unique/repeat visitors without depending on GTM/GA4. Stores a *hashed* IP.
 */
export async function POST(req: NextRequest) {
  if (!isDbConfigured) return NO_CONTENT;

  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return NO_CONTENT;
  }

  const event = String(body.event ?? '').trim();
  if (!ALLOWED.has(event)) return NO_CONTENT;

  if (event === 'page_view' && BOT_RE.test(req.headers.get('user-agent') || '')) return NO_CONTENT;

  const ip = clientIp((k) => req.headers.get(k));
  const ipHash = ip && ip !== '0.0.0.0' && !isInternalIp(ip) ? hashIp(ip) : null;

  try {
    await requireDb()
      .insert(analyticsEvents)
      .values({
        type: event,
        path: typeof body.path === 'string' ? body.path.slice(0, 500) : null,
        referrer: typeof body.referrer === 'string' ? body.referrer.slice(0, 500) : null,
        country: req.headers.get('x-vercel-ip-country'),
        metadata: {
          location: typeof body.location === 'string' ? body.location.slice(0, 100) : null,
          sessionId: typeof body.sessionId === 'string' ? body.sessionId.slice(0, 100) : null,
          ipHash,
        },
      });
  } catch (err) {
    console.error('[track/click]', err instanceof Error ? err.message : err);
  }
  return NO_CONTENT;
}
