'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireDb } from '@/db';
import { siteSettings } from '@/db/schema';
import { requirePermission } from '@/lib/auth/guard';
import { recordAudit } from '@/lib/admin/audit';
import { BRAND_SETTING_KEYS, SEO_SETTING_KEYS } from '@/lib/admin/settings-keys';

async function upsertKeys(
  keys: readonly { key: string; label: string }[],
  formData: FormData,
  updatedBy: string
) {
  const db = requireDb();
  const now = new Date();
  for (const { key } of keys) {
    const value = String(formData.get(key) ?? '').trim();
    await db
      .insert(siteSettings)
      .values({ key, value, updatedBy, updatedAt: now })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value, updatedBy, updatedAt: now },
      });
  }
}

export async function saveSettings(formData: FormData) {
  const user = await requirePermission('settings.manage');
  await upsertKeys(BRAND_SETTING_KEYS, formData, user.id);

  await recordAudit({
    actorUserId: user.id,
    action: 'settings.update',
    entityType: 'settings',
    entityId: 'brand',
    summary: 'Updated brand & contact settings',
  });
  revalidatePath('/admin/settings');
  redirect(`/admin/settings?ok=${encodeURIComponent('Saved')}`);
}

export async function saveSeoSettings(formData: FormData) {
  const user = await requirePermission('seo.write');
  await upsertKeys(SEO_SETTING_KEYS, formData, user.id);

  await recordAudit({
    actorUserId: user.id,
    action: 'settings.update',
    entityType: 'settings',
    entityId: 'seo',
    summary: 'Updated SEO settings',
  });
  revalidatePath('/admin/seo');
  redirect(`/admin/seo?ok=${encodeURIComponent('Saved')}`);
}
