import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { PageTitle, Card, Flash, Field, LocalizedField, inputClass, labelClass } from '@/components/admin/bits';
import { SubmitButton } from '@/components/admin/form-controls';
import { createIndex } from '@/lib/admin/market-actions';
import { getAdminT } from '@/lib/admin/i18n';

export const dynamic = 'force-dynamic';

const TRENDS = ['up', 'down', 'flat'] as const;

export default async function NewIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requirePermission('market.write');
  const sp = await searchParams;
  const { t } = await getAdminT();

  return (
    <>
      <Link href="/admin/market" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> {t('market.back')}
      </Link>
      <PageTitle title={t('market.newIndex')} subtitle={t('market.newSubtitle')} />
      <Flash ok={sp.ok} error={sp.error} />

      <Card className="max-w-3xl p-6">
        <form action={createIndex} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t('market.code')} name="code" placeholder="e.g. KRAFTLINER_EU" required />
            <Field label={t('market.region')} name="region" placeholder="e.g. EU" />
          </div>

          <LocalizedField label={t('market.label')} prefix="label" required />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t('market.value')} name="value" placeholder="e.g. €650/MT" />
            <Field label={t('market.unit')} name="unit" placeholder="e.g. MT" />
            <Field label={t('market.changePct')} name="changePct" placeholder="e.g. +1.2%" />
            <div>
              <label className={labelClass} htmlFor="trend">
                {t('market.trend')}
              </label>
              <select id="trend" name="trend" defaultValue="flat" className={inputClass}>
                {TRENDS.map((tr) => (
                  <option key={tr} value={tr} className="capitalize">
                    {t(`market.trend.${tr}`)}
                  </option>
                ))}
              </select>
            </div>
            <Field label={t('common.sortOrder')} name="sortOrder" type="number" defaultValue="0" />
          </div>

          <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30"
            />
            {t('market.activeHint')}
          </label>

          <div className="flex gap-3">
            <SubmitButton>{t('market.createIndex')}</SubmitButton>
          </div>
        </form>
      </Card>
    </>
  );
}
