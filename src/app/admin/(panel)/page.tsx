import Link from 'next/link';
import { desc, gte, sql } from 'drizzle-orm';
import { Inbox, FileText, Image as ImageIcon, TrendingUp, Users } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { getAdminT } from '@/lib/admin/i18n';
import { isDbConfigured, db } from '@/db';
import { leads, contentEntries, mediaAssets, users, marketIndices } from '@/db/schema';
import { PageTitle, StatCard, NotConfigured, DataTable, Th, Td, Badge, EmptyState } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await requirePermission('dashboard.view');
  const { t } = await getAdminT();

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />
        <NotConfigured message={t('dashboard.notConfigured')} />
      </>
    );
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [
    leadTotal,
    leadWeek,
    leadNew,
    insightPublished,
    mediaCount,
    userCount,
    indicesCount,
    recentLeads,
  ] = await Promise.all([
    db.select({ n: sql<number>`count(*)` }).from(leads).then((r) => Number(r[0]?.n ?? 0)),
    db
      .select({ n: sql<number>`count(*)` })
      .from(leads)
      .where(gte(leads.createdAt, weekAgo))
      .then((r) => Number(r[0]?.n ?? 0)),
    db
      .select({ n: sql<number>`count(*)` })
      .from(leads)
      .where(sql`${leads.stage} = 'new'`)
      .then((r) => Number(r[0]?.n ?? 0)),
    db
      .select({ n: sql<number>`count(*)` })
      .from(contentEntries)
      .where(sql`${contentEntries.status} = 'published'`)
      .then((r) => Number(r[0]?.n ?? 0)),
    db.select({ n: sql<number>`count(*)` }).from(mediaAssets).then((r) => Number(r[0]?.n ?? 0)),
    db.select({ n: sql<number>`count(*)` }).from(users).then((r) => Number(r[0]?.n ?? 0)),
    db.select({ n: sql<number>`count(*)` }).from(marketIndices).then((r) => Number(r[0]?.n ?? 0)),
    db.select().from(leads).orderBy(desc(leads.createdAt)).limit(8),
  ]);

  return (
    <>
      <PageTitle title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t('dashboard.totalInquiries')} value={leadTotal} icon={Inbox} accent hint={t('dashboard.inLast7Days', { count: leadWeek })} />
        <StatCard label={t('dashboard.newUnhandled')} value={leadNew} icon={Inbox} />
        <StatCard label={t('dashboard.publishedInsights')} value={insightPublished} icon={FileText} />
        <StatCard label={t('dashboard.marketIndices')} value={indicesCount} icon={TrendingUp} />
        <StatCard label={t('dashboard.mediaAssets')} value={mediaCount} icon={ImageIcon} />
        <StatCard label={t('dashboard.adminUsers')} value={userCount} icon={Users} />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.latestInquiries')}</h2>
          <Link href="/admin/leads" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
            {t('common.viewAll')} →
          </Link>
        </div>
        {recentLeads.length === 0 ? (
          <EmptyState message={t('dashboard.noInquiries')} />
        ) : (
          <DataTable
            head={
              <>
                <Th>{t('common.name')}</Th>
                <Th>{t('leads.col.company')}</Th>
                <Th>{t('leads.col.product')}</Th>
                <Th>{t('leads.col.stage')}</Th>
                <Th>{t('common.received')}</Th>
              </>
            }
          >
            {recentLeads.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <Td>
                  <Link href={`/admin/leads/${l.id}`} className="font-medium text-slate-900 hover:text-emerald-600">
                    {l.name}
                  </Link>
                </Td>
                <Td>{l.company ?? '—'}</Td>
                <Td>{l.product ?? '—'}</Td>
                <Td>
                  <Badge value={l.stage} />
                </Td>
                <Td>{l.createdAt.toLocaleDateString()}</Td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
    </>
  );
}
