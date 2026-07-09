import Link from 'next/link';
import { MousePointerClick, ShieldAlert, Euro, Target, Percent, Fingerprint, Play } from 'lucide-react';
import { requirePermission, can } from '@/lib/auth/guard';
import { isDbConfigured } from '@/db';
import { PageTitle, StatCard, Card, NotConfigured, Flash, LinkButton, inputClass, labelClass } from '@/components/admin/bits';
import { SubmitButton } from '@/components/admin/form-controls';
import { getAvgCpc, getDashboardStats, getLastDetectionRun } from '@/db/repo/click-protection';
import { runJobNow, saveAvgCpc } from '@/lib/admin/click-protection-actions';

export const dynamic = 'force-dynamic';

export default async function ClickProtectionPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requirePermission('clickprotection.read');
  const sp = await searchParams;

  if (!isDbConfigured) {
    return (
      <>
        <PageTitle title="Click Protection" subtitle="Detect and block fraudulent paid-ad clicks" />
        <NotConfigured message="Connect a database to start scoring paid-ad visits for click fraud." />
      </>
    );
  }

  const avgCpc = await getAvgCpc();
  const [stats, lastRun] = await Promise.all([getDashboardStats(avgCpc), getLastDetectionRun()]);
  const canWrite = can(user, 'clickprotection.write');

  return (
    <>
      <PageTitle title="Click Protection" subtitle="Detect and block fraudulent paid-ad clicks" />
      <Flash ok={sp.ok} error={sp.error} />

      <div className="mb-6 flex flex-wrap gap-2">
        <LinkButton href="/admin/click-protection/flagged" variant="secondary">
          Flagged IPs
        </LinkButton>
        <LinkButton href="/admin/click-protection/visits" variant="secondary">
          Visits
        </LinkButton>
        <LinkButton href="/admin/click-protection/refund" variant="secondary">
          Refund report
        </LinkButton>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Ad clicks (30d)" value={stats?.adClicks.d30 ?? 0} icon={MousePointerClick} accent
          hint={`${stats?.adClicks.d7 ?? 0} in 7d · ${stats?.adClicks.d1 ?? 0} today`} />
        <StatCard label="Flagged clicks (30d)" value={stats?.flaggedClicks ?? 0} icon={ShieldAlert} />
        <StatCard label="Est. wasted spend" value={`€${(stats?.estimatedWastedSpend ?? 0).toFixed(2)}`} icon={Euro}
          hint={`at €${avgCpc.toFixed(2)} avg CPC`} />
        <StatCard label="Ad conversion rate" value={`${stats?.adConversionRate ?? 0}%`} icon={Target} />
        <StatCard label="% flagged" value={`${stats?.pctFlagged ?? 0}%`} icon={Percent} />
        <StatCard label="Flagged IPs" value={stats?.flaggedIpsCount ?? 0} icon={Fingerprint} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">How it works</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            This module scores paid-ad (gclid) visits for click fraud using device fingerprints, IP intelligence
            (datacenter / VPN / proxy) and behavioral signals. IPs that cross the fraud threshold are flagged and can
            be exported for a Google Ads IP-exclusion upload or an invalid-click refund claim. Detection runs
            automatically via <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">/api/cron/click-protection</code>{' '}
            (set <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">CRON_SECRET</code> and add a Vercel cron), or
            on demand below.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Detection</h2>
          <p className="mb-4 text-sm text-slate-600">
            Last run: <span className="font-medium text-slate-800">{lastRun?.toLocaleString() ?? 'never'}</span>
          </p>
          {canWrite ? (
            <div className="space-y-5">
              <form action={runJobNow}>
                <SubmitButton className="w-full">
                  <Play size={16} /> Run detection now
                </SubmitButton>
              </form>
              <form action={saveAvgCpc} className="space-y-2 border-t border-slate-100 pt-4">
                <label className={labelClass} htmlFor="avgCpc">
                  Average CPC (€)
                </label>
                <div className="flex gap-2">
                  <input
                    id="avgCpc"
                    name="avgCpc"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={avgCpc || ''}
                    placeholder="0.00"
                    className={inputClass}
                  />
                  <SubmitButton variant="secondary">Save</SubmitButton>
                </div>
              </form>
            </div>
          ) : (
            <p className="text-sm text-slate-400">You have read-only access.</p>
          )}
        </Card>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Need the raw feed? See the{' '}
        <Link href="/admin/click-protection/visits" className="text-emerald-600 hover:text-emerald-700">
          visits log
        </Link>
        .
      </p>
    </>
  );
}
