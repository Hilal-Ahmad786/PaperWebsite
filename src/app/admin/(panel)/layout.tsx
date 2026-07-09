import { requireUser, can } from '@/lib/auth/guard';
import { AdminShell, type NavItem } from '@/components/admin/admin-shell';
import { ROLES, type PermissionCode } from '@/lib/auth/rbac';

const NAV: { key: string; label: string; href: string; perm: PermissionCode }[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin', perm: 'dashboard.view' },
  { key: 'leads', label: 'Inquiries', href: '/admin/leads', perm: 'leads.read' },
  { key: 'content', label: 'Insights', href: '/admin/content', perm: 'content.read' },
  { key: 'products', label: 'Products', href: '/admin/products', perm: 'products.read' },
  { key: 'offers', label: 'Stock Offers', href: '/admin/offers', perm: 'offers.read' },
  { key: 'market', label: 'Market Indices', href: '/admin/market', perm: 'market.read' },
  { key: 'media', label: 'Media', href: '/admin/media', perm: 'media.read' },
  { key: 'translations', label: 'Translations', href: '/admin/translations', perm: 'translations.read' },
  { key: 'seo', label: 'SEO', href: '/admin/seo', perm: 'seo.read' },
  { key: 'analytics', label: 'Analytics', href: '/admin/analytics', perm: 'analytics.view' },
  { key: 'clicks', label: 'Button Clicks', href: '/admin/clicks', perm: 'clicks.view' },
  { key: 'clickprotection', label: 'Click Protection', href: '/admin/click-protection', perm: 'clickprotection.read' },
  { key: 'users', label: 'Users', href: '/admin/users', perm: 'users.manage' },
  { key: 'roles', label: 'Roles', href: '/admin/roles', perm: 'users.manage' },
  { key: 'settings', label: 'Settings', href: '/admin/settings', perm: 'settings.manage' },
  { key: 'audit', label: 'Audit Log', href: '/admin/audit', perm: 'audit.read' },
];

// Authenticated pages must always evaluate the session at request time.
export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const nav: NavItem[] = NAV.filter((n) => can(user, n.perm)).map((n) => ({
    key: n.key,
    label: n.label,
    href: n.href,
  }));

  const roleLabel =
    ROLES.find((r) => user.roleCodes.includes(r.code))?.name ?? user.roleCodes[0] ?? 'User';

  return (
    <AdminShell nav={nav} userName={user.name} userEmail={user.email} roleLabel={roleLabel}>
      {children}
    </AdminShell>
  );
}
