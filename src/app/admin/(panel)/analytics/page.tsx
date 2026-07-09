import { desc, eq, gte, sql } from 'drizzle-orm';
import { Activity, Eye, MousePointerClick, CalendarClock } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { analyticsEvents } from '@/db/schema';
import { PageTitle, StatCard, NotConfigured, Card, DataTable, Th, Td, EmptyState } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  await requirePermission('analytics.view');

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title="Analytics" subtitle="First-party traffic and engagement events" />
        <NotConfigured message="Connect a database to capture and view analytics events." />
      </>
    );
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [total, pageViews, formSubmits, lastWeek, topPages, recent] = await Promise.all([
    db.select({ n: sql<number>`count(*)` }).from(analyticsEvents).then((r) => Number(r[0]?.n ?? 0)),
    db
      .select({ n: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.type, 'page_view'))
      .then((r) => Number(r[0]?.n ?? 0)),
    db
      .select({ n: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.type, 'form_submit'))
      .then((r) => Number(r[0]?.n ?? 0)),
    db
      .select({ n: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, weekAgo))
      .then((r) => Number(r[0]?.n ?? 0)),
    db
      .select({ path: analyticsEvents.path, n: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.type, 'page_view'))
      .groupBy(analyticsEvents.path)
      .orderBy(desc(sql`count(*)`))
      .limit(15),
    db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt)).limit(20),
  ]);

  return (
    <>
      <PageTitle title="Analytics" subtitle="First-party traffic and engagement events" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total events" value={total} icon={Activity} accent />
        <StatCard label="Page views" value={pageViews} icon={Eye} />
        <StatCard label="Form submits" value={formSubmits} icon={MousePointerClick} />
        <StatCard label="Last 7 days" value={lastWeek} icon={CalendarClock} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Top pages</h2>
          {topPages.length === 0 ? (
            <EmptyState message="No page views recorded yet." />
          ) : (
            <DataTable
              head={
                <>
                  <Th>Path</Th>
                  <Th className="text-right">Views</Th>
                </>
              }
            >
              {topPages.map((p, i) => (
                <tr key={`${p.path ?? 'unknown'}-${i}`} className="hover:bg-slate-50">
                  <Td className="font-medium text-slate-900">{p.path ?? '—'}</Td>
                  <Td className="text-right tabular-nums">{Number(p.n)}</Td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Recent events</h2>
          {recent.length === 0 ? (
            <EmptyState message="No events recorded yet." />
          ) : (
            <DataTable
              head={
                <>
                  <Th>Type</Th>
                  <Th>Path</Th>
                  <Th>Locale</Th>
                  <Th>Country</Th>
                  <Th>When</Th>
                </>
              }
            >
              {recent.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <Td className="font-medium text-slate-900">{e.type}</Td>
                  <Td>{e.path ?? '—'}</Td>
                  <Td className="uppercase">{e.locale ?? '—'}</Td>
                  <Td className="uppercase">{e.country ?? '—'}</Td>
                  <Td>{e.createdAt.toLocaleString()}</Td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">How events are captured</h2>
        <p className="mt-2 text-sm text-slate-500">
          Events are recorded via the public tracking endpoint at{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">POST /api/track</code>, which
          accepts a JSON body of <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">{'{ type, path, locale, referrer, metadata }'}</code>.
          For third-party measurement, GA4 / GTM containers can be configured in the SEO settings.
        </p>
      </Card>
    </>
  );
}
