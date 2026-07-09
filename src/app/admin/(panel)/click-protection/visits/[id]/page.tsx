import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { getAdminT } from '@/lib/admin/i18n';
import { isDbConfigured } from '@/db';
import { PageTitle, Card, Badge } from '@/components/admin/bits';
import { getVisit } from '@/db/repo/click-protection';

export const dynamic = 'force-dynamic';

function scoreColor(score: number): string {
  if (score >= 85) return 'text-red-600';
  if (score >= 75) return 'text-amber-600';
  return 'text-slate-700';
}

export default async function VisitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('clickprotection.read');
  const { t } = await getAdminT();
  const { id } = await params;

  if (!isDbConfigured) {
    return (
      <>
        <PageTitle title={t('cp.visits.detailTitle')} subtitle={t('cp.visits.detailSubtitle')} />
      </>
    );
  }

  const v = await getVisit(id);
  if (!v) notFound();

  const yesNo = (val?: boolean | null): string => (val ? t('common.yes') : t('common.no'));

  const network: [string, string | number | null | undefined][] = [
    [t('cp.detail.ipAddress'), v.ipAddress],
    [t('cp.col.country'), v.country],
    [t('cp.col.isp'), v.isp],
    [t('cp.detail.datacenter'), yesNo(v.isDatacenter)],
    [t('cp.detail.vpn'), yesNo(v.isVpn)],
    [t('cp.detail.proxy'), yesNo(v.isProxy)],
    [t('cp.detail.referrer'), v.referrer],
    [t('cp.detail.landingPage'), v.landingPage],
  ];

  const ad: [string, string | number | null | undefined][] = [
    ['gclid', v.gclid],
    ['gbraid', v.gbraid],
    ['wbraid', v.wbraid],
    ['utm_source', v.utmSource],
    ['utm_medium', v.utmMedium],
    ['utm_campaign', v.utmCampaign],
    ['utm_term', v.utmTerm],
    ['utm_content', v.utmContent],
  ];

  const device: [string, string | number | null | undefined][] = [
    [t('cp.detail.sessionId'), v.sessionId],
    [t('cp.detail.fingerprint'), v.fingerprintHash],
    [t('cp.detail.screen'), v.screen],
    [t('cp.detail.platform'), v.platform],
    [t('cp.detail.timezone'), v.timezone],
    [t('cp.detail.language'), v.language],
    [t('cp.detail.cpuCores'), v.hardwareConcurrency],
    [t('cp.detail.canvas'), yesNo(v.hasCanvas)],
  ];

  const engagement: [string, string | number | null | undefined][] = [
    [t('cp.detail.timeOnPage'), v.timeOnPage != null ? `${v.timeOnPage}s` : null],
    [t('cp.detail.maxScrollDepth'), v.maxScrollDepth != null ? `${v.maxScrollDepth}%` : null],
    [t('cp.detail.mouseMoved'), yesNo(v.mouseMoved)],
    [t('cp.detail.clickCount'), v.clickCount],
    [t('cp.col.converted'), yesNo(v.converted)],
  ];

  const sections: [string, [string, string | number | null | undefined][]][] = [
    [t('cp.section.network'), network],
    [t('cp.section.ad'), ad],
    [t('cp.section.device'), device],
    [t('cp.section.engagement'), engagement],
  ];

  return (
    <>
      <Link href="/admin/click-protection/visits" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> {t('cp.backToVisits')}
      </Link>
      <PageTitle
        title={v.ipAddress}
        subtitle={t('cp.visits.visitAt', { time: v.createdAt.toLocaleString() })}
        action={
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${scoreColor(v.fraudScore)}`}>{v.fraudScore}</span>
            {v.gclid ? <Badge value="flagged" label={t('cp.paid')} /> : <Badge value="draft" label={t('cp.organic')} />}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map(([heading, rows]) => (
          <Card key={heading} className="p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{heading}</h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {rows.map(([k, val]) => (
                <div key={k}>
                  <dt className="text-xs font-medium text-slate-400">{k}</dt>
                  <dd className="break-words text-sm text-slate-800">{val == null || val === '' ? '—' : val}</dd>
                </div>
              ))}
            </dl>
          </Card>
        ))}

        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('cp.section.userAgent')}</h2>
          <p className="break-words font-mono text-xs text-slate-700">{v.userAgent ?? '—'}</p>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('cp.fraudReasons')}</h2>
          {!v.fraudReasons || v.fraudReasons.length === 0 ? (
            <p className="text-sm text-slate-400">{t('cp.noSignals')}</p>
          ) : (
            <ul className="space-y-2">
              {v.fraudReasons.map((reason, i) => (
                <li key={`${reason.code}-${i}`} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="text-sm text-slate-700">{reason.label}</span>
                  <span className="text-xs font-semibold text-slate-500">+{reason.weight}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
