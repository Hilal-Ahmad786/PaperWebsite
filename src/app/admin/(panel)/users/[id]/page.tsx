import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { requireDb } from '@/db';
import { users, userRoles, roles } from '@/db/schema';
import { PageTitle, Card, Flash, Field, inputClass, labelClass } from '@/components/admin/bits';
import { SubmitButton, DeleteButton } from '@/components/admin/form-controls';
import { updateUser, deleteUser } from '@/lib/admin/user-actions';
import { SITE_LOCALES } from '@/lib/admin/localized';

export const dynamic = 'force-dynamic';

export default async function UserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const actor = await requirePermission('users.manage');
  const { id } = await params;
  const sp = await searchParams;
  const db = requireDb();

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) notFound();

  const allRoles = await db.select().from(roles).orderBy(asc(roles.name));
  const assigned = await db.select({ roleId: userRoles.roleId }).from(userRoles).where(eq(userRoles.userId, id));
  const assignedIds = new Set(assigned.map((a) => a.roleId));

  const isSelf = actor.id === user.id;

  return (
    <>
      <Link href="/admin/users" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to users
      </Link>
      <PageTitle title={user.name} subtitle={user.email} />
      <Flash ok={sp.ok} error={sp.error} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Account</h2>
            <form action={updateUser} className="space-y-4">
              <input type="hidden" name="id" value={user.id} />
              <Field label="Name" name="name" defaultValue={user.name} required />
              <div>
                <label className={labelClass} htmlFor="locale">
                  Locale
                </label>
                <select id="locale" name="locale" defaultValue={user.locale} className={inputClass}>
                  {SITE_LOCALES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={user.isActive}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
                />
                Active
              </label>

              <fieldset className="rounded-lg border border-slate-200 p-4">
                <legend className="px-1 text-sm font-medium text-slate-700">Roles</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {allRoles.map((r) => (
                    <label key={r.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="roles"
                        value={r.id}
                        defaultChecked={assignedIds.has(r.id)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
                      />
                      {r.name}
                    </label>
                  ))}
                </div>
              </fieldset>

              <Field
                label="Reset password"
                name="password"
                type="password"
                placeholder="Leave blank to keep current password"
              />

              <SubmitButton>Save changes</SubmitButton>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Info</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium text-slate-400">Status</dt>
                <dd className="text-slate-800">{user.isActive ? 'Active' : 'Inactive'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Last login</dt>
                <dd className="text-slate-800">{user.lastLoginAt ? user.lastLoginAt.toLocaleString() : 'Never'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Created</dt>
                <dd className="text-slate-800">{user.createdAt.toLocaleString()}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Danger zone</h2>
            {isSelf ? (
              <p className="text-sm text-slate-400">You cannot delete your own account.</p>
            ) : (
              <>
                <p className="mb-4 text-sm text-slate-500">Deactivate and remove this user account.</p>
                <DeleteButton
                  action={async () => {
                    'use server';
                    const fd = new FormData();
                    fd.set('id', user.id);
                    await deleteUser(fd);
                  }}
                  confirm="Delete this user? Their account will be deactivated."
                />
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
