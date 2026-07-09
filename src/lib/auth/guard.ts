import { redirect } from 'next/navigation';
import { getSessionUser, type SessionUser } from './session';
import type { PermissionCode } from './rbac';

/** Server-side: require a logged-in user or redirect to login. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  return user;
}

export function can(user: SessionUser, permission: PermissionCode): boolean {
  return user.permissions.has(permission);
}

/** Require a specific permission; redirect to dashboard with a denied flag otherwise. */
export async function requirePermission(permission: PermissionCode): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user, permission)) redirect('/admin?denied=1');
  return user;
}
