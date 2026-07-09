import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured } from '@/db';
import { recordAudit } from '@/lib/admin/audit';
import { getExclusionIps } from '@/db/repo/click-protection';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await requirePermission('clickprotection.read');
  if (!isDbConfigured) {
    return new Response('Database not configured', { status: 503 });
  }

  const ips = await getExclusionIps();
  const lines = ['ip', ...ips];

  await recordAudit({
    actorUserId: user.id,
    action: 'clickprotection.export_exclusion',
    summary: `${ips.length} IPs`,
  });

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="ip-exclusion-list-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
