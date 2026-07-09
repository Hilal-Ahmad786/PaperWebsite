'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { del } from '@vercel/blob';
import { requireDb } from '@/db';
import { mediaAssets } from '@/db/schema';
import { requirePermission } from '@/lib/auth/guard';
import { recordAudit } from '@/lib/admin/audit';

export async function deleteMedia(formData: FormData) {
  const user = await requirePermission('media.write');
  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin/media');

  const db = requireDb();
  const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  if (!asset) redirect(`/admin/media?error=${encodeURIComponent('Asset not found')}`);

  if (asset.pathname || asset.url) {
    try {
      await del(asset.url);
    } catch {
      // Blob may already be gone or storage not configured — ignore.
    }
  }

  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  await recordAudit({
    actorUserId: user.id,
    action: 'media.delete',
    entityType: 'media',
    entityId: id,
    summary: `Deleted ${asset.filename}`,
  });
  revalidatePath('/admin/media');
  redirect(`/admin/media?ok=${encodeURIComponent('Deleted')}`);
}
