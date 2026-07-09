/**
 * Data access for the click-fraud system: visit capture (client + engagement),
 * dashboard aggregations, flagged-IP / visit listings, and exports.
 * Reads guard on `isDbConfigured`; writes assume the caller already did.
 */
import { and, desc, eq, gte, ilike, isNotNull, sql } from 'drizzle-orm';
import { isDbConfigured, requireDb } from '@/db';
import { adVisits, flaggedIps, siteSettings, backgroundJobs } from '@/db/schema';
import { DETECTION_JOB_TYPE } from '@/lib/click-protection/aggregate';
import { FRAUD_THRESHOLDS } from '@/lib/click-protection/config';
import type { FlaggedStatus } from '@/lib/click-protection/types';

const FLAGGED = FRAUD_THRESHOLDS.flagged;

// ─────────────────────────── capture ───────────────────────────

export interface ClientVisitInput {
  sessionId: string;
  ipAddress: string;
  userAgent?: string | null;
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  referrer?: string | null;
  landingPage?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  fingerprintHash?: string | null;
  screen?: string | null;
  timezone?: string | null;
  language?: string | null;
  platform?: string | null;
  hardwareConcurrency?: number | null;
  hasCanvas?: boolean | null;
}

/** Client enrichment (fingerprint + device). Upserts on the session row. */
export async function recordClientVisit(v: ClientVisitInput): Promise<void> {
  if (!isDbConfigured || !v.sessionId) return;
  await requireDb()
    .insert(adVisits)
    .values({
      sessionId: v.sessionId,
      ipAddress: v.ipAddress,
      userAgent: v.userAgent ?? null,
      gclid: v.gclid ?? null,
      gbraid: v.gbraid ?? null,
      wbraid: v.wbraid ?? null,
      referrer: v.referrer ?? null,
      landingPage: v.landingPage ?? null,
      utmSource: v.utmSource ?? null,
      utmMedium: v.utmMedium ?? null,
      utmCampaign: v.utmCampaign ?? null,
      utmTerm: v.utmTerm ?? null,
      utmContent: v.utmContent ?? null,
      fingerprintHash: v.fingerprintHash ?? null,
      screen: v.screen ?? null,
      timezone: v.timezone ?? null,
      language: v.language ?? null,
      platform: v.platform ?? null,
      hardwareConcurrency: v.hardwareConcurrency ?? null,
      hasCanvas: v.hasCanvas ?? null,
    })
    .onConflictDoUpdate({
      target: adVisits.sessionId,
      set: {
        userAgent: sql`coalesce(${adVisits.userAgent}, excluded.user_agent)`,
        gclid: sql`coalesce(${adVisits.gclid}, excluded.gclid)`,
        gbraid: sql`coalesce(${adVisits.gbraid}, excluded.gbraid)`,
        wbraid: sql`coalesce(${adVisits.wbraid}, excluded.wbraid)`,
        landingPage: sql`coalesce(${adVisits.landingPage}, excluded.landing_page)`,
        fingerprintHash: sql`excluded.fingerprint_hash`,
        screen: sql`excluded.screen`,
        timezone: sql`excluded.timezone`,
        language: sql`excluded.language`,
        platform: sql`excluded.platform`,
        hardwareConcurrency: sql`excluded.hardware_concurrency`,
        hasCanvas: sql`excluded.has_canvas`,
        updatedAt: new Date(),
      },
    });
}

export interface EngagementInput {
  sessionId: string;
  timeOnPage?: number | null;
  mouseMoved?: boolean | null;
  maxScrollDepth?: number | null;
  clickCount?: number | null;
  converted?: boolean | null;
}

/** Behavioral update — keeps the strongest engagement seen. */
export async function recordEngagement(e: EngagementInput): Promise<void> {
  if (!isDbConfigured || !e.sessionId) return;
  await requireDb()
    .update(adVisits)
    .set({
      timeOnPage: sql`greatest(coalesce(${adVisits.timeOnPage}, 0), ${e.timeOnPage ?? 0})`,
      mouseMoved: sql`coalesce(${adVisits.mouseMoved}, false) or ${e.mouseMoved ?? false}`,
      maxScrollDepth: sql`greatest(coalesce(${adVisits.maxScrollDepth}, 0), ${e.maxScrollDepth ?? 0})`,
      clickCount: sql`greatest(${adVisits.clickCount}, ${e.clickCount ?? 0})`,
      converted: sql`${adVisits.converted} or ${e.converted ?? false}`,
      updatedAt: new Date(),
    })
    .where(eq(adVisits.sessionId, e.sessionId));
}

// ─────────────────────────── dashboard ───────────────────────────

export interface DashboardStats {
  adClicks: { d1: number; d7: number; d30: number };
  flaggedClicks: number;
  estimatedWastedSpend: number;
  adConversionRate: number;
  pctFlagged: number;
  flaggedIpsCount: number;
}

const adClick = isNotNull(adVisits.gclid);

function countSince(days: number, extra?: ReturnType<typeof and>) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return requireDb()
    .select({ n: sql<number>`count(*)` })
    .from(adVisits)
    .where(extra ? and(gte(adVisits.createdAt, since), extra) : gte(adVisits.createdAt, since))
    .then((r) => Number(r[0]?.n ?? 0));
}

