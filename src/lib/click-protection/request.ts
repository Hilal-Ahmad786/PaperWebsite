/** Shared request helpers for the tracking endpoints + capture. */

export const CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid'] as const;

/** Client IP from proxy headers (Vercel forwards the real client first in XFF). */
export function clientIp(get: (key: string) => string | null | undefined): string {
  const xff = get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const real = get('x-real-ip');
  return real?.trim() || '0.0.0.0';
}

export function toNum(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function toBool(v: unknown): boolean | null {
  return typeof v === 'boolean' ? v : null;
}
