/**
 * Aggregate detection job. Two passes:
 *   1) Rescore recent visits — applies IP intel + the no-JS-bot signal.
 *   2) Rebuild per-IP `flagged_ips` from windowed aggregates, preserving any
 *      manual decision (excluded / whitelisted / reviewed) — v1 never auto-excludes.
 *
 * Pure scoring lives in `scoring.ts`; this module only does I/O + orchestration.
 * Run hourly (paid Vercel) or daily (Hobby) via /api/cron/click-protection.
 */
import { sql } from 'drizzle-orm';
import { isDbConfigured, requireDb, type Database } from '@/db';
import { adVisits, flaggedIps, backgroundJobs } from '@/db/schema';
import { scoreIpAggregate, scoreVisit } from './scoring';
import { lookupIp } from './ip-intel';
import { SIGNAL_PARAMS } from './config';
import type { IpIntel } from './types';

/** Job type used to record detection-run heartbeats (dashboard freshness). */
export const DETECTION_JOB_TYPE = 'click_protection_detection';

async function rawRows<T = Record<string, unknown>>(
  db: Database,
  q: ReturnType<typeof sql>
): Promise<T[]> {
  const r = (await db.execute(q)) as unknown;
  if (Array.isArray(r)) return r as T[];
  return ((r as { rows?: T[] }).rows ?? []) as T[];
}

async function rescoreRecentVisits(db: Database): Promise<number> {
  const visits = await rawRows<{
    id: string;
    ip_address: string;
    gclid: string | null;
    user_agent: string | null;
    fingerprint_hash: string | null;
    has_canvas: boolean | null;
    time_on_page: number | null;
    mouse_moved: boolean | null;
    max_scroll_depth: number | null;
    click_count: number | null;
    converted: boolean | null;
    age_seconds: number;
  }>(
    db,
    sql`select id, ip_address, gclid, user_agent, fingerprint_hash, has_canvas,
               time_on_page, mouse_moved, max_scroll_depth, click_count, converted,
               extract(epoch from (now() - created_at))::int as age_seconds
        from ad_visits
        where created_at >= now() - interval '2 days'
        order by created_at desc
        limit 5000`
  );

  const protectedRows = await rawRows<{ ip_address: string }>(
    db,
    sql`select distinct ip_address from ad_visits
        where converted and created_at >= now() - interval '90 days'`
  );
  const protectedIps = new Set(protectedRows.map((r) => r.ip_address));

  const intelCache = new Map<string, IpIntel>();
  let count = 0;

  for (const v of visits) {
    let intel = intelCache.get(v.ip_address);
    if (!intel) {
      intel = await lookupIp(v.ip_address);
      intelCache.set(v.ip_address, intel);
    }

    const serverLoggedNoClient =
      !!v.gclid && v.time_on_page == null && v.age_seconds > SIGNAL_PARAMS.noClientEngagementSeconds;

    const result = scoreVisit(
      {
        gclid: v.gclid,
        ipAddress: v.ip_address,
        userAgent: v.user_agent,
        fingerprintHash: v.fingerprint_hash,
        hasCanvas: v.has_canvas,
        timeOnPage: v.time_on_page,
        mouseMoved: v.mouse_moved,
        maxScrollDepth: v.max_scroll_depth,
        clickCount: v.click_count,
        converted: v.converted,
        serverLoggedNoClient,
        ipConvertedRecently: protectedIps.has(v.ip_address),
      },
      intel
    );

    await db
      .update(adVisits)
      .set({
        fraudScore: result.score,
        fraudReasons: result.reasons,
        isDatacenter: intel.isDatacenter,
        isVpn: intel.isVpn,
        isProxy: intel.isProxy,
        country: intel.country ?? null,
        isp: intel.isp ?? null,
        updatedAt: new Date(),
      })
      .where(sql`${adVisits.id} = ${v.id}`);
    count++;
  }
  return count;
}

