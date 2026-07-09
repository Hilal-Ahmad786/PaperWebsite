import { eq, sql } from 'drizzle-orm';
import { ShieldCheck } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { roles as rolesTable, userRoles } from '@/db/schema';
import { PERMISSIONS, ROLES, permissionsForRole, type PermissionCode } from '@/lib/auth/rbac';
import { PageTitle, Card, DataTable, Th, Td } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 ring-1 ring-inset ring-slate-500/10">
      {children}
    </span>
  );
}

function groupByPrefix(codes: PermissionCode[]): Record<string, PermissionCode[]> {
  const groups: Record<string, PermissionCode[]> = {};
  for (const code of codes) {
    const prefix = code.split('.')[0];
    (groups[prefix] ??= []).push(code);
  }
  return groups;
}

export default async function RolesPage() {
  await requirePermission('users.manage');

  let userCountByRole: Record<string, number> = {};
  if (isDbConfigured && db) {
    const counts = await db
      .select({ code: rolesTable.code, n: sql<number>`count(*)` })
      .from(userRoles)
      .innerJoin(rolesTable, eq(userRoles.roleId, rolesTable.id))
      .groupBy(rolesTable.code);
    userCountByRole = Object.fromEntries(counts.map((c) => [c.code, Number(c.n)]));
  }

  const permissionEntries = Object.entries(PERMISSIONS) as [PermissionCode, string][];

  return (
    <>
      <PageTitle
        title="Roles & permissions"
        subtitle="Reference view of the roles defined in the application and the permissions each grants."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {ROLES.map((role) => {
          const perms = permissionsForRole(role);
          const groups = groupByPrefix(perms);
          const isWildcard = role.permissions === '*';
          return (
            <Card key={role.code} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">{role.name}</h2>
                    <p className="font-mono text-xs text-slate-400">{role.code}</p>
                  </div>
                </div>
                {isDbConfigured && (
                  <span className="text-xs text-slate-400">{userCountByRole[role.code] ?? 0} users</span>
                )}
              </div>
              <p className="mt-3 text-sm text-slate-500">{role.description}</p>
              <div className="mt-4 space-y-3">
                {isWildcard && (
                  <p className="text-xs font-medium text-emerald-600">Grants every permission (*).</p>
                )}
                {Object.entries(groups).map(([prefix, codes]) => (
                  <div key={prefix}>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{prefix}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {codes.map((c) => (
                        <Chip key={c}>{c}</Chip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">All permissions</h2>
        <DataTable
          head={
            <>
              <Th>Code</Th>
              <Th>Description</Th>
            </>
          }
        >
          {permissionEntries.map(([code, description]) => (
            <tr key={code} className="hover:bg-slate-50">
              <Td>
                <Chip>{code}</Chip>
              </Td>
              <Td>{description}</Td>
            </tr>
          ))}
        </DataTable>
      </div>
    </>
  );
}
