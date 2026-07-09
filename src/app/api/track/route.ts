import { NextResponse } from 'next/server';
import { isDbConfigured, requireDb } from '@/db';
import { analyticsEvents } from '@/db/schema';

export const dynamic = 'force-dynamic';

/**
 * Public, unauthenticated tracking endpoint. Side-effect only: records a single
 * analytics event. Must be fast and never 500 on bad input.
 */
export async function POST(request: Request) {
  if (!isDbConfigured) {
    return new NextResponse(null, { status: 204 });
  }

  let payload: {
    type?: unknown;
    path?: unknown;
    locale?: unknown;
    referrer?: unknown;
    metadata?: unknown;
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const type = typeof payload.type === 'string' ? payload.type.trim() : '';
  if (!type) {
    return NextResponse.json({ error: 'Missing type' }, { status: 400 });
  }

  const asString = (v: unknown): string | null =>
    typeof v === 'string' && v.trim() ? v.trim().slice(0, 2048) : null;

  const country = request.headers.get('x-vercel-ip-country');
  const metadata =
    payload.metadata && typeof payload.metadata === 'object' && !Array.isArray(payload.metadata)
      ? (payload.metadata as Record<string, unknown>)
      : undefined;

  try {
    await requireDb().insert(analyticsEvents).values({
      type: type.slice(0, 128),
      path: asString(payload.path),
      locale: asString(payload.locale),
      referrer: asString(payload.referrer),
      country: country ? country.slice(0, 8) : null,
      metadata,
    });
  } catch {
    // Never fail the caller on a tracking write.
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ ok: true });
}
