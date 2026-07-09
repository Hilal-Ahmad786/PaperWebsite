import Link from 'next/link';
import { asc } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { getAdminT } from '@/lib/admin/i18n';
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
  const { t } = await getAdminT();
  const sp = await searchParams;

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title={t('users.new')} subtitle={t('users.newSubtitle')} />
        <NotConfigured message={t('users.notConfigured')} />
      </>
    );
  }

  const roleRows = await db.select().from(roles).orderBy(asc(roles.name));

  return (
    <>
      <Link href="/admin/users" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> {t('users.backToUsers')}
      </Link>
      <PageTitle title={t('users.new')} subtitle={t('users.newSubtitle')} />
      <Flash ok={sp.ok} error={sp.error} />

      <Card className="max-w-xl p-6">
        <form action={createUser} className="space-y-4">
          <Field label={t('common.name')} name="name" required />
          <Field label={t('common.email')} name="email" type="email" required />
          <Field label={t('users.password')} name="password" type="password" placeholder={t('users.passwordPlaceholder')} required />
          <div>
            <label className={labelClass} htmlFor="roleId">
              {t('users.role')}
            </label>
            <select id="roleId" name="roleId" defaultValue="" className={inputClass}>
              <option value="">{t('users.noRole')}</option>
              {roleRows.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <SubmitButton>{t('users.createUser')}</SubmitButton>
        </form>
      </Card>
    </>
  );
}
