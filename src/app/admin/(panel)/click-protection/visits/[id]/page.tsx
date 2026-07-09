import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured } from '@/db';
import { PageTitle, Card, Badge } from '@/components/admin/bits';
import { getVisit } from '@/db/repo/click-protection';

export const dynamic = 'force-dynamic';

function scoreColor(score: number): string {
  if (score >= 85) return 'text-red-600';
  if (score >= 75) return 'text-amber-600';
  return 'text-slate-700';
}

function yesNo(v?: boolean | null): string {
  return v ? 'yes' : 'no';
}

export default async function VisitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('clickprotection.read');
  const { id } = await params;

  if (!isDbConfigured) {
    return (
      <>
        <PageTitle title="Visit" subtitle="Scored visit" />
      </>
    );
  }

  const v = await getVisit(id);
  if (!v) notFound();

  const network: [string, string | number | null | undefined][] = [
    ['IP address', v.ipAddress],
    ['Country', v.country],
    ['ISP', v.isp],
    ['Datacenter', yesNo(v.isDatacenter)],
    ['VPN', yesNo(v.isVpn)],
    ['Proxy', yesNo(v.isProxy)],
    ['Referrer', v.referrer],
    ['Landing page', v.landingPage],
  ];

  const ad: [string, string | number | null | undefined][] = [
    ['gclid', v.gclid],
    ['gbraid', v.gbraid],
    ['wbraid', v.wbraid],
    ['utm_source', v.utmSource],
    ['utm_medium', v.utmMedium],
    ['utm_campaign', v.utmCampaign],
    ['utm_term', v.utmTerm],
    ['utm_content', v.utmContent],
  ];

  const device: [string, string | number | null | undefined][] = [
    ['Session ID', v.sessionId],
    ['Fingerprint', v.fingerprintHash],
    ['Screen', v.screen],
    ['Platform', v.platform],
    ['Timezone', v.timezone],
    ['Language', v.language],
    ['CPU cores', v.hardwareConcurrency],
    ['Canvas', yesNo(v.hasCanvas)],
  ];

  const engagement: [string, string | number | null | undefined][] = [
    ['Time on page', v.timeOnPage != null ? `${v.timeOnPage}s` : null],
    ['Max scroll depth', v.maxScrollDepth != null ? `${v.maxScrollDepth}%` : null],
    ['Mouse moved', yesNo(v.mouseMoved)],
    ['Click count', v.clickCount],
    ['Converted', yesNo(v.converted)],
  ];

  const sections: [string, [string, string | number | null | undefined][]][] = [
    ['Network & IP intel', network],
    ['Ad / campaign', ad],
    ['Device fingerprint', device],
    ['Engagement', engagement],
  ];

  return (
    <>
      <Link href="/admin/click-protection/visits" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to visits
      </Link>
      <PageTitle
        title={v.ipAddress}
        subtitle={`Visit ${v.createdAt.toLocaleString()}`}
        action={
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${scoreColor(v.fraudScore)}`}>{v.fraudScore}</span>
            {v.gclid ? <Badge value="flagged" label="paid" /> : <Badge value="draft" label="organic" />}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map(([heading, rows]) => (
          <Card key={heading} className="p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{heading}</h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {rows.map(([k, val]) => (
                <div key={k}>
                  <dt className="text-xs font-medium text-slate-400">{k}</dt>
                  <dd className="break-words text-sm text-slate-800">{val == null || val === '' ? '—' : val}</dd>
                </div>
              ))}
            </dl>
          </Card>
        ))}

        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">User agent</h2>
          <p className="break-words font-mono text-xs text-slate-700">{v.userAgent ?? '—'}</p>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Fraud reasons</h2>
          {!v.fraudReasons || v.fraudReasons.length === 0 ? (
            <p className="text-sm text-slate-400">No signals recorded.</p>
          ) : (
            <ul className="space-y-2">
              {v.fraudReasons.map((reason, i) => (
                <li key={`${reason.code}-${i}`} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="text-sm text-slate-700">{reason.label}</span>
                  <span className="text-xs font-semibold text-slate-500">+{reason.weight}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
