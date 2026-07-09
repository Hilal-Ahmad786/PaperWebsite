import Link from 'next/link';
import { asc } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { roles } from '@/db/schema';
import { PageTitle, Card, Flash, Field, NotConfigured, inputClass, labelClass } from '@/components/admin/bits';
import { SubmitButton } from '@/components/admin/form-controls';
import { createUser } from '@/lib/admin/user-actions';

export const dynamic = 'force-dynamic';

export default async function NewUserPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requirePermission('users.manage');
  const sp = await searchParams;

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title="New user" subtitle="Create an admin account" />
        <NotConfigured message="Connect a database to manage admin users and roles." />
      </>
    );
  }

  const roleRows = await db.select().from(roles).orderBy(asc(roles.name));

  return (
    <>
      <Link href="/admin/users" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to users
      </Link>
      <PageTitle title="New user" subtitle="Create an admin account" />
      <Flash ok={sp.ok} error={sp.error} />

      <Card className="max-w-xl p-6">
        <form action={createUser} className="space-y-4">
          <Field label="Name" name="name" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" placeholder="At least 8 characters" required />
          <div>
            <label className={labelClass} htmlFor="roleId">
              Role
            </label>
            <select id="roleId" name="roleId" defaultValue="" className={inputClass}>
              <option value="">No role</option>
              {roleRows.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <SubmitButton>Create user</SubmitButton>
        </form>
      </Card>
    </>
  );
}
