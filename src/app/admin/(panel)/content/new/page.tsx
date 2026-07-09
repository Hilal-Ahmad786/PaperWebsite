import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { PageTitle, Card, NotConfigured, Flash, Field, LocalizedField, inputClass, labelClass } from '@/components/admin/bits';
import { SubmitButton } from '@/components/admin/form-controls';
import { createContent } from '@/lib/admin/content-actions';
import { getAdminT } from '@/lib/admin/i18n';

export const dynamic = 'force-dynamic';

const TYPES = ['insight', 'page', 'faq'];
const STATUSES = ['draft', 'scheduled', 'published', 'archived'];

export default async function NewContentPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requirePermission('content.write');
  const sp = await searchParams;
  const { t } = await getAdminT();

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title={t('content.newTitle')} subtitle={t('content.newSubtitle')} />
        <NotConfigured message={t('content.notConfiguredCreate')} />
      </>
    );
  }

  return (
    <>
      <Link
        href="/admin/content"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={16} /> {t('content.back')}
      </Link>
      <PageTitle title={t('content.newTitle')} subtitle={t('content.newSubtitle')} />
      <Flash ok={sp.ok} error={sp.error} />

      <Card className="p-6">
        <form action={createContent} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="type">
                {t('common.type')}
              </label>
              <select id="type" name="type" defaultValue="insight" className={inputClass}>
                {TYPES.map((ty) => (
                  <option key={ty} value={ty} className="capitalize">
                    {t(`content.type.${ty}`)}
                  </option>
                ))}
              </select>
            </div>
            <Field label={t('content.slug')} name="slug" placeholder="market-outlook-2026" required />
          </div>

          <LocalizedField label={t('common.title')} prefix="title" required />
          <LocalizedField label={t('content.excerpt')} prefix="excerpt" />
          <LocalizedField label={t('content.body')} prefix="body" textarea />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('content.coverImage')} name="coverImage" placeholder="https://…" />
            <Field label={t('content.tags')} name="tags" placeholder="pricing, europe, occ" />
          </div>

          <div>
            <label className={labelClass} htmlFor="status">
              {t('common.status')}
            </label>
            <select id="status" name="status" defaultValue="draft" className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {t(`content.status.${s}`)}
                </option>
              ))}
            </select>
          </div>

          <LocalizedField label={t('content.seoTitle')} prefix="seoTitle" />
          <LocalizedField label={t('content.seoDescription')} prefix="seoDescription" />

          <div className="flex justify-end">
            <SubmitButton>{t('content.createContent')}</SubmitButton>
          </div>
        </form>
      </Card>
    </>
  );
}
