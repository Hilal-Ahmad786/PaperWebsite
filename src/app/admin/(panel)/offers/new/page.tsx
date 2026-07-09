import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { products } from '@/content/products';
import { PageTitle, Card, Flash, Field, LocalizedField, inputClass, labelClass } from '@/components/admin/bits';
import { SubmitButton } from '@/components/admin/form-controls';
import { createOffer } from '@/lib/admin/offer-actions';

export const dynamic = 'force-dynamic';

const STATUSES = ['available', 'reserved', 'sold', 'hidden'] as const;

export default async function NewOfferPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requirePermission('offers.write');
  const sp = await searchParams;

  return (
    <>
      <Link href="/admin/offers" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to offers
      </Link>
      <PageTitle title="New offer" subtitle="Create a spot lot for the stock-offers page" />
      <Flash ok={sp.ok} error={sp.error} />

      <Card className="max-w-3xl p-6">
        <form action={createOffer} className="space-y-5">
          <LocalizedField label="Title" prefix="title" required />

          <div>
            <label className={labelClass} htmlFor="productSlug">
              Product slug
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
            <Field label="Grade" name="grade" placeholder="e.g. GC1" />
            <Field label="GSM" name="gsm" placeholder="e.g. 250" />
            <Field label="Quantity (tons)" name="quantityTons" placeholder="e.g. 24" />
            <Field label="Location" name="location" placeholder="e.g. Izmir, TR" />
            <Field label="Price" name="price" placeholder="e.g. €640/MT" />
            <Field label="Incoterms" name="incoterms" placeholder="e.g. FCA" />
          </div>

          <Field label="Image URL" name="image" placeholder="https://…" />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="status">
                Status
              </label>
              <select id="status" name="status" defaultValue="available" className={inputClass}>
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Sort order" name="sortOrder" type="number" defaultValue="0" />
          </div>

          <div className="flex gap-3">
            <SubmitButton>Create offer</SubmitButton>
          </div>
        </form>
      </Card>
    </>
  );
}
