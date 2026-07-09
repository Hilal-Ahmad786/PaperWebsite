/**
 * ── TUNING SURFACE ───────────────────────────────────────────────────────────
 * Every weight, threshold and signal parameter lives here. Adjust these and
 * redeploy to retune detection without touching `scoring.ts`.
 */

/** Points added per signal. Set any weight to 0 to disable that signal. */
export const FRAUD_WEIGHTS = {
  zeroEngagement: 30,
  botUserAgent: 40,
  suspiciousFingerprint: 20,
  datacenterIp: 40,
  anonymizerIp: 20,
  impossibleBehavior: 25,
  noClientEngagement: 30,
  manyClicksNoConversion: 30,
  fingerprintIpRotation: 35,
  clickVelocity: 30,
  aggregateZeroEngagement: 40,
} as const;

/** Score → status. v1 NEVER auto-excludes; `excluded` is a manual action. */
export const FRAUD_THRESHOLDS = {
  flagged: 75,
  excluded: 85,
} as const;

export const SIGNAL_PARAMS = {
  zeroEngagementMaxSeconds: 3,
  impossibleMinClicks: 3,
  manyClicksMin: 5,
  manyClicksWindowHours: 24,
  velocityWindowSeconds: 10,
  velocityMinClicks: 3,
  fingerprintRotationMinIps: 3,
  aggregateZeroEngagementMinClicks: 5,
  noClientEngagementSeconds: 10,
} as const;

/** An IP/visit protected by a recent conversion can never exceed this score. */
export const CONVERTED_SCORE_CAP = 30;

/** An IP that converted within this many days is never flagged (real-lead protection). */
export const CONVERSION_PROTECTION_DAYS = 90;

/** IP-intelligence re-lookup TTL. */
export const IP_INTEL_TTL_DAYS = 30;

/** Visit-log retention (GDPR). Rows older than this are auto-purged. */
export const VISIT_RETENTION_DAYS = 90;

/** Known non-human user agents. A legitimate ad click never carries these. */
export const BOT_UA_PATTERNS: RegExp[] = [
  /headless/i,
  /phantomjs/i,
  /electron/i,
  /puppeteer/i,
  /playwright/i,
  /selenium/i,
  /webdriver/i,
  /python-requests/i,
  /aiohttp/i,
  /httpx/i,
  /\bcurl\//i,
  /\bwget\b/i,
  /libwww/i,
  /scrapy/i,
  /node-fetch/i,
  /\baxios\//i,
  /go-http-client/i,
  /okhttp/i,
  /java\//i,
  /\bbot\b/i,
  /crawler/i,
  /spider/i,
  /slurp/i,
  /bingbot/i,
  /yandexbot/i,
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i,
  /dotbot/i,
  /facebookexternalhit/i,
];

/** Your own / internal IPs — never logged or scored. Comma-separated env list. */
export function internalIps(): string[] {
  return (process.env.CLICK_PROTECTION_INTERNAL_IPS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isInternalIp(ip: string): boolean {
  return internalIps().includes(ip);
}
