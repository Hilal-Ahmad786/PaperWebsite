'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireDb } from '@/db';
import { users, userRoles } from '@/db/schema';
import { requirePermission } from '@/lib/auth/guard';
import { recordAudit } from '@/lib/admin/audit';
import { hashPassword } from '@/lib/auth/password';
import { SITE_LOCALES } from '@/lib/admin/localized';

const LOCALES = SITE_LOCALES as unknown as [string, ...string[]];

const createSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8),
  roleId: z.string().uuid().optional().or(z.literal('')),
});

export async function createUser(formData: FormData) {
  const actor = await requirePermission('users.manage');
  const parsed = createSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    roleId: formData.get('roleId') ?? '',
  });
  if (!parsed.success) {
    redirect(`/admin/users/new?error=${encodeURIComponent('Please provide a name, valid email and a password of at least 8 characters.')}`);
  }
  const { name, email, password, roleId } = parsed.data;
  const db = requireDb();

  const normalizedEmail = email.toLowerCase();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail)).limit(1);
  if (existing) {
    redirect(`/admin/users/new?error=${encodeURIComponent('A user with that email already exists.')}`);
  }

  const passwordHash = await hashPassword(password);
  const [created] = await db
    .insert(users)
    .values({ name, email: normalizedEmail, passwordHash })
    .returning({ id: users.id });

  if (roleId) {
    await db.insert(userRoles).values({ userId: created.id, roleId });
  }

  await recordAudit({
    actorUserId: actor.id,
    action: 'user.create',
    entityType: 'user',
    entityId: created.id,
    summary: `Created user ${name} (${normalizedEmail})`,
  });
  revalidatePath('/admin/users');
  redirect(`/admin/users/${created.id}?ok=${encodeURIComponent('User created')}`);
}

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  locale: z.enum(LOCALES),
  password: z.string().optional(),
});

export async function updateUser(formData: FormData) {
  const actor = await requirePermission('users.manage');
  const parsed = updateSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    locale: formData.get('locale'),
    password: formData.get('password') ?? '',
  });
  if (!parsed.success) {
    const rawId = String(formData.get('id') ?? '');
    redirect(`/admin/users/${rawId}?error=${encodeURIComponent('Invalid input')}`);
  }
  const { id, name, locale, password } = parsed.data;
  const isActive = formData.get('isActive') != null;
  const roleIds = formData.getAll('roles').map((r) => String(r)).filter(Boolean);
  const db = requireDb();

  const newPassword = (password ?? '').trim();
  if (newPassword && newPassword.length < 8) {
    redirect(`/admin/users/${id}?error=${encodeURIComponent('Password must be at least 8 characters.')}`);
  }
  const passwordHash = newPassword ? await hashPassword(newPassword) : undefined;

  await db
    .update(users)
    .set({
      name,
      locale: locale as (typeof users.$inferInsert)['locale'],
      isActive,
      updatedAt: new Date(),
      ...(passwordHash ? { passwordHash } : {}),
    })
    .where(eq(users.id, id));

  // Sync role assignments: clear existing, insert the selected set.
  await db.delete(userRoles).where(eq(userRoles.userId, id));
  if (roleIds.length) {
    await db.insert(userRoles).values(roleIds.map((roleId) => ({ userId: id, roleId })));
  }

  await recordAudit({
    actorUserId: actor.id,
    action: 'user.update',
    entityType: 'user',
    entityId: id,
    summary: `Updated user ${name}${newPassword ? ' (password reset)' : ''}`,
  });
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${id}`);
  redirect(`/admin/users/${id}?ok=${encodeURIComponent('User updated')}`);
}

export async function deleteUser(formData: FormData) {
  const actor = await requirePermission('users.manage');
  const id = String(formData.get('id') ?? '');
  if (!id) redirect('/admin/users');
  if (id === actor.id) {
    redirect(`/admin/users/${id}?error=${encodeURIComponent('You cannot delete your own account.')}`);
  }

  const db = requireDb();
  await db
    .update(users)
    .set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() })
    .where(eq(users.id, id));

  await recordAudit({
    actorUserId: actor.id,
    action: 'user.delete',
    entityType: 'user',
    entityId: id,
    summary: 'Soft-deleted user',
  });
  revalidatePath('/admin/users');
  redirect(`/admin/users?ok=${encodeURIComponent('User deleted')}`);
}
