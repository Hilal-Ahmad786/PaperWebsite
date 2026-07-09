import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { siteSettings } from '@/db/schema';
import { PageTitle, Card, Flash, Field, NotConfigured } from '@/components/admin/bits';
import { SubmitButton } from '@/components/admin/form-controls';
import { BRAND_SETTING_KEYS } from '@/lib/admin/settings-keys';
import { saveSettings } from '@/lib/admin/settings-actions';

export const dynamic = 'force-dynamic';

function coerce(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requirePermission('settings.manage');
  const sp = await searchParams;

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title="Settings" subtitle="Brand & contact information" />
        <NotConfigured message="Connect a database to manage site settings." />
      </>
    );
  }

  const rows = await db.select().from(siteSettings);
  const values = new Map(rows.map((r) => [r.key, coerce(r.value)]));

  return (
    <>
      <PageTitle title="Settings" subtitle="Brand & contact information used across the public site." />
      <Flash ok={sp.ok} error={sp.error} />

      <Card className="max-w-2xl p-6">
        <form action={saveSettings} className="space-y-4">
          {BRAND_SETTING_KEYS.map((s) => (
            <Field key={s.key} label={s.label} name={s.key} defaultValue={values.get(s.key) ?? ''} />
          ))}
          <SubmitButton>Save settings</SubmitButton>
        </form>
      </Card>
    </>
  );
}
