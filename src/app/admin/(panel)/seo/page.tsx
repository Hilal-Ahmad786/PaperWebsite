import { requirePermission, can } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { siteSettings } from '@/db/schema';
import { PageTitle, Card, Flash, Field, NotConfigured } from '@/components/admin/bits';
import { SubmitButton } from '@/components/admin/form-controls';
import { SEO_SETTING_KEYS } from '@/lib/admin/settings-keys';
import { saveSeoSettings } from '@/lib/admin/settings-actions';
import { getAdminT } from '@/lib/admin/i18n';

export const dynamic = 'force-dynamic';

function coerce(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

export default async function SeoPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requirePermission('seo.read');
  const sp = await searchParams;
  const { t } = await getAdminT();

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title={t('seo.title')} subtitle={t('seo.subtitleShort')} />
        <NotConfigured message={t('seo.notConfigured')} />
      </>
    );
  }

  const canWrite = can(user, 'seo.write');
  const rows = await db.select().from(siteSettings);
  const values = new Map(rows.map((r) => [r.key, coerce(r.value)]));

  return (
    <>
      <PageTitle title={t('seo.title')} subtitle={t('seo.subtitle')} />
      <Flash ok={sp.ok} error={sp.error} />

      <Card className="max-w-2xl p-6">
        <p className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
          {t('seo.infoNote')}
        </p>
        <form action={saveSeoSettings} className="space-y-4">
          {SEO_SETTING_KEYS.map((s) => (
            <Field key={s.key} label={s.label} name={s.key} defaultValue={values.get(s.key) ?? ''} />
          ))}
          {canWrite ? (
            <SubmitButton>{t('seo.saveSettings')}</SubmitButton>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white opacity-60"
            >
              {t('seo.saveSettings')}
            </button>
          )}
        </form>
        {!canWrite && (
          <p className="mt-3 text-sm text-slate-400">{t('seo.readOnly')}</p>
        )}
      </Card>
    </>
  );
}
