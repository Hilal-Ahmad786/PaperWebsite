import { and, desc, gte, ne, sql } from 'drizzle-orm';
import { Eye, Phone, MessageCircle, Send } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { analyticsEvents } from '@/db/schema';
import { PageTitle, StatCard, NotConfigured, DataTable, Th, Td, EmptyState } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

const TYPE_LABELS: Record<string, string> = {
  page_view: 'Page views',
  phone_click: 'Phone clicks',
  whatsapp_click: 'WhatsApp clicks',
  email_click: 'Email clicks',
  quote_click: 'Quote clicks',
  offer_request: 'Offer requests',
  form_submit: 'Form submits',
};

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export default async function ClicksPage() {
  await requirePermission('clicks.view');

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title="Button Clicks" subtitle="Call-to-action engagement from the website" />
        <NotConfigured message="Connect a database to capture and report on button clicks." />
      </>
    );
  }

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const countType = (type: string) =>
    db!
      .select({ n: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(and(gte(analyticsEvents.createdAt, since30), sql`${analyticsEvents.type} = ${type}`))
      .then((r) => Number(r[0]?.n ?? 0));

  const [pageViews, phoneClicks, whatsappClicks, formSubmits, byType, recent] = await Promise.all([
    countType('page_view'),
    countType('phone_click'),
    countType('whatsapp_click'),
    countType('form_submit'),
    db
      .select({ type: analyticsEvents.type, n: sql<number>`count(*)` })
      .from(analyticsEvents)
      .groupBy(analyticsEvents.type)
      .orderBy(desc(sql`count(*)`)),
    db
      .select()
      .from(analyticsEvents)
      .where(ne(analyticsEvents.type, 'page_view'))
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(25),
  ]);

  return (
    <>
      <PageTitle title="Button Clicks" subtitle="Call-to-action engagement from the website (last 30 days)" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Page views" value={pageViews} icon={Eye} accent />
        <StatCard label="Phone clicks" value={phoneClicks} icon={Phone} />
        <StatCard label="WhatsApp clicks" value={whatsappClicks} icon={MessageCircle} />
        <StatCard label="Form submits" value={formSubmits} icon={Send} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Clicks by type</h2>
          {byType.length === 0 ? (
            <EmptyState message="No events recorded yet." />
          ) : (
            <DataTable
              head={
                <>
                  <Th>Type</Th>
                  <Th>Count</Th>
                </>
              }
            >
              {byType.map((r) => (
                <tr key={r.type} className="hover:bg-slate-50">
                  <Td>{typeLabel(r.type)}</Td>
                  <Td className="font-semibold text-slate-900">{Number(r.n)}</Td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Recent clicks</h2>
          {recent.length === 0 ? (
            <EmptyState message="No clicks recorded yet." />
          ) : (
            <DataTable
              head={
                <>
                  <Th>Type</Th>
                  <Th>Path</Th>
                  <Th>Country</Th>
                  <Th>When</Th>
                </>
              }
            >
              {recent.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <Td className="font-medium text-slate-900">{typeLabel(e.type)}</Td>
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