export async function getDashboardStats(avgCpc: number): Promise<DashboardStats | null> {
  if (!isDbConfigured) return null;
  const db = requireDb();
  const [d1, d7, d30, flagged30, conv30, flaggedIpsCount] = await Promise.all([
    countSince(1, and(adClick)),
    countSince(7, and(adClick)),
    countSince(30, and(adClick)),
    countSince(30, and(adClick, gte(adVisits.fraudScore, FLAGGED))),
    countSince(30, and(adClick, eq(adVisits.converted, true))),
    db
      .select({ n: sql<number>`count(*)` })
      .from(flaggedIps)
      .where(eq(flaggedIps.status, 'flagged'))
      .then((r) => Number(r[0]?.n ?? 0)),
  ]);

  return {
    adClicks: { d1, d7, d30 },
    flaggedClicks: flagged30,
    estimatedWastedSpend: Math.round(flagged30 * avgCpc * 100) / 100,
    adConversionRate: d30 > 0 ? Math.round((conv30 / d30) * 1000) / 10 : 0,
    pctFlagged: d30 > 0 ? Math.round((flagged30 / d30) * 1000) / 10 : 0,
    flaggedIpsCount,
  };
}

export interface FlaggedFilters {
  status?: FlaggedStatus;
  search?: string;
}

export async function listFlaggedIps(f: FlaggedFilters = {}) {
  if (!isDbConfigured) return [];
  const conds = [];
  if (f.status) conds.push(eq(flaggedIps.status, f.status));
  if (f.search) conds.push(ilike(flaggedIps.ipAddress, `%${f.search}%`));
  return requireDb()
    .select()
    .from(flaggedIps)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(flaggedIps.fraudScore), desc(flaggedIps.lastSeen))
    .limit(500);
}

export async function getFlaggedIp(ip: string) {
  if (!isDbConfigured) return null;
  const [row] = await requireDb().select().from(flaggedIps).where(eq(flaggedIps.ipAddress, ip)).limit(1);
  return row ?? null;
}

export interface VisitFilters {
  minScore?: number;
  gclidOnly?: boolean;
}

export async function listVisits(f: VisitFilters = {}) {
  if (!isDbConfigured) return [];
  const conds = [];
  if (f.minScore != null) conds.push(gte(adVisits.fraudScore, f.minScore));
  if (f.gclidOnly) conds.push(adClick);
  return requireDb()
    .select()
    .from(adVisits)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(adVisits.createdAt))
    .limit(300);
}

export async function getVisit(id: string) {
  if (!isDbConfigured) return null;
  const [row] = await requireDb().select().from(adVisits).where(eq(adVisits.id, id)).limit(1);
  return row ?? null;
}

/** IPs that should be excluded from ad campaigns (Google Ads IP-exclusion list). */
export async function getExclusionIps(): Promise<string[]> {
  if (!isDbConfigured) return [];
  const rows = await requireDb()
    .select({ ip: flaggedIps.ipAddress })
    .from(flaggedIps)
    .where(eq(flaggedIps.status, 'excluded'));
  return rows.map((r) => r.ip);
}

export interface RefundRow {
  ipAddress: string;
  totalClicks: number;
  fraudScore: number;
  country: string | null;
  isp: string | null;
  lastSeen: Date | null;
}

/** Flagged / excluded IPs suitable for a Google Ads invalid-click refund claim. */
export async function getRefundRows(): Promise<RefundRow[]> {
  if (!isDbConfigured) return [];
  const rows = await requireDb()
    .select({
      ipAddress: flaggedIps.ipAddress,
      totalClicks: flaggedIps.totalClicks,
      fraudScore: flaggedIps.fraudScore,
      country: flaggedIps.country,
      isp: flaggedIps.isp,
      lastSeen: flaggedIps.lastSeen,
    })
    .from(flaggedIps)
    .where(gte(flaggedIps.fraudScore, FLAGGED))
    .orderBy(desc(flaggedIps.fraudScore));
  return rows;
}

// ─────────────────────────── settings ───────────────────────────

const AVG_CPC_KEY = 'clickprotection.avgCpc';

export async function getAvgCpc(): Promise<number> {
  if (!isDbConfigured) return 0;
  const [row] = await requireDb().select().from(siteSettings).where(eq(siteSettings.key, AVG_CPC_KEY)).limit(1);
  const v = row?.value;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function setAvgCpc(value: number, userId: string): Promise<void> {
  await requireDb()
    .insert(siteSettings)
    .values({ key: AVG_CPC_KEY, value, updatedBy: userId })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedBy: userId, updatedAt: new Date() } });
}

export async function getLastDetectionRun(): Promise<Date | null> {
  if (!isDbConfigured) return null;
  const [row] = await requireDb()
    .select({ createdAt: backgroundJobs.createdAt })
    .from(backgroundJobs)
    .where(eq(backgroundJobs.type, DETECTION_JOB_TYPE))
    .orderBy(desc(backgroundJobs.createdAt))
    .limit(1);
  return row?.createdAt ?? null;
}
