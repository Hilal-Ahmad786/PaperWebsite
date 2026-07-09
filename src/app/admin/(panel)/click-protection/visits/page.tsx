import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { getAdminT } from '@/lib/admin/i18n';
import { isDbConfigured } from '@/db';
import { PageTitle, NotConfigured, DataTable, Th, Td, EmptyState, Flash } from '@/components/admin/bits';
import { listVisits } from '@/db/repo/click-protection';
import { FRAUD_THRESHOLDS } from '@/lib/click-protection/config';

export const dynamic = 'force-dynamic';

function scoreColor(score: number): string {
  if (score >= 85) return 'text-red-600';
  if (score >= 75) return 'text-amber-600';
  return 'text-slate-700';
}

function YesNo({ value, yes, no }: { value?: boolean | null; yes: string; no: string }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        value ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-slate-100 text-slate-500 ring-slate-500/20'
      }`}
    >
      {value ? yes : no}
    </span>
  );
}

export default async function VisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ minScore?: string; gclidOnly?: string; ok?: string; error?: string }>;
}) {
  await requirePermission('clickprotection.read');
  const { t } = await getAdminT();
  const sp = await searchParams;

  if (!isDbConfigured) {
    return (
      <>
        <PageTitle title={t('cp.visits.title')} subtitle={t('cp.visits.subtitle')} />
        <NotConfigured message={t('cp.visits.notConfigured')} />
      </>
    );
  }

  const minScoreOn = sp.minScore === String(FRAUD_THRESHOLDS.flagged);
  const gclidOnly = sp.gclidOnly === '1';
  const rows = await listVisits({
    minScore: minScoreOn ? FRAUD_THRESHOLDS.flagged : undefined,
    gclidOnly,
  });

  const buildHref = (next: { minScore?: boolean; gclidOnly?: boolean }) => {
    const params = new URLSearchParams();
    const wantScore = next.minScore ?? minScoreOn;
    const wantGclid = next.gclidOnly ?? gclidOnly;
    if (wantScore) params.set('minScore', String(FRAUD_THRESHOLDS.flagged));
    if (wantGclid) params.set('gclidOnly', '1');
    const qs = params.toString();
    return qs ? `/admin/click-protection/visits?${qs}` : '/admin/click-protection/visits';
  };

  return (
    <>
      <Link href="/admin/click-protection" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> {t('cp.backToOverview')}
      </Link>
      <PageTitle title={t('cp.visits.title')} subtitle={t('cp.visits.subtitle')} />
      <Flash ok={sp.ok} error={sp.error} />

      <div className="mb-4 flex flex-wrap gap-2">
        <Toggle href={buildHref({ gclidOnly: !gclidOnly })} active={gclidOnly} label={t('cp.paidClicksOnly')} />
        <Toggle href={buildHref({ minScore: !minScoreOn })} active={minScoreOn} label={t('cp.scoreAtLeast', { score: FRAUD_THRESHOLDS.flagged })} />
      </div>

      {rows.length === 0 ? (
        <EmptyState message={t('cp.visits.empty')} />
      ) : (
        <DataTable
          head={
            <>
              <Th>{t('cp.col.time')}</Th>
              <Th>{t('cp.col.ip')}</Th>
              <Th>{t('cp.col.score')}</Th>
              <Th>{t('cp.col.paid')}</Th>
              <Th>{t('cp.col.country')}</Th>
              <Th>{t('cp.col.device')}</Th>
              <Th>{t('cp.col.engagement')}</Th>
              <Th>{t('cp.col.converted')}</Th>
            </>
          }
        >
          {rows.map((v) => (
            <tr key={v.id} className="hover:bg-slate-50">
              <Td>
                <Link
                  href={`/admin/click-protection/visits/${v.id}`}
                  className="font-medium text-slate-900 hover:text-emerald-600"
                >
                  {v.createdAt.toLocaleString()}
                </Link>
              </Td>
              <Td>{v.ipAddress}</Td>
              <Td>
                <span className={`font-semibold ${scoreColor(v.fraudScore)}`}>{v.fraudScore}</span>
              </Td>
              <Td>
                <YesNo value={!!v.gclid} yes={t('common.yes')} no={t('common.no')} />
              </Td>
              <Td>{v.country ?? '—'}</Td>
              <Td className="max-w-[160px] truncate text-xs text-slate-500">
                {[v.platform, v.screen].filter(Boolean).join(' · ') || '—'}
              </Td>
              <Td className="text-xs text-slate-500">
                {v.timeOnPage != null ? `${v.timeOnPage}s` : '—'} · {v.maxScrollDepth ?? 0}% · mouse {v.mouseMoved ? '✓' : '✗'}
              </Td>
              <Td>
                <YesNo value={v.converted} yes={t('common.yes')} no={t('common.no')} />
              </Td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}

function Toggle({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </Link>
  );
}
