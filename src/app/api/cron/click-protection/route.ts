import { runAggregateJob } from '@/lib/click-protection/aggregate';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Aggregate detection job entrypoint. Vercel Cron calls this with
 * `Authorization: Bearer ${CRON_SECRET}`. Manual runs must send the same header.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }
  try {
    const result = await runAggregateJob();
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error('[cron/click-protection]', err instanceof Error ? err.message : err);
    return Response.json({ ok: false, error: 'job_failed' }, { status: 500 });
  }
}
