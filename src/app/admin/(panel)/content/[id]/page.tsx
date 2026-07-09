import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import { requirePermission, can } from '@/lib/auth/guard';
import { requireDb } from '@/db';
import { contentEntries } from '@/db/schema';
import { PageTitle, Card, Flash, Badge, Field, LocalizedField, inputClass, labelClass } from '@/components/admin/bits';
import { SubmitButton, DeleteButton } from '@/components/admin/form-controls';
import {
  updateContent,
  deleteContent,
  publishContent,
  unpublishContent,
} from '@/lib/admin/content-actions';

export const dynamic = 'force-dynamic';

const TYPES = ['insight', 'page', 'faq'];
const STATUSES = ['draft', 'scheduled', 'published', 'archived'];

export default async function EditContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requirePermission('content.read');
  const { id } = await params;
  const sp = await searchParams;
  const db = requireDb();

  const [entry] = await db.select().from(contentEntries).where(eq(contentEntries.id, id)).limit(1);
  if (!entry) notFound();

  const editable = can(user, 'content.write');
  const canPublish = can(user, 'content.publish');

  return (
    <>
      <Link
        href="/admin/content"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={16} /> Back to content
      </Link>
      <PageTitle
        title={entry.title.en || entry.slug}
        subtitle={`Last updated ${entry.updatedAt.toLocaleString()}`}
        action={<Badge value={entry.status} />}
      />
      <Flash ok={sp.ok} error={sp.error} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6">
            {editable ? (
              <form action={updateContent} className="space-y-5">
                <input type="hidden" name="id" value={entry.id} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="type">
                      Type
                    </label>
                    <select id="type" name="type" defaultValue={entry.type} className={inputClass}>
                      {TYPES.map((t) => (
                        <option key={t} value={t} className="capitalize">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Field label="Slug" name="slug" defaultValue={entry.slug} required />
                </div>

                <LocalizedField label="Title" prefix="title" value={entry.title} required />
                <LocalizedField label="Excerpt" prefix="excerpt" value={entry.excerpt} />
                <LocalizedField label="Body" prefix="body" value={entry.body} textarea />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Cover image URL" name="coverImage" defaultValue={entry.coverImage ?? ''} placeholder="https://…" />
                  <Field label="Tags (comma-separated)" name="tags" defaultValue={entry.tags.join(', ')} />
                </div>

                <div>
                  <label className={labelClass} htmlFor="status">
                    Status
                  </label>
                  <select id="status" name="status" defaultValue={entry.status} className={inputClass}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <LocalizedField label="SEO title" prefix="seoTitle" value={entry.seoTitle} />
                <LocalizedField label="SEO description" prefix="seoDescription" value={entry.seoDescription} />

                <div className="flex justify-end">
                  <SubmitButton>Save changes</SubmitButton>
                </div>
              </form>
            ) : (
              <p className="text-sm text-slate-400">You have read-only access to this content.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {canPublish && (
            <Card className="p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Publishing</h2>
              {entry.status === 'published' ? (
                <>
                  <p className="mb-4 text-sm text-slate-500">
                    Published {entry.publishedAt ? entry.publishedAt.toLocaleString() : ''}. Unpublish to return it to draft.
                  </p>
                  <form action={unpublishContent}>
                    <input type="hidden" name="id" value={entry.id} />
                    <SubmitButton variant="secondary" className="w-full">
                      Unpublish
                    </SubmitButton>
                  </form>
                </>
              ) : (
                <>
                  <p className="mb-4 text-sm text-slate-500">Make this content live on the public site.</p>
                  <form action={publishContent}>
                    <input type="hidden" name="id" value={entry.id} />
                    <SubmitButton className="w-full">Publish</SubmitButton>
                  </form>
                </>
              )}
            </Card>
          )}

          {editable && (
            <Card className="p-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Danger zone</h2>
              <p className="mb-4 text-sm text-slate-500">Permanently remove this content entry.</p>
              <DeleteButton
                action={async () => {
                  'use server';
                  const fd = new FormData();
                  fd.set('id', entry.id);
                  await deleteContent(fd);
                }}
                confirm="Delete this content permanently?"
              />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
