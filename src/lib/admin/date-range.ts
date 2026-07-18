// Shared date-range resolver for admin reports (Leads, Button Clicks, Analytics).
//
// Reads `range` (+ optional `from`/`to` for custom) from the page search params
// and returns concrete [from, to) style bounds. `from`/`to` are `undefined` when
// there is no bound (e.g. "All time"), so callers can build a Drizzle condition
// like: and(from ? gte(col, from) : undefined, to ? lte(col, to) : undefined).

export type RangeKey =
  | 'today'
  | 'yesterday'
  | '7d'
  | '14d'
  | '1m'
  | '1y'
  | 'all'
  | 'custom';

/** Preset pills shown in the UI, in order (custom is handled separately). */
export const RANGE_KEYS: RangeKey[] = ['today', 'yesterday', '7d', '14d', '1m', '1y', 'all'];

export interface ResolvedRange {
  key: RangeKey;
  from?: Date;
  to?: Date;
  /** Echoed back to the custom date inputs (YYYY-MM-DD). */
  fromParam?: string;
  toParam?: string;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function isValid(d: Date): boolean {
  return !Number.isNaN(d.getTime());
}

export interface DateRangeInput {
  range?: string;
  from?: string;
  to?: string;
}

/**
 * Resolve the selected range into bounds. `defaultKey` is used when no `range`
 * param is present (e.g. Button Clicks defaults to the last month). `now` is
 * injectable for testing.
 */
export function resolveDateRange(
  input: DateRangeInput,
  defaultKey: RangeKey = 'all',
  now: Date = new Date(),
): ResolvedRange {
  const raw = (input.range as RangeKey) || defaultKey;
  const key: RangeKey = (RANGE_KEYS as string[]).includes(raw) || raw === 'custom' ? raw : defaultKey;
  const todayStart = startOfDay(now);

  switch (key) {
    case 'today':
      return { key, from: todayStart, to: now };
    case 'yesterday': {
      const from = new Date(todayStart);
      from.setDate(from.getDate() - 1);
      return { key, from, to: todayStart };
    }
    case '7d': {
      const from = new Date(now);
      from.setDate(from.getDate() - 7);
      return { key, from, to: now };
    }
    case '14d': {
      const from = new Date(now);
      from.setDate(from.getDate() - 14);
      return { key, from, to: now };
    }
    case '1m': {
      const from = new Date(now);
      from.setMonth(from.getMonth() - 1);
      return { key, from, to: now };
    }
    case '1y': {
      const from = new Date(now);
      from.setFullYear(from.getFullYear() - 1);
      return { key, from, to: now };
    }
    case 'custom': {
      const from = input.from ? startOfDay(new Date(input.from)) : undefined;
      const to = input.to ? endOfDay(new Date(input.to)) : undefined;
      return {
        key: 'custom',
        from: from && isValid(from) ? from : undefined,
        to: to && isValid(to) ? to : undefined,
        fromParam: input.from,
        toParam: input.to,
      };
    }
    case 'all':
    default:
      return { key: 'all' };
  }
}
