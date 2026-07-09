import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { PageTitle, Card, NotConfigured, Flash, Field, LocalizedField, inputClass, labelClass } from '@/components/admin/bits';
import { SubmitButton } from '@/components/admin/form-controls';
import { createContent } from '@/lib/admin/content-actions';

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

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title="New content" subtitle="Create an insight, page or FAQ" />
        <NotConfigured message="Connect a database to create content." />
      </>
    );
  }

  return (
    <>
      <Link
        href="/admin/content"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={16} /> Back to content
      </Link>
      <PageTitle title="New content" subtitle="Create an insight, page or FAQ" />
      <Flash ok={sp.ok} error={sp.error} />

      <Card className="p-6">
        <form action={createContent} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="type">
                Type
              </label>
              <select id="type" name="type" defaultValue="insight" className={inputClass}>
                {TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Slug" name="slug" placeholder="market-outlook-2026" required />
          </div>

          <LocalizedField label="Title" prefix="title" required />
          <LocalizedField label="Excerpt" prefix="excerpt" />
          <LocalizedField label="Body" prefix="body" textarea />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cover image URL" name="coverImage" placeholder="https://…" />
            <Field label="Tags (comma-separated)" name="tags" placeholder="pricing, europe, occ" />
          </div>

          <div>
            <label className={labelClass} htmlFor="status">
              Status
            </label>
            <select id="status" name="status" defaultValue="draft" className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <LocalizedField label="SEO title" prefix="seoTitle" />
          <LocalizedField label="SEO description" prefix="seoDescription" />

          <div className="flex justify-end">
            <SubmitButton>Create content</SubmitButton>
          </div>
        </form>
      </Card>
    </>
  );
}
