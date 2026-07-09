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
import { getAdminT } from '@/lib/admin/i18n';

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
  const { t } = await getAdminT();
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
        <ArrowLeft size={16} /> {t('content.back')}
      </Link>
      <PageTitle
        title={entry.title.en || entry.slug}
        subtitle={t('content.lastUpdated', { date: entry.updatedAt.toLocaleString() })}
        action={<Badge value={entry.status} label={t(`content.status.${entry.status}`)} />}
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
                      {t('common.type')}
                    </label>
                    <select id="type" name="type" defaultValue={entry.type} className={inputClass}>
                      {TYPES.map((ty) => (
                        <option key={ty} value={ty} className="capitalize">
                          {t(`content.type.${ty}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Field label={t('content.slug')} name="slug" defaultValue={entry.slug} required />
                </div>

                <LocalizedField label={t('common.title')} prefix="title" value={entry.title} required />
                <LocalizedField label={t('content.excerpt')} prefix="excerpt" value={entry.excerpt} />
                <LocalizedField label={t('content.body')} prefix="body" value={entry.body} textarea />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t('content.coverImage')} name="coverImage" defaultValue={entry.coverImage ?? ''} placeholder="https://…" />
                  <Field label={t('content.tags')} name="tags" defaultValue={entry.tags.join(', ')} />
                </div>

                <div>
                  <label className={labelClass} htmlFor="status">
                    {t('common.status')}
                  </label>
                  <select id="status" name="status" defaultValue={entry.status} className={inputClass}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {t(`content.status.${s}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <LocalizedField label={t('content.seoTitle')} prefix="seoTitle" value={entry.seoTitle} />
                <LocalizedField label={t('content.seoDescription')} prefix="seoDescription" value={entry.seoDescription} />

                <div className="flex justify-end">
                  <SubmitButton>{t('common.saveChanges')}</SubmitButton>
                </div>
              </form>
            ) : (
              <p className="text-sm text-slate-400">{t('content.readOnly')}</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {canPublish && (
            <Card className="p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('content.publishing')}</h2>
              {entry.status === 'published' ? (
                <>
                  <p className="mb-4 text-sm text-slate-500">
                    {t('content.publishedInfo', { date: entry.publishedAt ? entry.publishedAt.toLocaleString() : '' })}
                  </p>
                  <form action={unpublishContent}>
                    <input type="hidden" name="id" value={entry.id} />
                    <SubmitButton variant="secondary" className="w-full">
                      {t('content.unpublish')}
                    </SubmitButton>
                  </form>
                </>
              ) : (
                <>
                  <p className="mb-4 text-sm text-slate-500">{t('content.publishInfo')}</p>
                  <form action={publishContent}>
                    <input type="hidden" name="id" value={entry.id} />
                    <SubmitButton className="w-full">{t('content.publish')}</SubmitButton>
                  </form>
                </>
              )}
            </Card>
          )}

          {editable && (
            <Card className="p-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('common.dangerZone')}</h2>
              <p className="mb-4 text-sm text-slate-500">{t('content.deleteInfo')}</p>
              <DeleteButton
                action={async () => {
                  'use server';
                  const fd = new FormData();
                  fd.set('id', entry.id);
                  await deleteContent(fd);
                }}
                confirm={t('content.confirmDelete')}
                label={t('common.delete')}
              />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
