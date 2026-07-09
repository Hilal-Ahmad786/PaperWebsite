import Link from 'next/link';
import { desc, eq, isNull } from 'drizzle-orm';
import { UserPlus } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { users, userRoles, roles } from '@/db/schema';
import { PageTitle, NotConfigured, DataTable, Th, Td, Badge, EmptyState, Flash, LinkButton } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requirePermission('users.manage');
  const sp = await searchParams;

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title="Users" subtitle="Admin accounts and their roles" />
        <NotConfigured message="Connect a database to manage admin users and roles." />
      </>
    );
  }

  const rows = await db
    .select()
    .from(users)
    .where(isNull(users.deletedAt))
    .orderBy(desc(users.createdAt))
    .limit(200);

  const roleRows = await db
    .select({ userId: userRoles.userId, name: roles.name, code: roles.code })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id));
  const rolesByUser = new Map<string, { name: string; code: string }[]>();
  for (const r of roleRows) {
    const list = rolesByUser.get(r.userId) ?? [];
    list.push({ name: r.name, code: r.code });
    rolesByUser.set(r.userId, list);
  }

  return (
    <>
      <PageTitle
        title="Users"
        subtitle="Admin accounts and their roles"
        action={
          <LinkButton href="/admin/users/new">
            <UserPlus size={16} /> New user
          </LinkButton>
        }
      />
      <Flash ok={sp.ok} error={sp.error} />

      {rows.length === 0 ? (
        <EmptyState message="No users yet." />
      ) : (
        <DataTable
          head={
            <>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Roles</Th>
              <Th>Active</Th>
              <Th>Last login</Th>
            </>
          }
        >
          {rows.map((u) => (
            <tr key={u.id} className="hover:bg-slate-50">
              <Td>
                <Link href={`/admin/users/${u.id}`} className="font-medium text-slate-900 hover:text-emerald-600">
                  {u.name}
                </Link>
              </Td>
              <Td>{u.email}</Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {(rolesByUser.get(u.id) ?? []).map((r) => (
                    <Badge key={r.code} value={r.code} label={r.name} />
                  ))}
                  {!(rolesByUser.get(u.id) ?? []).length && <span className="text-slate-400">—</span>}
                </div>
              </Td>
              <Td>
                {u.isActive ? (
                  <Badge value="available" label="Active" />
                ) : (
                  <Badge value="lost" label="Inactive" />
                )}
              </Td>
              <Td>{u.lastLoginAt ? u.lastLoginAt.toLocaleString() : 'Never'}</Td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}
