import Link from 'next/link';
import { asc } from 'drizzle-orm';
import { Plus } from 'lucide-react';
import { requirePermission, can } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { marketIndices } from '@/db/schema';
import { PageTitle, NotConfigured, DataTable, Th, Td, Badge, EmptyState, Flash, LinkButton } from '@/components/admin/bits';
import { pickLocalized } from '@/lib/admin/localized';
import { getAdminT } from '@/lib/admin/i18n';

export const dynamic = 'force-dynamic';

const TREND_DISPLAY: Record<string, { symbol: string; className: string }> = {
  up: { symbol: '▲', className: 'text-emerald-600' },
  down: { symbol: '▼', className: 'text-red-600' },
  flat: { symbol: '–', className: 'text-slate-400' },
};

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requirePermission('market.read');
  const sp = await searchParams;
  const { t } = await getAdminT();

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title={t('market.title')} subtitle={t('market.subtitle')} />
        <NotConfigured message={t('market.notConfigured')} />
      </>
    );
  }

  const rows = await db.select().from(marketIndices).orderBy(asc(marketIndices.sortOrder));

  const canWrite = can(user, 'market.write');

  return (
    <>
      <PageTitle
        title={t('market.title')}
        subtitle={t('market.subtitle')}
        action={
          canWrite ? (
            <LinkButton href="/admin/market/new">
              <Plus size={16} /> {t('market.newIndex')}
            </LinkButton>
          ) : undefined
        }
      />
      <Flash ok={sp.ok} error={sp.error} />

      {rows.length === 0 ? (
        <EmptyState message={t('market.empty')} />
      ) : (
        <DataTable
          head={
            <>
              <Th>{t('market.code')}</Th>
              <Th>{t('market.label')}</Th>
              <Th>{t('market.value')}</Th>
              <Th>{t('market.unit')}</Th>
              <Th>{t('market.changePct')}</Th>
              <Th>{t('market.trend')}</Th>
              <Th>{t('market.region')}</Th>
              <Th>{t('market.activeQ')}</Th>
              <Th>{t('common.sort')}</Th>
            </>
          }
        >
          {rows.map((m) => {
            const trend = TREND_DISPLAY[m.trend ?? 'flat'] ?? TREND_DISPLAY.flat;
            return (
              <tr key={m.id} className="hover:bg-slate-50">
                <Td>
                  <Link href={`/admin/market/${m.id}`} className="font-medium text-slate-900 hover:text-emerald-600">
                    {m.code}
                  </Link>
                </Td>
                <Td>{pickLocalized(m.label) || '—'}</Td>
                <Td>{m.value ?? '—'}</Td>
                <Td>{m.unit ?? '—'}</Td>
                <Td>{m.changePct ?? '—'}</Td>
                <Td>
                  <span className={`font-semibold ${trend.className}`}>{trend.symbol}</span>
                </Td>
                <Td>{m.region ?? '—'}</Td>
                <Td>
                  <Badge value={m.isActive ? 'available' : 'hidden'} label={m.isActive ? t('market.active') : t('market.inactive')} />
                </Td>
                <Td>{m.sortOrder}</Td>
              </tr>
            );
          })}
        </DataTable>
      )}
    </>
  );
}
