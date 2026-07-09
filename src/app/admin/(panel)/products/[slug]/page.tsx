import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import { requirePermission, can } from '@/lib/auth/guard';
import { requireDb } from '@/db';
import { productOverrides } from '@/db/schema';
import { getProductBySlug } from '@/content/products';
import { PageTitle, Card, Flash, Field, LocalizedField, inputClass, labelClass } from '@/components/admin/bits';
import { SubmitButton, DeleteButton } from '@/components/admin/form-controls';
import { upsertProductOverride, resetProductOverride } from '@/lib/admin/product-actions';
import { getAdminT } from '@/lib/admin/i18n';

export const dynamic = 'force-dynamic';

export default async function ProductOverridePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requirePermission('products.read');
  const { slug } = await params;
  const sp = await searchParams;

  const { t } = await getAdminT();

  const canonical = getProductBySlug(slug);
  if (!canonical) notFound();

  const db = requireDb();
  const [override] = await db
    .select()
    .from(productOverrides)
    .where(eq(productOverrides.slug, slug))
    .limit(1);

  const editable = can(user, 'products.write');

  return (
    <>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={16} /> {t('products.back')}
      </Link>
      <PageTitle title={slug} subtitle={t('products.editSubtitle')} />
      <Flash ok={sp.ok} error={sp.error} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6">
            {editable ? (
              <form action={upsertProductOverride} className="space-y-5">
                <input type="hidden" name="slug" value={slug} />

                <LocalizedField label={t('common.name')} prefix="name" value={override?.name} />
                <LocalizedField label={t('products.summary')} prefix="summary" value={override?.summary} textarea />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t('common.category')} name="category" defaultValue={override?.category ?? canonical.category} />
                  <Field
                    label={t('products.origins')}
                    name="origins"
                    defaultValue={(override?.origins ?? canonical.origins ?? []).join(', ')}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="images">
                    {t('products.images')}
                  </label>
                  <textarea
                    id="images"
                    name="images"
                    defaultValue={(override?.images ?? []).join('\n')}
                    rows={4}
                    className={`${inputClass} h-auto py-2`}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t('common.sortOrder')} name="sortOrder" type="number" defaultValue={String(override?.sortOrder ?? 0)} />
                  <div className="flex items-center gap-2 pt-7">
                    <input
                      id="isHidden"
                      name="isHidden"
                      type="checkbox"
                      defaultChecked={override?.isHidden ?? false}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
                    />
                    <label htmlFor="isHidden" className="text-sm font-medium text-slate-700">
                      {t('products.hideLabel')}
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <SubmitButton>{t('products.saveOverride')}</SubmitButton>
                </div>
              </form>
            ) : (
              <p className="text-sm text-slate-400">{t('products.readOnly')}</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('products.canonical')}</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-slate-400">{t('products.slug')}</dt>
                <dd className="text-sm text-slate-800">{canonical.slug}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">{t('common.category')}</dt>
                <dd className="text-sm text-slate-800">{canonical.category}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">{t('products.originsShort')}</dt>
                <dd className="text-sm text-slate-800">{(canonical.origins ?? []).join(', ') || '—'}</dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
              {t('products.definedIn')} <code>src/content/products.ts</code>{t('products.overridesNote')}
            </p>
          </Card>

          {editable && override && (
            <Card className="p-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('common.dangerZone')}</h2>
              <p className="mb-4 text-sm text-slate-500">{t('products.deleteInfo')}</p>
              <DeleteButton
                action={async () => {
                  'use server';
                  const fd = new FormData();
                  fd.set('slug', slug);
                  await resetProductOverride(fd);
                }}
                confirm={t('products.confirmReset')}
                label={t('products.resetOverride')}
              />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
