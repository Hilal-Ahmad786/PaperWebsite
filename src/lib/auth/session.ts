import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt, inArray } from 'drizzle-orm';
import { isDbConfigured, requireDb } from '@/db';
import { sessions, users, userRoles, roles, rolePermissions, permissions as permsTable } from '@/db/schema';
import type { PermissionCode } from './rbac';
import { SESSION_COOKIE } from './constants';

export { SESSION_COOKIE };
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  locale: string;
  roleCodes: string[];
  permissions: Set<PermissionCode>;
}

/** Create a DB session + set the rotating httpOnly cookie. */
export async function createSession(
  userId: string,
  meta?: { ip?: string | null; userAgent?: string | null }
): Promise<void> {
  const db = requireDb();
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TTL_MS);
  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
    ip: meta?.ip ?? undefined,
    userAgent: meta?.userAgent ?? undefined,
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

/** Revoke the current session and clear the cookie. */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token && isDbConfigured) {
    await requireDb().delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  jar.delete(SESSION_COOKIE);
}

/** Resolve the current user (with permissions) from the session cookie, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isDbConfigured) return null;
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = requireDb();
  const [row] = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      locale: users.locale,
      isActive: users.isActive,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (!row || !row.isActive) return null;

  const roleRows = await db
    .select({ roleId: userRoles.roleId, code: roles.code })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, row.userId));
  const roleIds = roleRows.map((r) => r.roleId);
  const roleCodes = roleRows.map((r) => r.code);

  const permSet = new Set<PermissionCode>();
  if (roleIds.length) {
    const permRows = await db
      .select({ code: permsTable.code })
      .from(rolePermissions)
      .innerJoin(permsTable, eq(rolePermissions.permissionId, permsTable.id))
      .where(inArray(rolePermissions.roleId, roleIds));
    for (const p of permRows) permSet.add(p.code as PermissionCode);
  }

  return {
    id: row.userId,
    name: row.name,
    email: row.email,
    locale: row.locale,
    roleCodes,
    permissions: permSet,
  };
}
