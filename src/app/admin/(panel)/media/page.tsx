import { desc } from 'drizzle-orm';
import { requirePermission, can } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { mediaAssets } from '@/db/schema';
import { PageTitle, NotConfigured, EmptyState, Flash, Card } from '@/components/admin/bits';
import { DeleteButton } from '@/components/admin/form-controls';
import { MediaUploader, CopyUrlButton } from '@/components/admin/media-uploader';
import { deleteMedia } from '@/lib/admin/media-actions';

export const dynamic = 'force-dynamic';

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requirePermission('media.read');
  const sp = await searchParams;

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title="Media library" subtitle="Uploaded images and documents" />
        <NotConfigured message="Connect a database to store and manage media assets." />
      </>
    );
  }

  const canWrite = can(user, 'media.write');
  const assets = await db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)).limit(200);

  return (
    <>
      <PageTitle title="Media library" subtitle="Uploaded images and documents" />
      <Flash ok={sp.ok} error={sp.error} />

      {canWrite && <MediaUploader />}

      {assets.length === 0 ? (
        <EmptyState message="No media uploaded yet." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset) => {
            const isImage = (asset.contentType ?? '').startsWith('image/');
            return (
              <Card key={asset.id} className="overflow-hidden">
                <div className="aspect-video bg-slate-100">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.url}
                      alt={asset.filename}
                      className="h-full w-full rounded-t-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-medium uppercase text-slate-400">
                      {asset.contentType ?? 'File'}
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <p className="truncate text-sm font-medium text-slate-900" title={asset.filename}>
                      {asset.filename}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{formatBytes(asset.size)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CopyUrlButton url={asset.url} />
                    {canWrite && (
                      <DeleteButton
                        action={async () => {
                          'use server';
                          const fd = new FormData();
                          fd.set('id', asset.id);
                          await deleteMedia(fd);
                        }}
                        confirm={`Delete ${asset.filename}? This cannot be undone.`}
                      />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
