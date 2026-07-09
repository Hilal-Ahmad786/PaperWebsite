/**
 * IP-intelligence adapter. Detects datacenter / VPN / proxy IPs — the single
 * biggest bot signal. Results are cached per-IP in `ip_intel` so a provider is
 * never queried twice for the same address (within the TTL).
 *
 * Providers are swappable via env `CLICK_PROTECTION_IP_PROVIDER`:
 *   - "ip-api"  → ip-api.com (free, 45 req/min, has hosting/proxy flags) [default]
 *   - "ipinfo"  → ipinfo.io  (needs IPINFO_TOKEN)
 *
 * Never throws — on any failure it returns a safe "unknown" result (all false).
 * NOT called in the visitor request path; the aggregate job enriches IPs out-of-band.
 */
import { eq } from 'drizzle-orm';
import { isDbConfigured, requireDb } from '@/db';
import { ipIntel } from '@/db/schema';
import { IP_INTEL_TTL_DAYS } from './config';
import type { IpIntel } from './types';

type Provider = 'ip-api' | 'ipinfo';

interface ProviderResult extends IpIntel {
  raw: Record<string, unknown>;
}

const UNKNOWN: IpIntel = { isDatacenter: false, isVpn: false, isProxy: false };

function selectedProvider(): Provider {
  const env = (process.env.CLICK_PROTECTION_IP_PROVIDER ?? '').toLowerCase();
  if (env === 'ipinfo' || env === 'ip-api') return env;
  return process.env.IPINFO_TOKEN ? 'ipinfo' : 'ip-api';
}

async function queryIpApi(ip: string): Promise<ProviderResult> {
  const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,countryCode,isp,org,proxy,hosting,mobile`;
  const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
  const json = (await res.json()) as Record<string, unknown>;
  const hosting = json.hosting === true;
  const proxy = json.proxy === true;
  return {
    isDatacenter: hosting,
    isVpn: proxy,
    isProxy: proxy,
    country: (json.countryCode as string) ?? null,
    isp: ((json.isp as string) || (json.org as string)) ?? null,
    raw: json,
  };
}

async function queryIpinfo(ip: string): Promise<ProviderResult> {
  const token = process.env.IPINFO_TOKEN;
  const url = `https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${token ?? ''}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
  const json = (await res.json()) as Record<string, unknown>;
  const privacy = (json.privacy as Record<string, unknown> | undefined) ?? {};
  return {
    isDatacenter: privacy.hosting === true,
    isVpn: privacy.vpn === true,
    isProxy: privacy.proxy === true || privacy.tor === true || privacy.relay === true,
    country: (json.country as string) ?? null,
    isp: ((json.org as string) || (json.asn as string)) ?? null,
    raw: json,
  };
}

async function query(provider: Provider, ip: string): Promise<ProviderResult> {
  return provider === 'ipinfo' ? queryIpinfo(ip) : queryIpApi(ip);
}

function isFresh(fetchedAt: Date): boolean {
  const ageMs = Date.now() - fetchedAt.getTime();
  return ageMs < IP_INTEL_TTL_DAYS * 24 * 60 * 60 * 1000;
}

export async function lookupIp(ip: string): Promise<IpIntel> {
  if (!ip || !isDbConfigured) return UNKNOWN;
  const db = requireDb();

  try {
    const [cached] = await db.select().from(ipIntel).where(eq(ipIntel.ipAddress, ip)).limit(1);
    if (cached && isFresh(cached.fetchedAt)) {
      return {
        isDatacenter: cached.isDatacenter,
        isVpn: cached.isVpn,
        isProxy: cached.isProxy,
        country: cached.country,
        isp: cached.isp,
      };
    }

    const provider = selectedProvider();
    const result = await query(provider, ip);

    await db
      .insert(ipIntel)
      .values({
        ipAddress: ip,
        provider,
        isDatacenter: result.isDatacenter,
        isVpn: result.isVpn,
        isProxy: result.isProxy,
        country: result.country ?? null,
        isp: result.isp ?? null,
        raw: result.raw,
        fetchedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: ipIntel.ipAddress,
        set: {
          provider,
          isDatacenter: result.isDatacenter,
          isVpn: result.isVpn,
          isProxy: result.isProxy,
          country: result.country ?? null,
          isp: result.isp ?? null,
          raw: result.raw,
          fetchedAt: new Date(),
          updatedAt: new Date(),
        },
      });

    return {
      isDatacenter: result.isDatacenter,
      isVpn: result.isVpn,
      isProxy: result.isProxy,
      country: result.country,
      isp: result.isp,
    };
  } catch (err) {
    console.error('[click-protection] ip lookup failed', {
      ip,
      error: err instanceof Error ? err.message : 'unknown',
    });
    return UNKNOWN;
  }
}
