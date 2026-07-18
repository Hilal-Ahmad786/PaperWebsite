import Link from 'next/link';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { Download } from 'lucide-react';
import { requirePermission, can } from '@/lib/auth/guard';
import { getAdminT } from '@/lib/admin/i18n';
import { isDbConfigured, db } from '@/db';
import { leads } from '@/db/schema';
import { PageTitle, NotConfigured, DataTable, Th, Td, Badge, EmptyState, Flash, LinkButton } from '@/components/admin/bits';
import { DeleteButton } from '@/components/admin/form-controls';
import { deleteLead } from '@/lib/admin/lead-actions';
import { DateRangeFilter } from '@/components/admin/DateRangeFilter';
import { resolveDateRange } from '@/lib/admin/date-range';

export const dynamic = 'force-dynamic';

const STAGES = ['new', 'contacted', 'qualifying', 'quoted', 'negotiation', 'won', 'lost'] as const;
type Stage = (typeof STAGES)[number];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; ok?: string; error?: string; range?: string; from?: string; to?: string }>;
}) {
  const user = await requirePermission('leads.read');
  const { t } = await getAdminT();
  const sp = await searchParams;
  const range = resolveDateRange(sp, 'all');
  const dateCond = and(
    range.from ? gte(leads.createdAt, range.from) : undefined,
    range.to ? lte(leads.createdAt, range.to) : undefined,
  );

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
    .where(and(activeStage ? eq(leads.stage, activeStage) : undefined, dateCond))
    .orderBy(desc(leads.createdAt))
    .limit(200);

  const counts = await db
    .select({ stage: leads.stage, n: sql<number>`count(*)` })
    .from(leads)
    .where(dateCond)
    .groupBy(leads.stage);
  const countByStage = Object.fromEntries(counts.map((c) => [c.stage, Number(c.n)]));
  const rangeTotal = counts.reduce((sum, c) => sum + Number(c.n), 0);
  const canDelete = can(user, 'leads.delete');

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

      <DateRangeFilter
        basePath="/admin/leads"
        active={range.key}
        from={range.fromParam}
        to={range.toParam}
        preserve={{ stage: activeStage }}
        t={t}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterPill href={stageHref(undefined, sp)} active={!activeStage} label={`${t('common.all')} (${rangeTotal})`} />
        {STAGES.map((s) => (
          <FilterPill
            key={s}
            href={stageHref(s, sp)}
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
              {canDelete && <Th className="text-right">{t('common.delete')}</Th>}
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
              {canDelete && (
                <Td className="text-right">
                  <div className="flex justify-end">
                    <DeleteButton
                      action={async () => {
                        'use server';
                        const fd = new FormData();
                        fd.set('id', l.id);
                        await deleteLead(fd);
                      }}
                      confirm={t('leads.deleteConfirm')}
                      label={t('common.delete')}
                    />
                  </div>
                </Td>
              )}
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}

/** Build the leads URL for a stage pill while preserving the active date range. */
function stageHref(
  stage: Stage | undefined,
  sp: { range?: string; from?: string; to?: string },
): string {
  const params = new URLSearchParams();
  if (stage) params.set('stage', stage);
  if (sp.range) params.set('range', sp.range);
  if (sp.from) params.set('from', sp.from);
  if (sp.to) params.set('to', sp.to);
  const qs = params.toString();
  return qs ? `/admin/leads?${qs}` : '/admin/leads';
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
