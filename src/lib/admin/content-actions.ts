'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq, ne } from 'drizzle-orm';
import { z } from 'zod';
import { requireDb } from '@/db';
import { contentEntries } from '@/db/schema';
import { requirePermission } from '@/lib/auth/guard';
import { recordAudit } from '@/lib/admin/audit';
import { parseLocalized } from '@/lib/admin/localized';

const TYPES = ['insight', 'page', 'faq'] as const;
const STATUSES = ['draft', 'scheduled', 'published', 'archived'] as const;

const baseSchema = z.object({
  type: z.enum(TYPES),
  slug: z.string().trim().min(1),
  status: z.enum(STATUSES),
});

function parseTags(formData: FormData): string[] {
  return String(formData.get('tags') ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function readFields(formData: FormData) {
  return {
    title: parseLocalized(formData, 'title'),
    excerpt: parseLocalized(formData, 'excerpt'),
    body: parseLocalized(formData, 'body'),
    coverImage: String(formData.get('coverImage') ?? '').trim() || null,
    tags: parseTags(formData),
    seoTitle: parseLocalized(formData, 'seoTitle'),
    seoDescription: parseLocalized(formData, 'seoDescription'),
  };
}

export async function createContent(formData: FormData) {
  const user = await requirePermission('content.write');
  const parsed = baseSchema.safeParse({
    type: formData.get('type'),
    slug: String(formData.get('slug') ?? '').trim(),
    status: formData.get('status'),
  });
  if (!parsed.success) {
    redirect(`/admin/content/new?error=${encodeURIComponent('Invalid input')}`);
  }
  const { type, slug, status } = parsed.data;
  const fields = readFields(formData);
  if (!fields.title.en) {
    redirect(`/admin/content/new?error=${encodeURIComponent('An English title is required')}`);
  }

  const db = requireDb();
  const [dupe] = await db
    .select({ id: contentEntries.id })
    .from(contentEntries)
    .where(and(eq(contentEntries.type, type), eq(contentEntries.slug, slug)))
    .limit(1);
  if (dupe) {
    redirect(`/admin/content/new?error=${encodeURIComponent('A ' + type + ' with this slug already exists')}`);
  }

  const [row] = await db
    .insert(contentEntries)
    .values({
      type,
      slug,
      status,
      ...fields,
      authorUserId: user.id,
      publishedAt: status === 'published' ? new Date() : null,
    })
    .returning({ id: contentEntries.id });

  await recordAudit({
    actorUserId: user.id,
    action: 'content.create',
    entityType: 'content',
    entityId: row.id,
    summary: `Created ${type} "${slug}"`,
  });
  revalidatePath('/admin/content');
  redirect(`/admin/content/${row.id}?ok=${encodeURIComponent('Content created')}`);
}

export async function updateContent(formData: FormData) {
  const user = await requirePermission('content.write');
  const id = String(formData.get('id') ?? '');
  const parsed = baseSchema.safeParse({
    type: formData.get('type'),
    slug: String(formData.get('slug') ?? '').trim(),
    status: formData.get('status'),
  });
  if (!id || !parsed.success) {
    redirect(`/admin/content/${id}?error=${encodeURIComponent('Invalid input')}`);
  }
  const { type, slug, status } = parsed.data;
  const fields = readFields(formData);
  if (!fields.title.en) {
    redirect(`/admin/content/${id}?error=${encodeURIComponent('An English title is required')}`);
  }

  const db = requireDb();
  const [existing] = await db
    .select()
    .from(contentEntries)
    .where(eq(contentEntries.id, id))
    .limit(1);
  if (!existing) {
    redirect(`/admin/content?error=${encodeURIComponent('Content not found')}`);
  }

  const [dupe] = await db
    .select({ id: contentEntries.id })
    .from(contentEntries)
    .where(and(eq(contentEntries.type, type), eq(contentEntries.slug, slug), ne(contentEntries.id, id)))
    .limit(1);
  if (dupe) {
    redirect(`/admin/content/${id}?error=${encodeURIComponent('A ' + type + ' with this slug already exists')}`);
  }

  await db
    .update(contentEntries)
    .set({
      type,
      slug,
      status,
      ...fields,
      publishedAt: status === 'published' && !existing.publishedAt ? new Date() : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(contentEntries.id, id));

  await recordAudit({
    actorUserId: user.id,
    action: 'content.update',
    entityType: 'content',
    entityId: id,
    summary: `Updated ${type} "${slug}"`,
  });
  revalidatePath('/admin/content');
  revalidatePath(`/admin/content/${id}`);
  redirect(`/admin/content/${id}?ok=${encodeURIComponent('Content updated')}`);
}

export async function deleteContent(formData: FormData) {
  const user = await requirePermission('content.write');
  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin/content');

  const db = requireDb();
  await db.delete(contentEntries).where(eq(contentEntries.id, id));
  await recordAudit({
    actorUserId: user.id,
    action: 'content.delete',
    entityType: 'content',
    entityId: id,
  });
  revalidatePath('/admin/content');
  redirect(`/admin/content?ok=${encodeURIComponent('Content deleted')}`);
}

export async function publishContent(formData: FormData) {
  const user = await requirePermission('content.publish');
  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin/content');

  const db = requireDb();
  await db
    .update(contentEntries)
    .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(contentEntries.id, id));
  await recordAudit({
    actorUserId: user.id,
    action: 'content.publish',
    entityType: 'content',
    entityId: id,
  });
  revalidatePath('/admin/content');
  revalidatePath(`/admin/content/${id}`);
  redirect(`/admin/content/${id}?ok=${encodeURIComponent('Content published')}`);
}

export async function unpublishContent(formData: FormData) {
  const user = await requirePermission('content.publish');
  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin/content');

  const db = requireDb();
  await db
    .update(contentEntries)
    .set({ status: 'draft', updatedAt: new Date() })
    .where(eq(contentEntries.id, id));
  await recordAudit({
    actorUserId: user.id,
    action: 'content.unpublish',
    entityType: 'content',
    entityId: id,
  });
  revalidatePath('/admin/content');
  revalidatePath(`/admin/content/${id}`);
  redirect(`/admin/content/${id}?ok=${encodeURIComponent('Content unpublished')}`);
}
