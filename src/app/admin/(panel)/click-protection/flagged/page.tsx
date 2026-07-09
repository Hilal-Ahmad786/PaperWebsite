import Link from 'next/link';
import { ArrowLeft, Download, Search } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured } from '@/db';
import { PageTitle, NotConfigured, DataTable, Th, Td, Badge, EmptyState, Flash, LinkButton } from '@/components/admin/bits';
import { listFlaggedIps } from '@/db/repo/click-protection';
import type { FlaggedStatus } from '@/lib/click-protection/types';

export const dynamic = 'force-dynamic';

const STATUSES = ['watching', 'flagged', 'excluded', 'whitelisted'] as const;

function scoreColor(score: number): string {
  if (score >= 85) return 'text-red-600';
  if (score >= 75) return 'text-amber-600';
  return 'text-slate-700';
}

export default async function FlaggedIpsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; ok?: string; error?: string }>;
}) {
  await requirePermission('clickprotection.read');
  const sp = await searchParams;

  if (!isDbConfigured) {
    return (
      <>
        <PageTitle title="Flagged IPs" subtitle="Reviewable per-IP fraud records" />
        <NotConfigured message="Connect a database to review flagged IPs." />
      </>
    );
  }

  const activeStatus = STATUSES.includes(sp.status as FlaggedStatus) ? (sp.status as FlaggedStatus) : undefined;
  const search = sp.search?.trim() || undefined;
  const rows = await listFlaggedIps({ status: activeStatus, search });

  return (
    <>
      <Link href="/admin/click-protection" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to overview
      </Link>
      <PageTitle
        title="Flagged IPs"
        subtitle="Reviewable per-IP fraud records"
        action={
          <LinkButton href="/admin/click-protection/flagged/export" variant="secondary">
            <Download size={16} /> Export exclusion list
          </LinkButton>
        }
      />
      <Flash ok={sp.ok} error={sp.error} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterPill href="/admin/click-protection/flagged" active={!activeStatus} label="All" />
        {STATUSES.map((s) => (
          <FilterPill
            key={s}
            href={`/admin/click-protection/flagged?status=${s}`}
            active={activeStatus === s}
            label={s}
          />
        ))}
        <form action="/admin/click-protection/flagged" method="get" className="ml-auto flex items-center gap-2">
          {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="search"
              defaultValue={search ?? ''}
              placeholder="Search IP…"
              className="h-10 w-56 rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </form>
      </div>

      {rows.length === 0 ? (
        <EmptyState message="No IPs match this filter." />
      ) : (
        <DataTable
          head={
            <>
              <Th>IP</Th>
              <Th>Score</Th>
              <Th>Clicks</Th>
              <Th>Conv.</Th>
              <Th>Country</Th>
              <Th>ISP</Th>
              <Th>Flags</Th>
              <Th>Status</Th>
              <Th>Last seen</Th>
            </>
          }
        >
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50">
              <Td>
                <Link
                  href={`/admin/click-protection/flagged/${encodeURIComponent(r.ipAddress)}`}
                  className="font-medium text-slate-900 hover:text-emerald-600"
                >
                  {r.ipAddress}
                </Link>
              </Td>
              <Td>
                <span className={`font-semibold ${scoreColor(r.fraudScore)}`}>{r.fraudScore}</span>
              </Td>
              <Td>{r.totalClicks}</Td>
              <Td>{r.totalConversions}</Td>
              <Td>{r.country ?? '—'}</Td>
              <Td className="max-w-[180px] truncate">{r.isp ?? '—'}</Td>
              <Td>
                <IntelChips isDatacenter={r.isDatacenter} isVpn={r.isVpn} isProxy={r.isProxy} />
              </Td>
              <Td>
                <Badge value={r.status} />
              </Td>
              <Td>{r.lastSeen?.toLocaleDateString() ?? '—'}</Td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}

function IntelChips({
  isDatacenter,
  isVpn,
  isProxy,
}: {
  isDatacenter?: boolean | null;
  isVpn?: boolean | null;
  isProxy?: boolean | null;
}) {
  const chips: string[] = [];
  if (isDatacenter) chips.push('DC');
  if (isVpn) chips.push('VPN');
  if (isProxy) chips.push('Proxy');
  if (chips.length === 0) return <span className="text-slate-400">—</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {chips.map((c) => (
        <span key={c} className="inline-flex items-center rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-600/20">
          {c}
        </span>
      ))}
    </span>
  );
}

function FilterPill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
        active ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </Link>
  );
}
