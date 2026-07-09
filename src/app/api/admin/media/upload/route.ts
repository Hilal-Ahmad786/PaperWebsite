import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { isDbConfigured, requireDb } from '@/db';
import { mediaAssets } from '@/db/schema';
import { requirePermission } from '@/lib/auth/guard';
import { recordAudit } from '@/lib/admin/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const user = await requirePermission('media.write');

  if (!isDbConfigured || !process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Blob storage not configured. Set BLOB_READ_WRITE_TOKEN.' },
      { status: 501 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });

  const db = requireDb();
  const [asset] = await db
    .insert(mediaAssets)
    .values({
      url: blob.url,
      pathname: blob.pathname,
      filename: file.name,
      contentType: file.type || blob.contentType || null,
      size: file.size,
      uploadedBy: user.id,
    })
    .returning();

  await recordAudit({
    actorUserId: user.id,
    action: 'media.upload',
    entityType: 'media',
    entityId: asset.id,
    summary: `Uploaded ${file.name}`,
  });

  return NextResponse.json({ ok: true, asset });
}
