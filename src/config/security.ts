/** Bot-protection config. Turnstile is optional; enforced only when the secret is set. */
export const security = {
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
  turnstileSecret: process.env.TURNSTILE_SECRET ?? '',
} as const;

/** Server-side enforcement requires the secret. */
export const turnstileEnforced = Boolean(security.turnstileSecret);
