import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Languages } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { SITE_LOCALES } from '@/lib/admin/localized';
import { PageTitle, DataTable, Th, Td, StatCard } from '@/components/admin/bits';
import { getAdminT } from '@/lib/admin/i18n';

export const dynamic = 'force-dynamic';

/** Flatten a nested message catalog to dotted leaf keys → string values. */
function flatten(obj: unknown, prefix = '', out: Record<string, string> = {}): Record<string, string> {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, out);
    }
  } else {
    out[prefix] = obj == null ? '' : String(obj);
  }
  return out;
}

function loadCatalog(locale: string): Record<string, string> {
  try {
    const raw = readFileSync(path.join(process.cwd(), 'messages', `${locale}.json`), 'utf8');
    return flatten(JSON.parse(raw));
  } catch {
    return {};
  }
}

export default async function TranslationsPage() {
  await requirePermission('translations.read');
  const { t } = await getAdminT();

  const source = loadCatalog('en');
  const sourceKeys = Object.keys(source);
  const totalKeys = sourceKeys.length;

  const targetLocales = SITE_LOCALES.filter((l) => l !== 'en');
  const rows = targetLocales.map((locale) => {
    const catalog = loadCatalog(locale);
    let translated = 0;
    for (const key of sourceKeys) {
      const v = catalog[key];
      if (v != null && v.trim() !== '') translated += 1;
    }
    const missing = totalKeys - translated;
    const coverage = totalKeys ? Math.round((translated / totalKeys) * 100) : 0;
    return { locale, translated, missing, coverage };
  });

  const avgCoverage = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.coverage, 0) / rows.length)
    : 0;

  return (
    <>
      <PageTitle
        title={t('translations.title')}
        subtitle={t('translations.subtitle')}
      />

      <p className="mb-6 max-w-2xl text-sm text-slate-500">
        {t('translations.catalogsIntro')}<code className="rounded bg-slate-100 px-1 py-0.5 text-xs">messages/*.json</code>
        {t('translations.catalogsMid1')}<code className="rounded bg-slate-100 px-1 py-0.5 text-xs">messages/en.json</code>
        {t('translations.catalogsMid2')}
      </p>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label={t('translations.sourceKeys')} value={totalKeys} icon={Languages} accent />
        <StatCard label={t('translations.locales')} value={targetLocales.length} />
        <StatCard label={t('translations.avgCoverage')} value={`${avgCoverage}%`} />
      </div>

      <DataTable
        head={
          <>
            <Th>{t('translations.locale')}</Th>
            <Th>{t('translations.keys')}</Th>
            <Th>{t('translations.translated')}</Th>
            <Th>{t('translations.missing')}</Th>
            <Th>{t('translations.coverage')}</Th>
          </>
        }
      >
        {rows.map((r) => (
          <tr key={r.locale} className="hover:bg-slate-50">
            <Td className="font-medium uppercase text-slate-900">{r.locale}</Td>
            <Td>{totalKeys}</Td>
            <Td>{r.translated}</Td>
            <Td className={r.missing > 0 ? 'text-amber-600' : 'text-slate-700'}>{r.missing}</Td>
            <Td>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${r.coverage}%` }} />
                </div>
                <span className="text-xs font-medium text-slate-600">{r.coverage}%</span>
              </div>
            </Td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
