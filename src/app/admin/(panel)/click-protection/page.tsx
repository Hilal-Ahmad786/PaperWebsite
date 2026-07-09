import Link from 'next/link';
import { MousePointerClick, ShieldAlert, Euro, Target, Percent, Fingerprint, Play } from 'lucide-react';
import { requirePermission, can } from '@/lib/auth/guard';
import { getAdminT } from '@/lib/admin/i18n';
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
  const { t } = await getAdminT();
  const sp = await searchParams;

  if (!isDbConfigured) {
    return (
      <>
        <PageTitle title={t('cp.title')} subtitle={t('cp.subtitle')} />
        <NotConfigured message={t('cp.notConfigured.dashboard')} />
      </>
    );
  }

  const avgCpc = await getAvgCpc();
  const [stats, lastRun] = await Promise.all([getDashboardStats(avgCpc), getLastDetectionRun()]);
  const canWrite = can(user, 'clickprotection.write');

  return (
    <>
      <PageTitle title={t('cp.title')} subtitle={t('cp.subtitle')} />
      <Flash ok={sp.ok} error={sp.error} />

      <div className="mb-6 flex flex-wrap gap-2">
        <LinkButton href="/admin/click-protection/flagged" variant="secondary">
          {t('cp.tab.flagged')}
        </LinkButton>
        <LinkButton href="/admin/click-protection/visits" variant="secondary">
          {t('cp.tab.visits')}
        </LinkButton>
        <LinkButton href="/admin/click-protection/refund" variant="secondary">
          {t('cp.tab.refund')}
        </LinkButton>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label={t('cp.stat.adClicks')} value={stats?.adClicks.d30 ?? 0} icon={MousePointerClick} accent
          hint={t('cp.stat.adClicksHint', { d7: stats?.adClicks.d7 ?? 0, d1: stats?.adClicks.d1 ?? 0 })} />
        <StatCard label={t('cp.stat.flaggedClicks')} value={stats?.flaggedClicks ?? 0} icon={ShieldAlert} />
        <StatCard label={t('cp.stat.wastedSpend')} value={`€${(stats?.estimatedWastedSpend ?? 0).toFixed(2)}`} icon={Euro}
          hint={t('cp.stat.wastedSpendHint', { cpc: avgCpc.toFixed(2) })} />
        <StatCard label={t('cp.stat.convRate')} value={`${stats?.adConversionRate ?? 0}%`} icon={Target} />
        <StatCard label={t('cp.stat.pctFlagged')} value={`${stats?.pctFlagged ?? 0}%`} icon={Percent} />
        <StatCard label={t('cp.stat.flaggedIps')} value={stats?.flaggedIpsCount ?? 0} icon={Fingerprint} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('cp.howItWorks')}</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            {t('cp.explainer.p1')}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">/api/cron/click-protection</code>
            {t('cp.explainer.p2')}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">CRON_SECRET</code>
            {t('cp.explainer.p3')}
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('cp.detection')}</h2>
          <p className="mb-4 text-sm text-slate-600">
            {t('cp.lastRun')} <span className="font-medium text-slate-800">{lastRun?.toLocaleString() ?? t('cp.never')}</span>
          </p>
          {canWrite ? (
            <div className="space-y-5">
              <form action={runJobNow}>
                <SubmitButton className="w-full">
                  <Play size={16} /> {t('cp.runDetection')}
                </SubmitButton>
              </form>
              <form action={saveAvgCpc} className="space-y-2 border-t border-slate-100 pt-4">
                <label className={labelClass} htmlFor="avgCpc">
                  {t('cp.avgCpc')}
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
                  <SubmitButton variant="secondary">{t('common.save')}</SubmitButton>
                </div>
              </form>
            </div>
          ) : (
            <p className="text-sm text-slate-400">{t('common.readOnly')}</p>
          )}
        </Card>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        {t('cp.rawFeed.pre')}{' '}
        <Link href="/admin/click-protection/visits" className="text-emerald-600 hover:text-emerald-700">
          {t('cp.rawFeed.link')}
        </Link>
        .
      </p>
    </>
  );
}
