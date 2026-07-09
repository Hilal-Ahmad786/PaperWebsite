import Link from 'next/link';
import { Database, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SITE_LOCALES, type Localized } from '@/lib/admin/localized';

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent,
}: {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <span
            className={cn(
              'grid h-9 w-9 place-items-center rounded-lg',
              accent ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
            )}
          >
            <Icon size={18} />
          </span>
        )}
      </div>
      <p className={cn('mt-3 text-3xl font-bold', accent ? 'text-emerald-600' : 'text-slate-900')}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>{children}</div>
  );
}

export function NotConfigured({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-500">
        <Database size={24} />
      </div>
      <p className="mt-4 max-w-md text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

/** Success/error flash banner driven by ?ok= / ?error= query params. */
export function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <div
      className={cn(
        'mb-4 rounded-lg border px-4 py-3 text-sm font-medium',
        error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      )}
    >
      {error ?? ok}
    </div>
  );
}

const BADGE_TONES: Record<string, string> = {
  new: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  contacted: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  qualifying: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  quoted: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  negotiation: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  won: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  lost: 'bg-red-50 text-red-700 ring-red-600/20',
  available: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  reserved: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  sold: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  hidden: 'bg-slate-100 text-slate-500 ring-slate-500/20',
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  draft: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  scheduled: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  archived: 'bg-slate-100 text-slate-500 ring-slate-500/20',
};

export function Badge({ value, label }: { value: string; label?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        BADGE_TONES[value] ?? 'bg-slate-100 text-slate-600 ring-slate-500/20'
      )}
    >
      {label ?? value}
    </span>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 text-sm text-slate-700', className)}>{children}</td>;
}

export function DataTable({ head, children }: { head: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>{head}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
    </Card>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'danger';

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
};

export function LinkButton({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors',
        BUTTON_STYLES[variant]
      )}
    >
      {children}
    </Link>
  );
}

export const inputClass =
  'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20';

export const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

/**
 * A localized field group: one input (or textarea) per site locale, named
 * `<prefix>.<locale>`. English is shown first and marked required.
 */
export function LocalizedField({
  label,
  prefix,
  value,
  textarea,
  required,
}: {
  label: string;
  prefix: string;
  value?: Localized | null;
  textarea?: boolean;
  required?: boolean;
}) {
  return (
    <fieldset className="rounded-lg border border-slate-200 p-4">
      <legend className="px-1 text-sm font-medium text-slate-700">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {SITE_LOCALES.map((loc) => (
          <div key={loc}>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-400" htmlFor={`${prefix}.${loc}`}>
              {loc}
              {loc === 'en' && required && <span className="text-red-500"> *</span>}
            </label>
            {textarea ? (
              <textarea
                id={`${prefix}.${loc}`}
                name={`${prefix}.${loc}`}
                defaultValue={value?.[loc] ?? ''}
                required={loc === 'en' && required}
                rows={3}
                className={cn(inputClass, 'h-auto py-2')}
              />
            ) : (
              <input
                id={`${prefix}.${loc}`}
                name={`${prefix}.${loc}`}
                defaultValue={value?.[loc] ?? ''}
                required={loc === 'en' && required}
                className={inputClass}
              />
            )}
          </div>
        ))}
      </div>
    </fieldset>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  placeholder,
  required,
  textarea,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className={labelClass} htmlFor={name}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          rows={5}
          className={cn(inputClass, 'h-auto py-2')}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className={inputClass}
        />
      )}
    </div>
  );
}
