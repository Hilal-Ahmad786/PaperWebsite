'use client';

import { useEffect } from 'react';

/**
 * Client-side visitor tracker. Runs on every public page:
 *  - resolves a session id,
 *  - computes a lightweight device fingerprint,
 *  - reports the visit + cumulative behavioral signals,
 *  - flags a conversion when a `cp:conversion` window event fires.
 * All network calls are fire-and-forget; nothing blocks rendering.
 */

const SID_KEY = 'cp_sid';
const METRICS_KEY = 'cp_m';
const VISIT_SENT_KEY = 'cp_visit_sent';

type Metrics = { t: number; mouse: boolean; scroll: number; clicks: number; conv: boolean };

function sessionId(): string {
  let sid = sessionStorage.getItem(SID_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SID_KEY, sid);
  }
  return sid;
}

function hash32(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

function canvasSignature(): { sig: string; ok: boolean } {
  try {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    if (!ctx) return { sig: '', ok: false };
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = '#069';
    ctx.fillText('pmw-cp-7', 2, 2);
    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.fillText('pmw-cp-7', 4, 4);
    const data = c.toDataURL();
    return { sig: data, ok: data.length > 64 };
  } catch {
    return { sig: '', ok: false };
  }
}

function readMetrics(): Metrics {
  try {
    const raw = sessionStorage.getItem(METRICS_KEY);
    if (raw) return JSON.parse(raw) as Metrics;
  } catch {
    /* ignore */
  }
  return { t: 0, mouse: false, scroll: 0, clicks: 0, conv: false };
}

export function ClickProtectionTracker() {
  useEffect(() => {
    const sid = sessionId();
    const params = new URLSearchParams(window.location.search);
    const metrics = readMetrics();
    const pageStart = Date.now();

    if (!sessionStorage.getItem(VISIT_SENT_KEY)) {
      const canvas = canvasSignature();
      const screen = `${window.screen.width}x${window.screen.height}`;
      const fpInput = [
        screen,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        navigator.language,
        navigator.platform,
        String(navigator.hardwareConcurrency ?? ''),
        canvas.sig,
      ].join('|');
      const body = {
        sessionId: sid,
        gclid: params.get('gclid'),
        gbraid: params.get('gbraid'),
        wbraid: params.get('wbraid'),
        referrer: document.referrer || null,
        landingPage: window.location.pathname,
        utmSource: params.get('utm_source'),
        utmMedium: params.get('utm_medium'),
        utmCampaign: params.get('utm_campaign'),
        utmTerm: params.get('utm_term'),
        utmContent: params.get('utm_content'),
        fingerprintHash: hash32(fpInput),
        hasCanvas: canvas.ok,
        screen,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency ?? null,
      };
      fetch('/api/track/visit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => {});
      sessionStorage.setItem(VISIT_SENT_KEY, '1');
    }

    const onMouse = () => {
      metrics.mouse = true;
    };
    const onScroll = () => {
      const el = document.documentElement;
      const denom = el.scrollHeight - el.clientHeight;
      const pct = denom > 0 ? Math.round((el.scrollTop / denom) * 100) : 0;
      if (pct > metrics.scroll) metrics.scroll = Math.min(100, pct);
    };
    const onClick = () => {
      metrics.clicks += 1;
    };
    const onConversion = () => {
      metrics.conv = true;
      send(true);
    };

    function payload() {
      const t = Math.round(metrics.t + (Date.now() - pageStart) / 1000);
      return {
        sessionId: sid,
        timeOnPage: t,
        mouseMoved: metrics.mouse,
        maxScrollDepth: metrics.scroll,
        clickCount: metrics.clicks,
        converted: metrics.conv,
      };
    }

    function persist() {
      metrics.t = Math.round(metrics.t + (Date.now() - pageStart) / 1000);
      try {
        sessionStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
      } catch {
        /* ignore */
      }
    }

    function send(beacon = false) {
      const data = JSON.stringify(payload());
      if (beacon && navigator.sendBeacon) {
        navigator.sendBeacon('/api/track/engagement', new Blob([data], { type: 'application/json' }));
      } else {
        fetch('/api/track/engagement', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: data,
          keepalive: true,
        }).catch(() => {});
      }
    }

    window.addEventListener('mousemove', onMouse, { passive: true, once: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick, { passive: true });
    window.addEventListener('cp:conversion', onConversion);

    const timer = window.setTimeout(() => send(false), 12_000);
    const onHide = () => {
      if (document.visibilityState === 'hidden') {
        persist();
        send(true);
      }
    };
    document.addEventListener('visibilitychange', onHide);
    const onPageHide = () => {
      persist();
      send(true);
    };
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
      window.removeEventListener('cp:conversion', onConversion);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onPageHide);
      persist();
    };
  }, []);

  return null;
}
