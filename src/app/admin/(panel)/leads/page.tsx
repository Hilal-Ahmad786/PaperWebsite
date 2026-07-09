import Link from 'next/link';
import { and, desc, eq, sql } from 'drizzle-orm';
import { Download } from 'lucide-react';
import { requirePermission, can } from '@/lib/auth/guard';
import { getAdminT } from '@/lib/admin/i18n';
import { isDbConfigured, db } from '@/db';
import { leads } from '@/db/schema';
import { PageTitle, NotConfigured, DataTable, Th, Td, Badge, EmptyState, Flash, LinkButton } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

const STAGES = ['new', 'contacted', 'qualifying', 'quoted', 'negotiation', 'won', 'lost'] as const;
type Stage = (typeof STAGES)[number];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; ok?: string; error?: string }>;
}) {
  const user = await requirePermission('leads.read');
  const { t } = await getAdminT();
  const sp = await searchParams;

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title={t('leads.title')} subtitle={t('leads.subtitle')} />
        <NotConfigured message={t('leads.notConfigured')} />
      </>
    );
  }

  const activeStage = STAGES.includes(sp.stage as Stage) ? (sp.stage as Stage) : undefined;
  const rows = await db
    .select()
    .from(leads)
    .where(activeStage ? eq(leads.stage, activeStage) : undefined)
    .orderBy(desc(leads.createdAt))
    .limit(200);

  const counts = await db
    .select({ stage: leads.stage, n: sql<number>`count(*)` })
    .from(leads)
    .groupBy(leads.stage);
  const countByStage = Object.fromEntries(counts.map((c) => [c.stage, Number(c.n)]));

  return (
    <>
      <PageTitle
        title={t('leads.title')}
        subtitle={t('leads.subtitle')}
        action={
          can(user, 'leads.export') ? (
            <LinkButton href="/admin/leads/export" variant="secondary">
              <Download size={16} /> {t('common.exportCsv')}
            </LinkButton>
          ) : undefined
        }
      />
      <Flash ok={sp.ok} error={sp.error} />

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterPill href="/admin/leads" active={!activeStage} label={t('common.all')} />
        {STAGES.map((s) => (
          <FilterPill
            key={s}
            href={`/admin/leads?stage=${s}`}
            active={activeStage === s}
            label={`${t(`leads.stage.${s}`)} (${countByStage[s] ?? 0})`}
          />
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState message={t('leads.noMatch')} />
      ) : (
        <DataTable
          head={
            <>
              <Th>{t('common.name')}</Th>
              <Th>{t('leads.col.company')}</Th>
              <Th>{t('common.email')}</Th>
              <Th>{t('leads.col.product')}</Th>
              <Th>{t('leads.col.stage')}</Th>
              <Th>{t('leads.col.priority')}</Th>
              <Th>{t('common.received')}</Th>
            </>
          }
        >
          {rows.map((l) => (
            <tr key={l.id} className="hover:bg-slate-50">
              <Td>
                <Link href={`/admin/leads/${l.id}`} className="font-medium text-slate-900 hover:text-emerald-600">
                  {l.name}
                </Link>
              </Td>
              <Td>{l.company ?? '—'}</Td>
              <Td>{l.email}</Td>
              <Td>{l.product ?? '—'}</Td>
              <Td>
                <Badge value={l.stage} />
              </Td>
              <Td className="capitalize">{t(`leads.priority.${l.priority}`)}</Td>
              <Td>{l.createdAt.toLocaleDateString()}</Td>
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
