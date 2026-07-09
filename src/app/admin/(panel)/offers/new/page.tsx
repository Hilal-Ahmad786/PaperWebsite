import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { products } from '@/content/products';
import { PageTitle, Card, Flash, Field, LocalizedField, inputClass, labelClass } from '@/components/admin/bits';
import { SubmitButton } from '@/components/admin/form-controls';
import { createOffer } from '@/lib/admin/offer-actions';
import { getAdminT } from '@/lib/admin/i18n';

export const dynamic = 'force-dynamic';

const STATUSES = ['available', 'reserved', 'sold', 'hidden'] as const;

export default async function NewOfferPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requirePermission('offers.write');
  const sp = await searchParams;
  const { t } = await getAdminT();

  return (
    <>
      <Link href="/admin/offers" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> {t('offers.back')}
      </Link>
      <PageTitle title={t('offers.newOffer')} subtitle={t('offers.newSubtitle')} />
      <Flash ok={sp.ok} error={sp.error} />

      <Card className="max-w-3xl p-6">
        <form action={createOffer} className="space-y-5">
          <LocalizedField label={t('common.title')} prefix="title" required />

          <div>
            <label className={labelClass} htmlFor="productSlug">
              {t('offers.productSlug')}
            </label>
            <input
              id="productSlug"
              name="productSlug"
              list="product-slugs"
              placeholder="e.g. duplex-board"
              className={inputClass}
            />
            <datalist id="product-slugs">
              {products.map((p) => (
                <option key={p.slug} value={p.slug} />
              ))}
            </datalist>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t('offers.grade')} name="grade" placeholder="e.g. GC1" />
            <Field label={t('offers.gsm')} name="gsm" placeholder="e.g. 250" />
            <Field label={t('offers.quantityTons')} name="quantityTons" placeholder="e.g. 24" />
            <Field label={t('offers.location')} name="location" placeholder="e.g. Izmir, TR" />
            <Field label={t('offers.price')} name="price" placeholder="e.g. €640/MT" />
            <Field label={t('offers.incoterms')} name="incoterms" placeholder="e.g. FCA" />
          </div>

          <Field label={t('offers.imageUrl')} name="image" placeholder="https://…" />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="status">
                {t('common.status')}
              </label>
              <select id="status" name="status" defaultValue="available" className={inputClass}>
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {t(`offers.status.${s}`)}
                  </option>
                ))}
              </select>
            </div>
            <Field label={t('common.sortOrder')} name="sortOrder" type="number" defaultValue="0" />
          </div>

          <div className="flex gap-3">
            <SubmitButton>{t('offers.createOffer')}</SubmitButton>
          </div>
        </form>
      </Card>
    </>
  );
}
