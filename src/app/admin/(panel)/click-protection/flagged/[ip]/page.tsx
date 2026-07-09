import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { requirePermission, can } from '@/lib/auth/guard';
import { isDbConfigured } from '@/db';
import { PageTitle, Card, Flash, Badge, inputClass, labelClass } from '@/components/admin/bits';
import { SubmitButton } from '@/components/admin/form-controls';
import { getFlaggedIp } from '@/db/repo/click-protection';
import { setIpStatus, whitelistIp, addIpNote } from '@/lib/admin/click-protection-actions';

export const dynamic = 'force-dynamic';

const STATUSES = ['watching', 'flagged', 'excluded', 'whitelisted'] as const;

function scoreColor(score: number): string {
  if (score >= 85) return 'text-red-600';
  if (score >= 75) return 'text-amber-600';
  return 'text-slate-700';
}

export default async function FlaggedIpDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ ip: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requirePermission('clickprotection.read');
  const { ip: rawIp } = await params;
  const sp = await searchParams;
  const ip = decodeURIComponent(rawIp);

  if (!isDbConfigured) {
    return (
      <>
        <PageTitle title={ip} subtitle="Flagged IP" />
        <Flash ok={sp.ok} error={sp.error} />
      </>
    );
  }

  const row = await getFlaggedIp(ip);
  if (!row) notFound();

  const canWrite = can(user, 'clickprotection.write');

  const details: [string, string | number | null | undefined][] = [
    ['Total clicks', row.totalClicks],
    ['Total conversions', row.totalConversions],
    ['Country', row.country],
    ['ISP', row.isp],
    ['Datacenter', row.isDatacenter ? 'yes' : 'no'],
    ['VPN', row.isVpn ? 'yes' : 'no'],
    ['Proxy', row.isProxy ? 'yes' : 'no'],
    ['Manually reviewed', row.manuallyReviewed ? 'yes' : 'no'],
    ['First seen', row.firstSeen?.toLocaleString()],
    ['Last seen', row.lastSeen?.toLocaleString()],
  ];

  return (
    <>
      <Link href="/admin/click-protection/flagged" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to flagged IPs
      </Link>
      <PageTitle
        title={ip}
        subtitle="Flagged IP record"
        action={
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${scoreColor(row.fraudScore)}`}>{row.fraudScore}</span>
            <Badge value={row.status} />
          </div>
        }
      />
      <Flash ok={sp.ok} error={sp.error} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Details</h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {details.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-medium text-slate-400">{k}</dt>
                  <dd className="text-sm text-slate-800">{v == null || v === '' ? '—' : v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Fraud reasons</h2>
            {!row.reasons || row.reasons.length === 0 ? (
              <p className="text-sm text-slate-400">No signals recorded.</p>
            ) : (
              <ul className="space-y-2">
                {row.reasons.map((reason, i) => (
                  <li key={`${reason.code}-${i}`} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <span className="text-sm text-slate-700">{reason.label}</span>
                    <span className="text-xs font-semibold text-slate-500">+{reason.weight}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Review</h2>
            {canWrite ? (
              <div className="space-y-5">
                <form action={setIpStatus} className="space-y-3">
                  <input type="hidden" name="ip" value={ip} />
                  <div>
                    <label className={labelClass} htmlFor="status">
                      Status
                    </label>
                    <select id="status" name="status" defaultValue={row.status} className={inputClass}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <SubmitButton className="w-full">Save status</SubmitButton>
                </form>

                <form action={whitelistIp} className="border-t border-slate-100 pt-4">
                  <input type="hidden" name="ip" value={ip} />
                  <SubmitButton variant="secondary" className="w-full">
                    <ShieldCheck size={16} /> Whitelist this IP
                  </SubmitButton>
                </form>

                <form action={addIpNote} className="space-y-2 border-t border-slate-100 pt-4">
                  <input type="hidden" name="ip" value={ip} />
                  <label className={labelClass} htmlFor="note">
                    Notes
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    defaultValue={row.notes ?? ''}
                    rows={4}
                    placeholder="Why was this reviewed?"
                    className={`${inputClass} h-auto py-2`}
                  />
                  <SubmitButton variant="secondary" className="w-full">
                    Save note
                  </SubmitButton>
                </form>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-400">You have read-only access.</p>
                {row.notes && (
                  <p className="mt-3 whitespace-pre-wrap border-t border-slate-100 pt-3 text-sm text-slate-700">{row.notes}</p>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
