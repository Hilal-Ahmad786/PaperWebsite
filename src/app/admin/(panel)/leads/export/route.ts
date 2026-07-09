import { desc } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured, requireDb } from '@/db';
import { leads } from '@/db/schema';
import { recordAudit } from '@/lib/admin/audit';

export const dynamic = 'force-dynamic';

function csvCell(value: unknown): string {
  const s = value == null ? '' : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const user = await requirePermission('leads.export');
  if (!isDbConfigured) {
    return new Response('Database not configured', { status: 503 });
  }
  const db = requireDb();
  const rows = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(5000);

  const headers = [
    'id',
    'created_at',
    'name',
    'company',
    'email',
    'phone',
    'country',
    'vat_id',
    'product',
    'quantity',
    'stage',
    'priority',
    'source',
    'locale',
    'message',
  ];
  const lines = [headers.join(',')];
  for (const l of rows) {
    lines.push(
      [
        l.id,
        l.createdAt.toISOString(),
        l.name,
        l.company,
        l.email,
        l.phone,
        l.country,
        l.vatId,
        l.product,
        l.quantity,
        l.stage,
        l.priority,
        l.source,
        l.locale,
        l.message,
      ]
        .map(csvCell)
        .join(',')
    );
  }

  await recordAudit({ actorUserId: user.id, action: 'leads.export', summary: `${rows.length} rows` });

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="inquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
