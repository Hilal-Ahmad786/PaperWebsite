import { and, desc, gte, lte, ne, sql } from 'drizzle-orm';
import { Eye, Phone, MessageCircle, Send } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { analyticsEvents } from '@/db/schema';
import { PageTitle, StatCard, NotConfigured, DataTable, Th, Td, EmptyState } from '@/components/admin/bits';
import { getAdminT, type Translator } from '@/lib/admin/i18n';
import { DateRangeFilter } from '@/components/admin/DateRangeFilter';
import { resolveDateRange } from '@/lib/admin/date-range';

export const dynamic = 'force-dynamic';

const KNOWN_TYPES = new Set([
  'page_view',
  'phone_click',
  'whatsapp_click',
  'email_click',
  'quote_click',
  'offer_request',
  'form_start',
  'spec_upload',
  'form_submit',
]);

function typeLabel(t: Translator, type: string): string {
  return KNOWN_TYPES.has(type) ? t(`clicks.type.${type}`) : type;
}

export default async function ClicksPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  await requirePermission('clicks.view');
  const { t } = await getAdminT();
  const sp = await searchParams;

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title={t('clicks.title')} subtitle={t('clicks.subtitleShort')} />
        <NotConfigured message={t('clicks.notConfigured')} />
      </>
    );
  }

  // Defaults to the last month (preserves the previous "last 30 days" behaviour).
  const range = resolveDateRange(sp, '1m');
  const dateCond = and(
    range.from ? gte(analyticsEvents.createdAt, range.from) : undefined,
    range.to ? lte(analyticsEvents.createdAt, range.to) : undefined,
  );

  const countType = (type: string) =>
    db!
      .select({ n: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(and(sql`${analyticsEvents.type} = ${type}`, dateCond))
      .then((r) => Number(r[0]?.n ?? 0));

  const [pageViews, phoneClicks, whatsappClicks, formSubmits, byType, recent] = await Promise.all([
    countType('page_view'),
    countType('phone_click'),
    countType('whatsapp_click'),
    countType('form_submit'),
    db
      .select({ type: analyticsEvents.type, n: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(dateCond)
      .groupBy(analyticsEvents.type)
      .orderBy(desc(sql`count(*)`)),
    db
      .select()
      .from(analyticsEvents)
      .where(and(ne(analyticsEvents.type, 'page_view'), dateCond))
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(25),
  ]);

  return (
    <>
      <PageTitle title={t('clicks.title')} subtitle={t('clicks.subtitleShort')} />

      <DateRangeFilter
        basePath="/admin/clicks"
        active={range.key}
        from={range.fromParam}
        to={range.toParam}
        t={t}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t('clicks.type.page_view')} value={pageViews} icon={Eye} accent />
        <StatCard label={t('clicks.type.phone_click')} value={phoneClicks} icon={Phone} />
        <StatCard label={t('clicks.type.whatsapp_click')} value={whatsappClicks} icon={MessageCircle} />
        <StatCard label={t('clicks.type.form_submit')} value={formSubmits} icon={Send} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">{t('clicks.byType')}</h2>
          {byType.length === 0 ? (
            <EmptyState message={t('clicks.noEvents')} />
          ) : (
            <DataTable
              head={
                <>
                  <Th>{t('common.type')}</Th>
                  <Th>{t('clicks.count')}</Th>
                </>
              }
            >
              {byType.map((r) => (
                <tr key={r.type} className="hover:bg-slate-50">
                  <Td>{typeLabel(t, r.type)}</Td>
                  <Td className="font-semibold text-slate-900">{Number(r.n)}</Td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">{t('clicks.recent')}</h2>
          {recent.length === 0 ? (
            <EmptyState message={t('clicks.noClicks')} />
          ) : (
            <DataTable
              head={
                <>
                  <Th>{t('common.type')}</Th>
                  <Th>{t('clicks.path')}</Th>
                  <Th>{t('clicks.country')}</Th>
                  <Th>{t('clicks.when')}</Th>
                </>
              }
            >
              {recent.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <Td className="font-medium text-slate-900">{typeLabel(t, e.type)}</Td>
                  <Td className="max-w-[220px] truncate">{e.path ?? '—'}</Td>
                  <Td>{e.country ?? '—'}</Td>
                  <Td>{e.createdAt.toLocaleString()}</Td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>
      </div>
    </>
  );
}
