import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import { requirePermission, can } from '@/lib/auth/guard';
import { requireDb } from '@/db';
import { stockOffers } from '@/db/schema';
import { products } from '@/content/products';
import { PageTitle, Card, Flash, Badge, Field, LocalizedField, inputClass, labelClass } from '@/components/admin/bits';
import { SubmitButton, DeleteButton } from '@/components/admin/form-controls';
import { pickLocalized } from '@/lib/admin/localized';
import { updateOffer, deleteOffer } from '@/lib/admin/offer-actions';
import { getAdminT } from '@/lib/admin/i18n';

export const dynamic = 'force-dynamic';

const STATUSES = ['available', 'reserved', 'sold', 'hidden'] as const;

export default async function EditOfferPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requirePermission('offers.read');
  const { id } = await params;
  const sp = await searchParams;
  const { t } = await getAdminT();
  const db = requireDb();

  const [offer] = await db.select().from(stockOffers).where(eq(stockOffers.id, id)).limit(1);
  if (!offer) notFound();

  const editable = can(user, 'offers.write');

  return (
    <>
      <Link href="/admin/offers" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> {t('offers.back')}
      </Link>
      <PageTitle
        title={pickLocalized(offer.title) || t('offers.untitled')}
        subtitle={t('offers.updatedAt', { date: offer.updatedAt.toLocaleString() })}
        action={<Badge value={offer.status} label={t(`offers.status.${offer.status}`)} />}
      />
      <Flash ok={sp.ok} error={sp.error} />

      <Card className="max-w-3xl p-6">
        {editable ? (
          <form action={updateOffer} className="space-y-5">
            <input type="hidden" name="id" value={offer.id} />
            <LocalizedField label={t('common.title')} prefix="title" value={offer.title} required />

            <div>
              <label className={labelClass} htmlFor="productSlug">
                {t('offers.productSlug')}
              </label>
              <input
                id="productSlug"
                name="productSlug"
                list="product-slugs"
                defaultValue={offer.productSlug ?? ''}
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
              <Field label={t('offers.grade')} name="grade" defaultValue={offer.grade ?? ''} />
              <Field label={t('offers.gsm')} name="gsm" defaultValue={offer.gsm ?? ''} />
              <Field label={t('offers.quantityTons')} name="quantityTons" defaultValue={offer.quantityTons ?? ''} />
              <Field label={t('offers.location')} name="location" defaultValue={offer.location ?? ''} />
              <Field label={t('offers.price')} name="price" defaultValue={offer.price ?? ''} />
              <Field label={t('offers.incoterms')} name="incoterms" defaultValue={offer.incoterms ?? ''} />
            </div>

            <Field label={t('offers.imageUrl')} name="image" defaultValue={offer.image ?? ''} placeholder="https://…" />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="status">
                  {t('common.status')}
                </label>
                <select id="status" name="status" defaultValue={offer.status} className={inputClass}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {t(`offers.status.${s}`)}
                    </option>
                  ))}
                </select>
              </div>
              <Field label={t('common.sortOrder')} name="sortOrder" type="number" defaultValue={String(offer.sortOrder)} />
            </div>

            <div className="flex gap-3">
              <SubmitButton>{t('common.saveChanges')}</SubmitButton>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-400">{t('offers.readOnly')}</p>
        )}
      </Card>

      {editable && (
        <Card className="mt-6 max-w-3xl p-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('common.dangerZone')}</h2>
          <p className="mb-4 text-sm text-slate-500">{t('offers.deleteInfo')}</p>
          <DeleteButton
            action={async () => {
              'use server';
              const fd = new FormData();
              fd.set('id', offer.id);
              await deleteOffer(fd);
            }}
            confirm={t('offers.confirmDelete')}
            label={t('common.delete')}
          />
        </Card>
      )}
    </>
  );
}
