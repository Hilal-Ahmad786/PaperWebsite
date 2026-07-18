import { and, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import { Activity, Eye, MousePointerClick, PhoneCall } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { analyticsEvents } from '@/db/schema';
import { PageTitle, StatCard, NotConfigured, Card, DataTable, Th, Td, EmptyState } from '@/components/admin/bits';
import { getAdminT } from '@/lib/admin/i18n';
import { DateRangeFilter } from '@/components/admin/DateRangeFilter';
import { resolveDateRange } from '@/lib/admin/date-range';

export const dynamic = 'force-dynamic';

const CONTACT_CLICK_TYPES = ['phone_click', 'whatsapp_click', 'email_click'];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  await requirePermission('analytics.view');
  const { t } = await getAdminT();
  const sp = await searchParams;

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title={t('analytics.title')} subtitle={t('analytics.subtitle')} />
        <NotConfigured message={t('analytics.notConfigured')} />
      </>
    );
  }

  const range = resolveDateRange(sp, 'all');
  const dateCond = and(
    range.from ? gte(analyticsEvents.createdAt, range.from) : undefined,
    range.to ? lte(analyticsEvents.createdAt, range.to) : undefined,
  );

  const [total, pageViews, formSubmits, contactClicks, topPages, recent] = await Promise.all([
    db.select({ n: sql<number>`count(*)` }).from(analyticsEvents).where(dateCond).then((r) => Number(r[0]?.n ?? 0)),
    db
      .select({ n: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.type, 'page_view'), dateCond))
      .then((r) => Number(r[0]?.n ?? 0)),
    db
      .select({ n: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.type, 'form_submit'), dateCond))
      .then((r) => Number(r[0]?.n ?? 0)),
    db
      .select({ n: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(and(inArray(analyticsEvents.type, CONTACT_CLICK_TYPES), dateCond))
      .then((r) => Number(r[0]?.n ?? 0)),
    db
      .select({ path: analyticsEvents.path, n: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.type, 'page_view'), dateCond))
      .groupBy(analyticsEvents.path)
      .orderBy(desc(sql`count(*)`))
      .limit(15),
    db.select().from(analyticsEvents).where(dateCond).orderBy(desc(analyticsEvents.createdAt)).limit(20),
  ]);

  return (
    <>
      <PageTitle title={t('analytics.title')} subtitle={t('analytics.subtitle')} />

      <DateRangeFilter
        basePath="/admin/analytics"
        active={range.key}
        from={range.fromParam}
        to={range.toParam}
        t={t}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t('analytics.totalEvents')} value={total} icon={Activity} accent />
        <StatCard label={t('analytics.pageViews')} value={pageViews} icon={Eye} />
        <StatCard label={t('analytics.formSubmits')} value={formSubmits} icon={MousePointerClick} />
        <StatCard label={t('analytics.contactClicks')} value={contactClicks} icon={PhoneCall} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">{t('analytics.topPages')}</h2>
          {topPages.length === 0 ? (
            <EmptyState message={t('analytics.noPageViews')} />
          ) : (
            <DataTable
              head={
                <>
                  <Th>{t('analytics.path')}</Th>
                  <Th className="text-right">{t('analytics.views')}</Th>
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
          <h2 className="mb-3 text-lg font-semibold text-slate-900">{t('analytics.recentEvents')}</h2>
          {recent.length === 0 ? (
            <EmptyState message={t('analytics.noEvents')} />
          ) : (
            <DataTable
              head={
                <>
                  <Th>{t('common.type')}</Th>
                  <Th>{t('analytics.path')}</Th>
                  <Th>{t('analytics.locale')}</Th>
                  <Th>{t('analytics.country')}</Th>
                  <Th>{t('analytics.when')}</Th>
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t('analytics.howCaptured')}</h2>
        <p className="mt-2 text-sm text-slate-500">
          {t('analytics.captureIntro')}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">POST /api/track</code>
          {t('analytics.captureBody')}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">{'{ type, path, locale, referrer, metadata }'}</code>
          {t('analytics.captureOutro')}
        </p>
      </Card>
    </>
  );
}
