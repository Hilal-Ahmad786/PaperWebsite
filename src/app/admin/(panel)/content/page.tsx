import Link from 'next/link';
import { desc, eq, sql } from 'drizzle-orm';
import { Plus } from 'lucide-react';
import { requirePermission, can } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { contentEntries } from '@/db/schema';
import { pickLocalized } from '@/lib/admin/localized';
import { PageTitle, NotConfigured, DataTable, Th, Td, Badge, EmptyState, Flash, LinkButton } from '@/components/admin/bits';
import { getAdminT } from '@/lib/admin/i18n';

export const dynamic = 'force-dynamic';

const STATUSES = ['draft', 'scheduled', 'published', 'archived'] as const;
type Status = (typeof STATUSES)[number];

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; ok?: string; error?: string }>;
}) {
  const user = await requirePermission('content.read');
  const sp = await searchParams;
  const { t } = await getAdminT();

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title={t('content.title')} subtitle={t('content.subtitle')} />
        <NotConfigured message={t('content.notConfigured')} />
      </>
    );
  }

  const activeStatus = STATUSES.includes(sp.status as Status) ? (sp.status as Status) : undefined;
  const rows = await db
    .select()
    .from(contentEntries)
    .where(activeStatus ? eq(contentEntries.status, activeStatus) : undefined)
    .orderBy(desc(contentEntries.updatedAt))
    .limit(200);

  const counts = await db
    .select({ status: contentEntries.status, n: sql<number>`count(*)` })
    .from(contentEntries)
    .groupBy(contentEntries.status);
  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, Number(c.n)]));

  return (
    <>
      <PageTitle
        title={t('content.title')}
        subtitle={t('content.subtitle')}
        action={
          can(user, 'content.write') ? (
            <LinkButton href="/admin/content/new">
              <Plus size={16} /> {t('content.newInsight')}
            </LinkButton>
          ) : undefined
        }
      />
      <Flash ok={sp.ok} error={sp.error} />

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterPill href="/admin/content" active={!activeStatus} label={t('common.all')} />
        {STATUSES.map((s) => (
          <FilterPill
            key={s}
            href={`/admin/content?status=${s}`}
            active={activeStatus === s}
            label={`${t(`content.status.${s}`)} (${countByStatus[s] ?? 0})`}
          />
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState message={t('content.empty')} />
      ) : (
        <DataTable
          head={
            <>
              <Th>{t('common.title')}</Th>
              <Th>{t('common.type')}</Th>
              <Th>{t('common.status')}</Th>
              <Th>{t('common.updatedAt')}</Th>
            </>
          }
        >
          {rows.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <Td>
                <Link
                  href={`/admin/content/${c.id}`}
                  className="font-medium text-slate-900 hover:text-emerald-600"
                >
                  {pickLocalized(c.title) || c.slug}
                </Link>
              </Td>
              <Td className="capitalize">{t(`content.type.${c.type}`)}</Td>
              <Td>
                <Badge value={c.status} label={t(`content.status.${c.status}`)} />
              </Td>
              <Td>{c.updatedAt.toLocaleDateString()}</Td>
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
