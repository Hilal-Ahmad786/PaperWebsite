'use client';

import { useEffect } from 'react';
import { security } from '@/config/security';

/**
 * Cloudflare Turnstile widget (invisible/managed captcha). Renders only when
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is set; otherwise nothing renders and the
 * server-side verify is a no-op, so the form works with or without it.
 *
 * Uses implicit rendering: Cloudflare injects a hidden `cf-turnstile-response`
 * input into the enclosing <form>, which the form reads on submit.
 */
export function TurnstileWidget() {
  const siteKey = security.turnstileSiteKey;

  useEffect(() => {
    if (!siteKey) return;
    if (document.querySelector('script[data-turnstile]')) return;
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true;
    s.defer = true;
    s.setAttribute('data-turnstile', '1');
    document.head.appendChild(s);
  }, [siteKey]);

  if (!siteKey) return null;
  return <div className="cf-turnstile" data-sitekey={siteKey} data-theme="dark" />;
}
