'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { requireDb } from '@/db';
import { productOverrides } from '@/db/schema';
import { requirePermission } from '@/lib/auth/guard';
import { recordAudit } from '@/lib/admin/audit';
import { parseLocalized } from '@/lib/admin/localized';

export async function upsertProductOverride(formData: FormData) {
  const user = await requirePermission('products.write');
  const slug = String(formData.get('slug') ?? '').trim();
  if (!slug) redirect(`/admin/products?error=${encodeURIComponent('Missing product slug')}`);

  const name = parseLocalized(formData, 'name');
  const summary = parseLocalized(formData, 'summary');
  const category = String(formData.get('category') ?? '').trim() || null;
  const origins = String(formData.get('origins') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const images = String(formData.get('images') ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  const sortOrder = Number.parseInt(String(formData.get('sortOrder') ?? '0'), 10) || 0;
  const isHidden = formData.get('isHidden') === 'on';

  const db = requireDb();
  await db
    .insert(productOverrides)
    .values({ slug, name, summary, category, origins, images, sortOrder, isHidden })
    .onConflictDoUpdate({
      target: productOverrides.slug,
      set: { name, summary, category, origins, images, sortOrder, isHidden, updatedAt: new Date() },
    });

  await recordAudit({
    actorUserId: user.id,
    action: 'product.override',
    entityType: 'product',
    entityId: slug,
    summary: `Saved override for ${slug}`,
  });
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${slug}`);
  redirect(`/admin/products/${slug}?ok=${encodeURIComponent('Product override saved')}`);
}

export async function resetProductOverride(formData: FormData) {
  const user = await requirePermission('products.write');
  const slug = String(formData.get('slug') ?? '').trim();
  if (!slug) redirect('/admin/products');

  const db = requireDb();
  await db.delete(productOverrides).where(eq(productOverrides.slug, slug));

  await recordAudit({
    actorUserId: user.id,
    action: 'product.reset',
    entityType: 'product',
    entityId: slug,
    summary: `Removed override for ${slug}`,
  });
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${slug}`);
  redirect(`/admin/products?ok=${encodeURIComponent('Override removed')}`);
}
