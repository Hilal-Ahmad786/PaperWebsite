import Link from 'next/link';
import { RANGE_KEYS, type RangeKey } from '@/lib/admin/date-range';
import type { Translator } from '@/lib/admin/i18n';

interface DateRangeFilterProps {
  /** Page path the filter navigates to, e.g. "/admin/leads". */
  basePath: string;
  /** Currently active range key (from resolveDateRange). */
  active: RangeKey;
  /** Custom range values echoed back into the date inputs. */
  from?: string;
  to?: string;
  /** Other query params to keep when switching range (e.g. { stage }). */
  preserve?: Record<string, string | undefined>;
  t: Translator;
}

function buildHref(basePath: string, params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

const pill = (activePill: boolean) =>
  `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
    activePill
      ? 'bg-emerald-600 text-white'
      : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
  }`;

const dateInput =
  'h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';

/**
 * Reusable date-range filter for admin reports: preset pills (today, yesterday,
 * last 7/14 days, last month/year, all time) plus a custom From/To range. It is
 * a plain GET-navigation control — no client JS — so it works in server pages.
 */
export function DateRangeFilter({ basePath, active, from, to, preserve = {}, t }: DateRangeFilterProps) {
  const hiddenPreserve = Object.entries(preserve).filter(([, v]) => Boolean(v)) as [string, string][];

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {t('daterange.label')}
      </span>

      {RANGE_KEYS.map((key) => (
        <Link
          key={key}
          href={buildHref(basePath, { ...preserve, range: key })}
          className={pill(active === key)}
        >
          {t(`daterange.${key}`)}
        </Link>
      ))}

      <form method="get" action={basePath} className="flex flex-wrap items-center gap-2">
        {hiddenPreserve.map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <input type="hidden" name="range" value="custom" />
        <input
          type="date"
          name="from"
          defaultValue={from}
          aria-label={t('daterange.from')}
          className={dateInput}
        />
        <span className="text-slate-400">–</span>
        <input
          type="date"
          name="to"
          defaultValue={to}
          aria-label={t('daterange.to')}
          className={dateInput}
        />
        <button
          type="submit"
          className={`h-9 rounded-lg px-3 text-sm font-semibold transition-colors ${
            active === 'custom'
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {t('daterange.apply')}
        </button>
      </form>
    </div>
  );
}