async function evaluateIps(db: Database): Promise<number> {
  const base = await rawRows<{
    ip: string;
    ad_clicks: number;
    conversions: number;
    total_visits: number;
    zero_engagement: number;
  }>(
    db,
    sql`select ip_address as ip,
               count(*) filter (where gclid is not null)::int as ad_clicks,
               count(*) filter (where converted)::int as conversions,
               count(*)::int as total_visits,
               count(*) filter (where time_on_page is not null and time_on_page < 3
                 and coalesce(mouse_moved,false) = false
                 and coalesce(max_scroll_depth,0) = 0)::int as zero_engagement
        from ad_visits
        where created_at >= now() - interval '24 hours'
        group by ip_address`
  );
  if (base.length === 0) return 0;

  const velocity = new Map<string, number>();
  for (const r of await rawRows<{ ip: string; c: number }>(
    db,
    sql`select a.ip_address as ip, count(*)::int as c
        from ad_visits a
        join ad_visits b on b.ip_address = a.ip_address and b.id <> a.id
          and b.created_at between a.created_at
          and a.created_at + (${SIGNAL_PARAMS.velocityWindowSeconds} || ' seconds')::interval
        where a.created_at >= now() - interval '24 hours' and a.gclid is not null
        group by a.ip_address`
  )) {
    velocity.set(r.ip, r.c + 1);
  }

  const spread = new Map<string, number>();
  for (const r of await rawRows<{ ip: string; max_spread: number }>(
    db,
    sql`with fp as (
           select fingerprint_hash, count(distinct ip_address)::int as ip_count
           from ad_visits
           where created_at >= now() - interval '7 days'
             and fingerprint_hash is not null and fingerprint_hash <> ''
           group by fingerprint_hash
         )
         select v.ip_address as ip, max(fp.ip_count)::int as max_spread
         from ad_visits v join fp on v.fingerprint_hash = fp.fingerprint_hash
         where v.created_at >= now() - interval '7 days'
         group by v.ip_address`
  )) {
    spread.set(r.ip, r.max_spread);
  }

  const records = new Map<
    string,
    {
      total_clicks: number;
      total_conversions: number;
      first_seen: string;
      last_seen: string;
      max_visit_score: number;
      converted_90d: boolean;
    }
  >();
  for (const r of await rawRows<{
    ip: string;
    total_clicks: number;
    total_conversions: number;
    first_seen: string;
    last_seen: string;
    max_visit_score: number;
    converted_90d: boolean;
  }>(
    db,
    sql`select ip_address as ip,
               count(*) filter (where gclid is not null)::int as total_clicks,
               count(*) filter (where converted)::int as total_conversions,
               min(created_at) as first_seen,
               max(created_at) as last_seen,
               max(fraud_score)::int as max_visit_score,
               bool_or(converted and created_at >= now() - interval '90 days') as converted_90d
        from ad_visits
        where ip_address in (select distinct ip_address from ad_visits where created_at >= now() - interval '24 hours')
        group by ip_address`
  )) {
    records.set(r.ip, r);
  }

  const intelCache = new Map<string, IpIntel>();
  let count = 0;

  for (const b of base) {
    const rec = records.get(b.ip);
    if (!rec) continue;

    let intel = intelCache.get(b.ip);
    if (!intel) {
      intel = await lookupIp(b.ip);
      intelCache.set(b.ip, intel);
    }

    const result = scoreIpAggregate(
      {
        ipAddress: b.ip,
        windowHours: SIGNAL_PARAMS.manyClicksWindowHours,
        adClicks: b.ad_clicks,
        conversions: b.conversions,
        totalVisits: b.total_visits,
        zeroEngagementVisits: b.zero_engagement,
        maxClicksInVelocityWindow: velocity.get(b.ip) ?? 0,
        fingerprintMaxIpSpread: spread.get(b.ip) ?? 0,
        convertedInProtectionWindow: rec.converted_90d,
      },
      intel
    );

    const combinedScore = Math.max(result.score, rec.max_visit_score);
    const status = result.suggestedStatus;

    await db
      .insert(flaggedIps)
      .values({
        ipAddress: b.ip,
        totalClicks: rec.total_clicks,
        totalConversions: rec.total_conversions,
        fraudScore: combinedScore,
        reasons: result.reasons,
        firstSeen: new Date(rec.first_seen),
        lastSeen: new Date(rec.last_seen),
        status,
        isDatacenter: intel.isDatacenter,
        isVpn: intel.isVpn,
        isProxy: intel.isProxy,
        country: intel.country ?? null,
        isp: intel.isp ?? null,
      })
      .onConflictDoUpdate({
        target: flaggedIps.ipAddress,
        set: {
          totalClicks: sql`excluded.total_clicks`,
          totalConversions: sql`excluded.total_conversions`,
          fraudScore: sql`excluded.fraud_score`,
          reasons: sql`excluded.reasons`,
          firstSeen: sql`least(${flaggedIps.firstSeen}, excluded.first_seen)`,
          lastSeen: sql`greatest(${flaggedIps.lastSeen}, excluded.last_seen)`,
          isDatacenter: sql`excluded.is_datacenter`,
          isVpn: sql`excluded.is_vpn`,
          isProxy: sql`excluded.is_proxy`,
          country: sql`excluded.country`,
          isp: sql`excluded.isp`,
          status: sql`case when ${flaggedIps.status} in ('excluded','whitelisted') or ${flaggedIps.manuallyReviewed}
                           then ${flaggedIps.status} else excluded.status end`,
          updatedAt: new Date(),
        },
      });
    count++;
  }
  return count;
}

async function purgeOldVisits(db: Database): Promise<void> {
  await db.execute(sql`delete from ad_visits where created_at < now() - interval '90 days'`);
}

export async function runAggregateJob(): Promise<{ rescored: number; ipsEvaluated: number }> {
  if (!isDbConfigured) return { rescored: 0, ipsEvaluated: 0 };
  const db = requireDb();
  const rescored = await rescoreRecentVisits(db);
  const ipsEvaluated = await evaluateIps(db);
  await purgeOldVisits(db);
  await db.insert(backgroundJobs).values({
    type: DETECTION_JOB_TYPE,
    status: 'succeeded',
    payload: { rescored, ipsEvaluated },
  });
  return { rescored, ipsEvaluated };
}
