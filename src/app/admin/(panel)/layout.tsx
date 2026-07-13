import { requireUser, can } from '@/lib/auth/guard';
import { AdminShell, type NavItem } from '@/components/admin/admin-shell';
import { ROLES, type PermissionCode } from '@/lib/auth/rbac';
import { getAdminT } from '@/lib/admin/i18n';

const NAV: { key: string; href: string; perm: PermissionCode }[] = [
  { key: 'dashboard', href: '/admin', perm: 'dashboard.view' },
  { key: 'leads', href: '/admin/leads', perm: 'leads.read' },
  { key: 'content', href: '/admin/content', perm: 'content.read' },
  { key: 'products', href: '/admin/products', perm: 'products.read' },
  { key: 'media', href: '/admin/media', perm: 'media.read' },
  { key: 'translations', href: '/admin/translations', perm: 'translations.read' },
  { key: 'seo', href: '/admin/seo', perm: 'seo.read' },
  { key: 'analytics', href: '/admin/analytics', perm: 'analytics.view' },
  { key: 'clicks', href: '/admin/clicks', perm: 'clicks.view' },
  { key: 'clickprotection', href: '/admin/click-protection', perm: 'clickprotection.read' },
  { key: 'users', href: '/admin/users', perm: 'users.manage' },
  { key: 'roles', href: '/admin/roles', perm: 'users.manage' },
  { key: 'settings', href: '/admin/settings', perm: 'settings.manage' },
  { key: 'audit', href: '/admin/audit', perm: 'audit.read' },
];

// Authenticated pages must always evaluate the session at request time.
export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const { locale, t } = await getAdminT();

  const nav: NavItem[] = NAV.filter((n) => can(user, n.perm)).map((n) => ({
    key: n.key,
    label: t(`nav.${n.key}`),
    href: n.href,
  }));

  const roleLabel =
    ROLES.find((r) => user.roleCodes.includes(r.code))?.name ?? user.roleCodes[0] ?? 'User';

  return (
    <AdminShell
      nav={nav}
      userName={user.name}
      userEmail={user.email}
      roleLabel={roleLabel}
      locale={locale}
      adminLabel={t('nav.admin')}
      logoutLabel={t('common.logout')}
    >
      {children}
    </AdminShell>
  );
}
