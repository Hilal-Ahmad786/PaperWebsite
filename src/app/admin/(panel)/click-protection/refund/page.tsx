import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { getAdminT } from '@/lib/admin/i18n';
import { isDbConfigured } from '@/db';
import { PageTitle, Card, NotConfigured, DataTable, Th, Td, EmptyState, LinkButton } from '@/components/admin/bits';
import { getRefundRows } from '@/db/repo/click-protection';
import { FRAUD_THRESHOLDS } from '@/lib/click-protection/config';

export const dynamic = 'force-dynamic';

function scoreColor(score: number): string {
  if (score >= 85) return 'text-red-600';
  if (score >= 75) return 'text-amber-600';
  return 'text-slate-700';
}

export default async function RefundReportPage() {
  await requirePermission('clickprotection.read');
  const { t } = await getAdminT();

  if (!isDbConfigured) {
    return (
      <>
        <PageTitle title={t('cp.refund.title')} subtitle={t('cp.refund.subtitle')} />
        <NotConfigured message={t('cp.refund.notConfigured')} />
      </>
    );
  }

  const rows = await getRefundRows();

  return (
    <>
      <Link href="/admin/click-protection" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> {t('cp.backToOverview')}
      </Link>
      <PageTitle
        title={t('cp.refund.title')}
        subtitle={t('cp.refund.subtitle')}
        action={
          rows.length > 0 ? (
            <LinkButton href="/admin/click-protection/refund/export" variant="secondary">
              <Download size={16} /> {t('common.exportCsv')}
            </LinkButton>
          ) : undefined
        }
      />

      <Card className="mb-6 p-6">
        <p className="text-sm leading-relaxed text-slate-600">
          {t('cp.refund.explainer', { threshold: FRAUD_THRESHOLDS.flagged })}
        </p>
      </Card>

      {rows.length === 0 ? (
        <EmptyState message={t('cp.refund.empty')} />
      ) : (
        <DataTable
          head={
            <>
              <Th>{t('cp.col.ip')}</Th>
              <Th>{t('cp.detail.totalClicks')}</Th>
              <Th>{t('cp.col.score')}</Th>
              <Th>{t('cp.col.country')}</Th>
              <Th>{t('cp.col.isp')}</Th>
              <Th>{t('cp.col.lastSeen')}</Th>
            </>
          }
        >
          {rows.map((r) => (
            <tr key={r.ipAddress} className="hover:bg-slate-50">
              <Td>
                <Link
                  href={`/admin/click-protection/flagged/${encodeURIComponent(r.ipAddress)}`}
                  className="font-medium text-slate-900 hover:text-emerald-600"
                >
                  {r.ipAddress}
                </Link>
              </Td>
              <Td>{r.totalClicks}</Td>
              <Td>
                <span className={`font-semibold ${scoreColor(r.fraudScore)}`}>{r.fraudScore}</span>
              </Td>
              <Td>{r.country ?? '—'}</Td>
              <Td className="max-w-[200px] truncate">{r.isp ?? '—'}</Td>
              <Td>{r.lastSeen?.toLocaleDateString() ?? '—'}</Td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}
