import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured } from '@/db';
import { recordAudit } from '@/lib/admin/audit';
import { getRefundRows } from '@/db/repo/click-protection';

export const dynamic = 'force-dynamic';

function csvCell(value: unknown): string {
  const s = value == null ? '' : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const user = await requirePermission('clickprotection.read');
  if (!isDbConfigured) {
    return new Response('Database not configured', { status: 503 });
  }

  const rows = await getRefundRows();
  const headers = ['ip', 'total_clicks', 'fraud_score', 'country', 'isp', 'last_seen'];
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(
      [r.ipAddress, r.totalClicks, r.fraudScore, r.country, r.isp, r.lastSeen?.toISOString()]
        .map(csvCell)
        .join(',')
    );
  }

  await recordAudit({
    actorUserId: user.id,
    action: 'clickprotection.export_refund',
    summary: `${rows.length} rows`,
  });

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="refund-report-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
