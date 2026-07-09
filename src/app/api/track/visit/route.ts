import type { NextRequest } from 'next/server';
import { isDbConfigured } from '@/db';
import { recordClientVisit } from '@/db/repo/click-protection';
import { isInternalIp } from '@/lib/click-protection/config';
import { clientIp } from '@/lib/click-protection/request';

export const runtime = 'nodejs';

const NO_CONTENT = new Response(null, { status: 204 });

/** Client visit enrichment (fingerprint + device). Best-effort; never errors to the visitor. */
export async function POST(req: NextRequest) {
  if (!isDbConfigured) return NO_CONTENT;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NO_CONTENT;
  }

  const sessionId = String(body.sessionId ?? '').trim();
  if (!sessionId) return NO_CONTENT;

  const ip = clientIp((k) => req.headers.get(k));
  if (isInternalIp(ip)) return NO_CONTENT;

  try {
    await recordClientVisit({
      sessionId,
      ipAddress: ip,
      userAgent: req.headers.get('user-agent'),
      gclid: (body.gclid as string) ?? null,
      gbraid: (body.gbraid as string) ?? null,
      wbraid: (body.wbraid as string) ?? null,
      referrer: (body.referrer as string) ?? null,
      landingPage: (body.landingPage as string) ?? null,
      utmSource: (body.utmSource as string) ?? null,
      utmMedium: (body.utmMedium as string) ?? null,
      utmCampaign: (body.utmCampaign as string) ?? null,
      utmTerm: (body.utmTerm as string) ?? null,
      utmContent: (body.utmContent as string) ?? null,
      fingerprintHash: (body.fingerprintHash as string) ?? null,
      screen: (body.screen as string) ?? null,
      timezone: (body.timezone as string) ?? null,
      language: (body.language as string) ?? null,
      platform: (body.platform as string) ?? null,
      hardwareConcurrency: typeof body.hardwareConcurrency === 'number' ? body.hardwareConcurrency : null,
      hasCanvas: typeof body.hasCanvas === 'boolean' ? body.hasCanvas : null,
    });
  } catch (err) {
    console.error('[track/visit]', err instanceof Error ? err.message : err);
  }
  return NO_CONTENT;
}
