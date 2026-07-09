import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import { requirePermission, can } from '@/lib/auth/guard';
import { requireDb } from '@/db';
import { marketIndices } from '@/db/schema';
import { PageTitle, Card, Flash, Badge, Field, LocalizedField, inputClass, labelClass } from '@/components/admin/bits';
import { SubmitButton, DeleteButton } from '@/components/admin/form-controls';
import { pickLocalized } from '@/lib/admin/localized';
import { updateIndex, deleteIndex } from '@/lib/admin/market-actions';
import { getAdminT } from '@/lib/admin/i18n';

export const dynamic = 'force-dynamic';

const TRENDS = ['up', 'down', 'flat'] as const;

export default async function EditIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requirePermission('market.read');
  const { id } = await params;
  const sp = await searchParams;
  const { t } = await getAdminT();
  const db = requireDb();

  const [index] = await db.select().from(marketIndices).where(eq(marketIndices.id, id)).limit(1);
  if (!index) notFound();

  const editable = can(user, 'market.write');

  return (
    <>
      <Link href="/admin/market" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> {t('market.back')}
      </Link>
      <PageTitle
        title={index.code}
        subtitle={pickLocalized(index.label) || t('market.updatedAt', { date: index.updatedAt.toLocaleString() })}
        action={<Badge value={index.isActive ? 'available' : 'hidden'} label={index.isActive ? t('market.active') : t('market.inactive')} />}
      />
      <Flash ok={sp.ok} error={sp.error} />

      <Card className="max-w-3xl p-6">
        {editable ? (
          <form action={updateIndex} className="space-y-5">
            <input type="hidden" name="id" value={index.id} />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('market.code')} name="code" defaultValue={index.code} required />
              <Field label={t('market.region')} name="region" defaultValue={index.region ?? ''} />
            </div>

            <LocalizedField label={t('market.label')} prefix="label" value={index.label} required />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('market.value')} name="value" defaultValue={index.value ?? ''} />
              <Field label={t('market.unit')} name="unit" defaultValue={index.unit ?? ''} />
              <Field label={t('market.changePct')} name="changePct" defaultValue={index.changePct ?? ''} />
              <div>
                <label className={labelClass} htmlFor="trend">
                  {t('market.trend')}
                </label>
                <select id="trend" name="trend" defaultValue={index.trend ?? 'flat'} className={inputClass}>
                  {TRENDS.map((tr) => (
                    <option key={tr} value={tr} className="capitalize">
                      {t(`market.trend.${tr}`)}
                    </option>
                  ))}
                </select>
              </div>
              <Field label={t('common.sortOrder')} name="sortOrder" type="number" defaultValue={String(index.sortOrder)} />
            </div>

            <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={index.isActive}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30"
              />
              {t('market.activeHint')}
            </label>

            <div className="flex gap-3">
              <SubmitButton>{t('common.saveChanges')}</SubmitButton>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-400">{t('market.readOnly')}</p>
        )}
      </Card>

      {editable && (
        <Card className="mt-6 max-w-3xl p-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('common.dangerZone')}</h2>
          <p className="mb-4 text-sm text-slate-500">{t('market.deleteInfo')}</p>
          <DeleteButton
            action={async () => {
              'use server';
              const fd = new FormData();
              fd.set('id', index.id);
              await deleteIndex(fd);
            }}
            confirm={t('market.confirmDelete')}
            label={t('common.delete')}
          />
        </Card>
      )}
    </>
  );
}
