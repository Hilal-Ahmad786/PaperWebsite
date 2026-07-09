import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { PageTitle, Card, Flash, Field, LocalizedField, inputClass, labelClass } from '@/components/admin/bits';
import { SubmitButton } from '@/components/admin/form-controls';
import { createIndex } from '@/lib/admin/market-actions';

export const dynamic = 'force-dynamic';

const TRENDS = ['up', 'down', 'flat'] as const;

export default async function NewIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requirePermission('market.write');
  const sp = await searchParams;

  return (
    <>
      <Link href="/admin/market" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to market indices
      </Link>
      <PageTitle title="New index" subtitle="Add a market index row for the public ticker" />
      <Flash ok={sp.ok} error={sp.error} />

      <Card className="max-w-3xl p-6">
        <form action={createIndex} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Code" name="code" placeholder="e.g. KRAFTLINER_EU" required />
            <Field label="Region" name="region" placeholder="e.g. EU" />
          </div>

          <LocalizedField label="Label" prefix="label" required />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Value" name="value" placeholder="e.g. €650/MT" />
            <Field label="Unit" name="unit" placeholder="e.g. MT" />
            <Field label="Change %" name="changePct" placeholder="e.g. +1.2%" />
            <div>
              <label className={labelClass} htmlFor="trend">
                Trend
              </label>
              <select id="trend" name="trend" defaultValue="flat" className={inputClass}>
                {TRENDS.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Sort order" name="sortOrder" type="number" defaultValue="0" />
          </div>

          <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30"
            />
            Active (visible on the public site)
          </label>

          <div className="flex gap-3">
            <SubmitButton>Create index</SubmitButton>
          </div>
        </form>
      </Card>
    </>
  );
}
