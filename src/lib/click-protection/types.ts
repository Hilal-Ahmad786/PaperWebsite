/** Click-fraud detection contracts. Scoring is pure: it consumes plain signal
 *  objects (no DB access) so it is trivially testable and tunable. */

export interface FraudReason {
  code: string;
  label: string;
  weight: number;
}

export type FlaggedStatus = 'watching' | 'flagged' | 'excluded' | 'whitelisted';

/** v1 never auto-excludes: the highest auto status is "flagged". */
export type SuggestedStatus = 'watching' | 'flagged';

export interface IpIntel {
  isDatacenter: boolean;
  isVpn: boolean;
  isProxy: boolean;
  country?: string | null;
  isp?: string | null;
}

export interface VisitSignals {
  gclid?: string | null;
  ipAddress: string;
  userAgent?: string | null;
  fingerprintHash?: string | null;
  hasCanvas?: boolean | null;
  timeOnPage?: number | null;
  mouseMoved?: boolean | null;
  maxScrollDepth?: number | null;
  clickCount?: number | null;
  converted?: boolean | null;
  serverLoggedNoClient?: boolean | null;
  ipConvertedRecently?: boolean | null;
}

export interface IpAggregateInput {
  ipAddress: string;
  windowHours: number;
  adClicks: number;
  conversions: number;
  totalVisits: number;
  zeroEngagementVisits: number;
  maxClicksInVelocityWindow: number;
  fingerprintMaxIpSpread: number;
  convertedInProtectionWindow: boolean;
}

export interface ScoreResult {
  score: number;
  reasons: FraudReason[];
  suggestedStatus: SuggestedStatus;
  suggestsExclusion: boolean;
  protectedLead: boolean;
}
