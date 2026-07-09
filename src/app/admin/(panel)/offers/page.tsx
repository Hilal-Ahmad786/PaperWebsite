import Link from 'next/link';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { Plus } from 'lucide-react';
import { requirePermission, can } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { stockOffers } from '@/db/schema';
import { PageTitle, NotConfigured, DataTable, Th, Td, Badge, EmptyState, Flash, LinkButton } from '@/components/admin/bits';
import { pickLocalized } from '@/lib/admin/localized';
import { getAdminT } from '@/lib/admin/i18n';

export const dynamic = 'force-dynamic';

const STATUSES = ['available', 'reserved', 'sold', 'hidden'] as const;
type Status = (typeof STATUSES)[number];

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; ok?: string; error?: string }>;
}) {
  const user = await requirePermission('offers.read');
  const sp = await searchParams;
  const { t } = await getAdminT();

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title={t('offers.title')} subtitle={t('offers.subtitle')} />
        <NotConfigured message={t('offers.notConfigured')} />
      </>
    );
  }

  const activeStatus = STATUSES.includes(sp.status as Status) ? (sp.status as Status) : undefined;
  const rows = await db
    .select()
    .from(stockOffers)
    .where(activeStatus ? eq(stockOffers.status, activeStatus) : undefined)
    .orderBy(asc(stockOffers.sortOrder), desc(stockOffers.createdAt))
    .limit(300);

  const counts = await db
    .select({ status: stockOffers.status, n: sql<number>`count(*)` })
    .from(stockOffers)
    .groupBy(stockOffers.status);
  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, Number(c.n)]));

  const canWrite = can(user, 'offers.write');

  return (
    <>
      <PageTitle
        title={t('offers.title')}
        subtitle={t('offers.subtitle')}
        action={
          canWrite ? (
            <LinkButton href="/admin/offers/new">
              <Plus size={16} /> {t('offers.newOffer')}
            </LinkButton>
          ) : undefined
        }
      />
      <Flash ok={sp.ok} error={sp.error} />

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterPill href="/admin/offers" active={!activeStatus} label={t('common.all')} />
        {STATUSES.map((s) => (
          <FilterPill
            key={s}
            href={`/admin/offers?status=${s}`}
            active={activeStatus === s}
            label={`${t(`offers.status.${s}`)} (${countByStatus[s] ?? 0})`}
          />
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState message={t('offers.empty')} />
      ) : (
        <DataTable
          head={
            <>
              <Th>{t('common.title')}</Th>
              <Th>{t('offers.grade')}</Th>
              <Th>{t('offers.gsm')}</Th>
              <Th>{t('offers.qtyTons')}</Th>
              <Th>{t('offers.location')}</Th>
              <Th>{t('offers.price')}</Th>
              <Th>{t('common.status')}</Th>
              <Th>{t('common.sort')}</Th>
            </>
          }
        >
          {rows.map((o) => (
            <tr key={o.id} className="hover:bg-slate-50">
              <Td>
                <Link href={`/admin/offers/${o.id}`} className="font-medium text-slate-900 hover:text-emerald-600">
                  {pickLocalized(o.title) || '—'}
                </Link>
              </Td>
              <Td>{o.grade ?? '—'}</Td>
              <Td>{o.gsm ?? '—'}</Td>
              <Td>{o.quantityTons ?? '—'}</Td>
              <Td>{o.location ?? '—'}</Td>
              <Td>{o.price ?? '—'}</Td>
              <Td>
                <Badge value={o.status} label={t(`offers.status.${o.status}`)} />
              </Td>
              <Td>{o.sortOrder}</Td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}

function FilterPill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
        active ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </Link>
  );
}
