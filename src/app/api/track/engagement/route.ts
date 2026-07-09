import type { NextRequest } from 'next/server';
import { isDbConfigured } from '@/db';
import { recordEngagement } from '@/db/repo/click-protection';
import { toBool, toNum } from '@/lib/click-protection/request';

export const runtime = 'nodejs';

const NO_CONTENT = new Response(null, { status: 204 });

/** Behavioral update. Accepts JSON or `navigator.sendBeacon` text bodies. */
export async function POST(req: NextRequest) {
  if (!isDbConfigured) return NO_CONTENT;

  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return NO_CONTENT;
  }

  const sessionId = String(body.sessionId ?? '').trim();
  if (!sessionId) return NO_CONTENT;

  try {
    await recordEngagement({
      sessionId,
      timeOnPage: toNum(body.timeOnPage),
      mouseMoved: toBool(body.mouseMoved),
      maxScrollDepth: toNum(body.maxScrollDepth),
      clickCount: toNum(body.clickCount),
      converted: toBool(body.converted),
    });
  } catch (err) {
    console.error('[track/engagement]', err instanceof Error ? err.message : err);
  }
  return NO_CONTENT;
}
