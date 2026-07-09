/**
 * Click-fraud scoring engine (pure). Two entry points:
 *   - `scoreVisit`        — per-visit signals (run after engagement is reported)
 *   - `scoreIpAggregate`  — per-IP signals (run by the aggregate job)
 *
 * Both return a 0-100 score, the contributing reasons, and a suggested status.
 * Neither touches the DB. Thresholds and weights live in `config.ts`.
 *
 * v1 policy: NO auto-exclusion. The highest auto status is "flagged (needs
 * review)"; "excluded" is only ever set by a human in the admin review queue.
 */
import {
  FRAUD_WEIGHTS as W,
  FRAUD_THRESHOLDS as T,
  SIGNAL_PARAMS as P,
  CONVERTED_SCORE_CAP,
  BOT_UA_PATTERNS,
} from './config';
import type {
  FraudReason,
  IpAggregateInput,
  IpIntel,
  ScoreResult,
  SuggestedStatus,
  VisitSignals,
} from './types';

/** Admin-facing labels for each reason code (English). */
const REASON_LABELS: Record<string, string> = {
  zero_engagement: 'No engagement (time < 3s, no mouse, no scroll)',
  bot_user_agent: 'Known bot / automation browser signature',
  suspicious_fingerprint: 'Missing or suspicious device fingerprint (no canvas)',
  datacenter_ip: 'Datacenter / hosting IP address',
  anonymizer_ip: 'VPN / proxy IP address',
  impossible_behavior: 'Inconsistent behavior (clicks recorded, no mouse movement)',
  no_client_engagement: 'Ad click logged server-side, no client response (JS never ran)',
  many_clicks_no_conversion: '5+ ad clicks in 24h with zero conversions',
  fingerprint_ip_rotation: 'Same fingerprint across multiple IPs (IP rotation)',
  click_velocity: 'Multiple clicks within seconds',
  aggregate_zero_engagement: 'Every visit from this IP has zero engagement',
};

function reason(code: string, weight: number): FraudReason {
  return { code, label: REASON_LABELS[code] ?? code, weight };
}

function isBotUserAgent(ua?: string | null): boolean {
  if (!ua) return false;
  return BOT_UA_PATTERNS.some((re) => re.test(ua));
}

function finalize(reasons: FraudReason[], protect: boolean): ScoreResult {
  let score = reasons.reduce((sum, r) => sum + r.weight, 0);
  let protectedLead = false;

  if (protect) {
    if (score > CONVERTED_SCORE_CAP) score = CONVERTED_SCORE_CAP;
    protectedLead = true;
  }
  score = Math.max(0, Math.min(100, score));

  const suggestedStatus: SuggestedStatus = !protect && score >= T.flagged ? 'flagged' : 'watching';
  const suggestsExclusion = !protect && score >= T.excluded;

  return { score, reasons, suggestedStatus, suggestsExclusion, protectedLead };
}

function ipIntelReasons(intel?: IpIntel | null): FraudReason[] {
  if (!intel) return [];
  if (intel.isDatacenter) return [reason('datacenter_ip', W.datacenterIp)];
  if ((intel.isVpn || intel.isProxy) && W.anonymizerIp > 0) {
    return [reason('anonymizer_ip', W.anonymizerIp)];
  }
  return [];
}

export function scoreVisit(v: VisitSignals, intel?: IpIntel | null): ScoreResult {
  const reasons: FraudReason[] = [];

  if (
    v.timeOnPage != null &&
    v.timeOnPage < P.zeroEngagementMaxSeconds &&
    v.mouseMoved === false &&
    (v.maxScrollDepth ?? 0) === 0
  ) {
    reasons.push(reason('zero_engagement', W.zeroEngagement));
  }

  if (isBotUserAgent(v.userAgent)) {
    reasons.push(reason('bot_user_agent', W.botUserAgent));
  }

  if (v.hasCanvas === false || v.fingerprintHash === '') {
    reasons.push(reason('suspicious_fingerprint', W.suspiciousFingerprint));
  }

  reasons.push(...ipIntelReasons(intel));

  if (v.clickCount != null && v.clickCount >= P.impossibleMinClicks && v.mouseMoved === false) {
    reasons.push(reason('impossible_behavior', W.impossibleBehavior));
  }

  if (v.gclid && v.serverLoggedNoClient === true) {
    reasons.push(reason('no_client_engagement', W.noClientEngagement));
  }

  const protect = v.converted === true || v.ipConvertedRecently === true;
  return finalize(reasons, protect);
}

export function scoreIpAggregate(a: IpAggregateInput, intel?: IpIntel | null): ScoreResult {
  const reasons: FraudReason[] = [];

  if (a.adClicks > P.manyClicksMin && a.conversions === 0) {
    reasons.push(reason('many_clicks_no_conversion', W.manyClicksNoConversion));
  }

  if (a.fingerprintMaxIpSpread >= P.fingerprintRotationMinIps) {
    reasons.push(reason('fingerprint_ip_rotation', W.fingerprintIpRotation));
  }

  if (a.maxClicksInVelocityWindow >= P.velocityMinClicks) {
    reasons.push(reason('click_velocity', W.clickVelocity));
  }

  if (
    a.adClicks >= P.aggregateZeroEngagementMinClicks &&
    a.totalVisits > 0 &&
    a.zeroEngagementVisits === a.totalVisits
  ) {
    reasons.push(reason('aggregate_zero_engagement', W.aggregateZeroEngagement));
  }

  reasons.push(...ipIntelReasons(intel));

  return finalize(reasons, a.convertedInProtectionWindow);
}
