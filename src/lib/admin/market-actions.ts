'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq, ne } from 'drizzle-orm';
import { z } from 'zod';
import { requireDb } from '@/db';
import { marketIndices } from '@/db/schema';
import { requirePermission } from '@/lib/auth/guard';
import { recordAudit } from '@/lib/admin/audit';
import { parseLocalized, pickLocalized } from '@/lib/admin/localized';

const TRENDS = ['up', 'down', 'flat'] as const;

const schema = z.object({
  code: z.string().trim().min(1),
  unit: z.string(),
  value: z.string(),
  changePct: z.string(),
  trend: z.enum(TRENDS),
  region: z.string(),
  sortOrder: z.coerce.number().int(),
});

function clean(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

type IndexValues = {
  code: string;
  label: Record<string, string>;
  unit: string | null;
  value: string | null;
  changePct: string | null;
  trend: (typeof TRENDS)[number];
  region: string | null;
  sortOrder: number;
  isActive: boolean;
};

function readValues(formData: FormData): IndexValues | null {
  const label = parseLocalized(formData, 'label');
  const parsed = schema.safeParse({
    code: String(formData.get('code') ?? ''),
    unit: String(formData.get('unit') ?? ''),
    value: String(formData.get('value') ?? ''),
    changePct: String(formData.get('changePct') ?? ''),
    trend: String(formData.get('trend') ?? ''),
    region: String(formData.get('region') ?? ''),
    sortOrder: String(formData.get('sortOrder') ?? '0'),
  });
  if (!parsed.success || !pickLocalized(label)) return null;
  const d = parsed.data;
  return {
    code: d.code,
    label,
    unit: clean(d.unit),
    value: clean(d.value),
    changePct: clean(d.changePct),
    trend: d.trend,
    region: clean(d.region),
    sortOrder: d.sortOrder,
    isActive: formData.get('isActive') === 'on',
  };
}

export async function createIndex(formData: FormData) {
  const user = await requirePermission('market.write');
  const values = readValues(formData);
  if (!values) redirect(`/admin/market/new?error=${encodeURIComponent('A code and label (EN) are required')}`);

  const db = requireDb();
  const [existing] = await db
    .select({ id: marketIndices.id })
    .from(marketIndices)
    .where(eq(marketIndices.code, values.code))
    .limit(1);
  if (existing) redirect(`/admin/market/new?error=${encodeURIComponent(`Code “${values.code}” already exists`)}`);

  let created: { id: string };
  try {
    [created] = await db.insert(marketIndices).values(values).returning({ id: marketIndices.id });
  } catch {
    redirect(`/admin/market/new?error=${encodeURIComponent(`Code “${values.code}” already exists`)}`);
  }
  await recordAudit({
    actorUserId: user.id,
    action: 'market.create',
    entityType: 'market_index',
    entityId: created.id,
    summary: `Created index ${values.code}`,
  });
  revalidatePath('/admin/market');
  redirect(`/admin/market?ok=${encodeURIComponent('Index created')}`);
}

export async function updateIndex(formData: FormData) {
  const user = await requirePermission('market.write');
  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin/market');
  const values = readValues(formData);
  if (!values) redirect(`/admin/market/${id}?error=${encodeURIComponent('A code and label (EN) are required')}`);

  const db = requireDb();
  const [conflict] = await db
    .select({ id: marketIndices.id })
    .from(marketIndices)
    .where(and(eq(marketIndices.code, values.code), ne(marketIndices.id, id)))
    .limit(1);
  if (conflict) redirect(`/admin/market/${id}?error=${encodeURIComponent(`Code “${values.code}” already exists`)}`);

  try {
    await db.update(marketIndices).set({ ...values, updatedAt: new Date() }).where(eq(marketIndices.id, id));
  } catch {
    redirect(`/admin/market/${id}?error=${encodeURIComponent(`Code “${values.code}” already exists`)}`);
  }
  await recordAudit({
    actorUserId: user.id,
    action: 'market.update',
    entityType: 'market_index',
    entityId: id,
    summary: `Updated index ${values.code}`,
  });
  revalidatePath('/admin/market');
  revalidatePath(`/admin/market/${id}`);
  redirect(`/admin/market/${id}?ok=${encodeURIComponent('Index updated')}`);
}

export async function deleteIndex(formData: FormData) {
  const user = await requirePermission('market.write');
  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin/market');

  const db = requireDb();
  await db.delete(marketIndices).where(eq(marketIndices.id, id));
  await recordAudit({ actorUserId: user.id, action: 'market.delete', entityType: 'market_index', entityId: id });
  revalidatePath('/admin/market');
  redirect(`/admin/market?ok=${encodeURIComponent('Index deleted')}`);
}
