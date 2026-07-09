'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireDb } from '@/db';
import { leads, leadNotes } from '@/db/schema';
import { requirePermission } from '@/lib/auth/guard';
import { recordAudit } from '@/lib/admin/audit';

const STAGES = ['new', 'contacted', 'qualifying', 'quoted', 'negotiation', 'won', 'lost'] as const;
const PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;

const updateSchema = z.object({
  id: z.string().uuid(),
  stage: z.enum(STAGES),
  priority: z.enum(PRIORITIES),
});

export async function updateLead(formData: FormData) {
  const user = await requirePermission('leads.write');
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect(`/admin/leads?error=${encodeURIComponent('Invalid input')}`);
  const { id, stage, priority } = parsed.data;

  const db = requireDb();
  await db.update(leads).set({ stage, priority, updatedAt: new Date() }).where(eq(leads.id, id));
  await recordAudit({
    actorUserId: user.id,
    action: 'lead.update',
    entityType: 'lead',
    entityId: id,
    summary: `Stage → ${stage}, priority → ${priority}`,
  });
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath('/admin/leads');
  redirect(`/admin/leads/${id}?ok=${encodeURIComponent('Inquiry updated')}`);
}

export async function addLeadNote(formData: FormData) {
  const user = await requirePermission('leads.write');
  const id = String(formData.get('id') ?? '');
  const body = String(formData.get('body') ?? '').trim();
  if (!id || !body) redirect(`/admin/leads/${id}?error=${encodeURIComponent('Note cannot be empty')}`);

  const db = requireDb();
  await db.insert(leadNotes).values({ leadId: id, authorUserId: user.id, body });
  await recordAudit({ actorUserId: user.id, action: 'lead.note', entityType: 'lead', entityId: id });
  revalidatePath(`/admin/leads/${id}`);
  redirect(`/admin/leads/${id}?ok=${encodeURIComponent('Note added')}`);
}

export async function deleteLead(formData: FormData) {
  const user = await requirePermission('leads.delete');
  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin/leads');

  const db = requireDb();
  await db.delete(leads).where(eq(leads.id, id));
  await recordAudit({ actorUserId: user.id, action: 'lead.delete', entityType: 'lead', entityId: id });
  revalidatePath('/admin/leads');
  redirect(`/admin/leads?ok=${encodeURIComponent('Inquiry deleted')}`);
}
