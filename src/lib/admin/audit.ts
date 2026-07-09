import { headers } from 'next/headers';
import { isDbConfigured, requireDb } from '@/db';
import { auditLogs } from '@/db/schema';

interface AuditInput {
  actorUserId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
}

/** Best-effort append to the audit trail. Never throws to callers. */
export async function recordAudit(input: AuditInput): Promise<void> {
  if (!isDbConfigured) return;
  try {
    const hdrs = await headers();
    const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
    const userAgent = hdrs.get('user-agent') ?? null;
    await requireDb().insert(auditLogs).values({
      actorUserId: input.actorUserId ?? undefined,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      summary: input.summary,
      metadata: input.metadata,
      ip,
      userAgent,
    });
  } catch {
    // Auditing must never break the primary action.
  }
}
