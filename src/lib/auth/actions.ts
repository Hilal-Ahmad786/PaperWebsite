'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { isDbConfigured, requireDb } from '@/db';
import { users } from '@/db/schema';
import { verifyPassword } from './password';
import { createSession, destroySession } from './session';
import { recordAudit } from '@/lib/admin/audit';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
});

export interface LoginResult {
  error?: string;
}

export async function login(_prev: LoginResult | null, formData: FormData): Promise<LoginResult> {
  if (!isDbConfigured) {
    return { error: 'Database is not configured. Set DATABASE_URL and seed an admin user.' };
  }

  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const db = requireDb();
  const hdrs = await headers();
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const userAgent = hdrs.get('user-agent');

  const { email, password } = parsed.data;
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  const invalid: LoginResult = { error: 'Incorrect email or password.' };

  if (!user || !user.passwordHash || !user.isActive || user.deletedAt) {
    return invalid;
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { error: 'Too many failed attempts. Please try again later.' };
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    const attempts = user.failedLoginCount + 1;
    const lock = attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null;
    await db.update(users).set({ failedLoginCount: attempts, lockedUntil: lock }).where(eq(users.id, user.id));
    await recordAudit({ actorUserId: user.id, action: 'login.failed', entityType: 'user', entityId: user.id });
    return invalid;
  }

  await db
    .update(users)
    .set({ failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() })
    .where(eq(users.id, user.id));
  await createSession(user.id, { ip, userAgent });
  await recordAudit({ actorUserId: user.id, action: 'login', entityType: 'user', entityId: user.id });

  redirect('/admin');
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect('/admin/login');
}
