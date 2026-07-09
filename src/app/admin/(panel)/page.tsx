import Link from 'next/link';
import { desc, gte, sql } from 'drizzle-orm';
import { Inbox, FileText, Tag, Image as ImageIcon, TrendingUp, Users } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { leads, contentEntries, stockOffers, mediaAssets, users, marketIndices } from '@/db/schema';
import { PageTitle, StatCard, NotConfigured, DataTable, Th, Td, Badge, EmptyState } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await requirePermission('dashboard.view');

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title="Dashboard" subtitle="Overview of inquiries, content and activity" />
        <NotConfigured message="Connect a database (set DATABASE_URL), then run the migrations and seed to populate the dashboard." />
      </>
    );
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [
    leadTotal,
    leadWeek,
    leadNew,
    insightPublished,
    offersAvailable,
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
    db
      .select({ n: sql<number>`count(*)` })
      .from(stockOffers)
      .where(sql`${stockOffers.status} = 'available'`)
      .then((r) => Number(r[0]?.n ?? 0)),
    db.select({ n: sql<number>`count(*)` }).from(mediaAssets).then((r) => Number(r[0]?.n ?? 0)),
    db.select({ n: sql<number>`count(*)` }).from(users).then((r) => Number(r[0]?.n ?? 0)),
    db.select({ n: sql<number>`count(*)` }).from(marketIndices).then((r) => Number(r[0]?.n ?? 0)),
    db.select().from(leads).orderBy(desc(leads.createdAt)).limit(8),
  ]);

  return (
    <>
      <PageTitle title="Dashboard" subtitle="Overview of inquiries, content and activity" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total inquiries" value={leadTotal} icon={Inbox} accent hint={`${leadWeek} in the last 7 days`} />
        <StatCard label="New / unhandled" value={leadNew} icon={Inbox} />
        <StatCard label="Published insights" value={insightPublished} icon={FileText} />
        <StatCard label="Available offers" value={offersAvailable} icon={Tag} />
        <StatCard label="Market indices" value={indicesCount} icon={TrendingUp} />
        <StatCard label="Media assets" value={mediaCount} icon={ImageIcon} />
        <StatCard label="Admin users" value={userCount} icon={Users} />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Latest inquiries</h2>
          <Link href="/admin/leads" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
            View all →
          </Link>
        </div>
        {recentLeads.length === 0 ? (
          <EmptyState message="No inquiries yet." />
        ) : (
          <DataTable
            head={
              <>
                <Th>Name</Th>
                <Th>Company</Th>
                <Th>Product</Th>
                <Th>Stage</Th>
                <Th>Received</Th>
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
