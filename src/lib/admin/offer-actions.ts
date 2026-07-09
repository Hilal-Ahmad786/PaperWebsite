'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireDb } from '@/db';
import { stockOffers } from '@/db/schema';
import { requirePermission } from '@/lib/auth/guard';
import { recordAudit } from '@/lib/admin/audit';
import { parseLocalized, pickLocalized } from '@/lib/admin/localized';

const STATUSES = ['available', 'reserved', 'sold', 'hidden'] as const;

const schema = z.object({
  productSlug: z.string(),
  grade: z.string(),
  gsm: z.string(),
  quantityTons: z.string(),
  location: z.string(),
  price: z.string(),
  incoterms: z.string(),
  status: z.enum(STATUSES),
  image: z.string(),
  sortOrder: z.coerce.number().int(),
});

function clean(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

type OfferValues = {
  title: Record<string, string>;
  productSlug: string | null;
  grade: string | null;
  gsm: string | null;
  quantityTons: string | null;
  location: string | null;
  price: string | null;
  incoterms: string | null;
  status: (typeof STATUSES)[number];
  image: string | null;
  sortOrder: number;
};

function readValues(formData: FormData): OfferValues | null {
  const title = parseLocalized(formData, 'title');
  const parsed = schema.safeParse({
    productSlug: String(formData.get('productSlug') ?? ''),
    grade: String(formData.get('grade') ?? ''),
    gsm: String(formData.get('gsm') ?? ''),
    quantityTons: String(formData.get('quantityTons') ?? ''),
    location: String(formData.get('location') ?? ''),
    price: String(formData.get('price') ?? ''),
    incoterms: String(formData.get('incoterms') ?? ''),
    status: String(formData.get('status') ?? ''),
    image: String(formData.get('image') ?? ''),
    sortOrder: String(formData.get('sortOrder') ?? '0'),
  });
  if (!parsed.success || !pickLocalized(title)) return null;
  const d = parsed.data;
  return {
    title,
    productSlug: clean(d.productSlug),
    grade: clean(d.grade),
    gsm: clean(d.gsm),
    quantityTons: clean(d.quantityTons),
    location: clean(d.location),
    price: clean(d.price),
    incoterms: clean(d.incoterms),
    status: d.status,
    image: clean(d.image),
    sortOrder: d.sortOrder,
  };
}

export async function createOffer(formData: FormData) {
  const user = await requirePermission('offers.write');
  const values = readValues(formData);
  if (!values) redirect(`/admin/offers/new?error=${encodeURIComponent('A title (EN) and valid fields are required')}`);

  const db = requireDb();
  const [row] = await db.insert(stockOffers).values(values).returning({ id: stockOffers.id });
  await recordAudit({
    actorUserId: user.id,
    action: 'offer.create',
    entityType: 'stock_offer',
    entityId: row.id,
    summary: `Created offer “${pickLocalized(values.title)}”`,
  });
  revalidatePath('/admin/offers');
  redirect(`/admin/offers?ok=${encodeURIComponent('Offer created')}`);
}

export async function updateOffer(formData: FormData) {
  const user = await requirePermission('offers.write');
  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin/offers');
  const values = readValues(formData);
  if (!values) redirect(`/admin/offers/${id}?error=${encodeURIComponent('A title (EN) and valid fields are required')}`);

  const db = requireDb();
  await db.update(stockOffers).set({ ...values, updatedAt: new Date() }).where(eq(stockOffers.id, id));
  await recordAudit({
    actorUserId: user.id,
    action: 'offer.update',
    entityType: 'stock_offer',
    entityId: id,
    summary: `Updated offer “${pickLocalized(values.title)}”`,
  });
  revalidatePath('/admin/offers');
  revalidatePath(`/admin/offers/${id}`);
  redirect(`/admin/offers/${id}?ok=${encodeURIComponent('Offer updated')}`);
}

export async function deleteOffer(formData: FormData) {
  const user = await requirePermission('offers.write');
  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin/offers');

  const db = requireDb();
  await db.delete(stockOffers).where(eq(stockOffers.id, id));
  await recordAudit({ actorUserId: user.id, action: 'offer.delete', entityType: 'stock_offer', entityId: id });
  revalidatePath('/admin/offers');
  redirect(`/admin/offers?ok=${encodeURIComponent('Offer deleted')}`);
}
