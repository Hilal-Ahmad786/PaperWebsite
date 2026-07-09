'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireDb } from '@/db';
import { flaggedIps } from '@/db/schema';
import { requirePermission } from '@/lib/auth/guard';
import { recordAudit } from '@/lib/admin/audit';
import { setAvgCpc } from '@/db/repo/click-protection';
import { runAggregateJob } from '@/lib/click-protection/aggregate';

const STATUSES = ['watching', 'flagged', 'excluded', 'whitelisted'] as const;

const FLAGGED = '/admin/click-protection/flagged';
function ipDetail(ip: string) {
  return `${FLAGGED}/${encodeURIComponent(ip)}`;
}

const statusSchema = z.object({
  ip: z.string().min(1),
  status: z.enum(STATUSES),
});

/** Manually set an IP's review status (watching | flagged | excluded | whitelisted). */
export async function setIpStatus(formData: FormData) {
  const user = await requirePermission('clickprotection.write');
  const parsed = statusSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect(`${FLAGGED}?error=${encodeURIComponent('Invalid input')}`);
  const { ip, status } = parsed.data;

  const db = requireDb();
  await db
    .update(flaggedIps)
    .set({ status, manuallyReviewed: true, updatedAt: new Date() })
    .where(eq(flaggedIps.ipAddress, ip));
  await recordAudit({
    actorUserId: user.id,
    action: 'clickprotection.status',
    entityType: 'flagged_ip',
    entityId: ip,
    summary: `Status → ${status}`,
  });
  revalidatePath(FLAGGED);
  revalidatePath(ipDetail(ip));
  redirect(`${FLAGGED}?ok=${encodeURIComponent(`${ip} → ${status}`)}`);
}

/** Shortcut: mark an IP as a trusted / real visitor. */
export async function whitelistIp(formData: FormData) {
  const user = await requirePermission('clickprotection.write');
  const ip = String(formData.get('ip') ?? '').trim();
  if (!ip) redirect(`${FLAGGED}?error=${encodeURIComponent('Missing IP')}`);

  const db = requireDb();
  await db
    .update(flaggedIps)
    .set({ status: 'whitelisted', manuallyReviewed: true, updatedAt: new Date() })
    .where(eq(flaggedIps.ipAddress, ip));
  await recordAudit({
    actorUserId: user.id,
    action: 'clickprotection.whitelist',
    entityType: 'flagged_ip',
    entityId: ip,
    summary: `${ip} whitelisted`,
  });
  revalidatePath(FLAGGED);
  revalidatePath(ipDetail(ip));
  redirect(`${FLAGGED}?ok=${encodeURIComponent(`${ip} whitelisted`)}`);
}

/** Attach / replace an internal note on a flagged IP. */
export async function addIpNote(formData: FormData) {
  const user = await requirePermission('clickprotection.write');
  const ip = String(formData.get('ip') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();
  if (!ip) redirect(`${FLAGGED}?error=${encodeURIComponent('Missing IP')}`);

  const db = requireDb();
  await db
    .update(flaggedIps)
    .set({ notes: note || null, updatedAt: new Date() })
    .where(eq(flaggedIps.ipAddress, ip));
  await recordAudit({
    actorUserId: user.id,
    action: 'clickprotection.note',
    entityType: 'flagged_ip',
    entityId: ip,
  });
  revalidatePath(ipDetail(ip));
  redirect(`${ipDetail(ip)}?ok=${encodeURIComponent('Note saved')}`);
}

const cpcSchema = z.object({ avgCpc: z.coerce.number().min(0).max(1000) });

/** Store the average cost-per-click used to estimate wasted spend. */
export async function saveAvgCpc(formData: FormData) {
  const user = await requirePermission('clickprotection.write');
  const parsed = cpcSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect(`/admin/click-protection?error=${encodeURIComponent('Enter a valid CPC')}`);

  await setAvgCpc(parsed.data.avgCpc, user.id);
  await recordAudit({
    actorUserId: user.id,
    action: 'clickprotection.avg_cpc',
    entityType: 'setting',
    summary: `Average CPC → ${parsed.data.avgCpc}`,
  });
  revalidatePath('/admin/click-protection');
  redirect(`/admin/click-protection?ok=${encodeURIComponent('Average CPC saved')}`);
}

/** Run the detection / aggregation pass on demand. */
export async function runJobNow() {
  const user = await requirePermission('clickprotection.write');
  const result = await runAggregateJob();
  await recordAudit({
    actorUserId: user.id,
    action: 'clickprotection.run',
    entityType: 'job',
    summary: `Rescored ${result.rescored}, evaluated ${result.ipsEvaluated} IPs`,
  });
  revalidatePath('/admin/click-protection');
  redirect(`/admin/click-protection?ok=${encodeURIComponent('Detection run')}`);
}
