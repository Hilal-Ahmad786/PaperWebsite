import { security, turnstileEnforced } from '@/config/security';

/** Verify a Cloudflare Turnstile token. Returns true when enforcement is off. */
export async function verifyTurnstile(token: string | null, ip?: string | null): Promise<boolean> {
  if (!turnstileEnforced) return true;
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: security.turnstileSecret,
        response: token,
        ...(ip ? { remoteip: ip } : {}),
      }),
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}
