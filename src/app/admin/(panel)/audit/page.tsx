import { desc, eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { auditLogs, users } from '@/db/schema';
import { PageTitle, NotConfigured, DataTable, Th, Td, EmptyState } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
  await requirePermission('audit.read');

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title="Audit log" subtitle="Recent administrative activity" />
        <NotConfigured message="Connect a database to view the audit trail." />
      </>
    );
  }

  const rows = await db
    .select({
      id: auditLogs.id,
      createdAt: auditLogs.createdAt,
      actor: users.name,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      summary: auditLogs.summary,
      ip: auditLogs.ip,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorUserId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(200);

  return (
    <>
      <PageTitle title="Audit log" subtitle="The 200 most recent administrative actions." />

      {rows.length === 0 ? (
        <EmptyState message="No audit entries yet." />
      ) : (
        <DataTable
          head={
            <>
              <Th>When</Th>
              <Th>Actor</Th>
              <Th>Action</Th>
              <Th>Entity</Th>
              <Th>Summary</Th>
              <Th>IP</Th>
            </>
          }
        >
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50">
              <Td className="whitespace-nowrap">{r.createdAt.toLocaleString()}</Td>
              <Td>{r.actor ?? 'system'}</Td>
              <Td>
                <span className="font-mono text-xs text-slate-600">{r.action}</span>
              </Td>
              <Td>
                {r.entityType ? (
                  <span className="text-xs text-slate-500">
                    {r.entityType}
                    {r.entityId ? ` · ${r.entityId}` : ''}
                  </span>
                ) : (
                  '—'
                )}
              </Td>
              <Td>{r.summary ?? '—'}</Td>
              <Td className="text-xs text-slate-400">{r.ip ?? '—'}</Td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}
