/**
 * Role & permission definitions. Stable machine codes; UI labels in English.
 * Server-side checks use these codes — never rely on hidden UI alone.
 */
export const PERMISSIONS = {
  'dashboard.view': 'View the dashboard',
  'leads.read': 'View sales inquiries',
  'leads.write': 'Edit / update inquiries',
  'leads.delete': 'Delete inquiries',
  'leads.export': 'Export inquiries',
  'content.read': 'View content',
  'content.write': 'Create / edit content',
  'content.publish': 'Publish content',
  'products.read': 'View products',
  'products.write': 'Edit products',
  'offers.read': 'View stock offers',
  'offers.write': 'Edit stock offers',
  'market.read': 'View market indices',
  'market.write': 'Edit market indices',
  'media.read': 'View media library',
  'media.write': 'Upload / delete media',
  'translations.read': 'View translations',
  'translations.write': 'Edit translations',
  'seo.read': 'View SEO settings',
  'seo.write': 'Edit SEO settings',
  'analytics.view': 'View analytics',
  'users.manage': 'Manage users & roles',
  'settings.manage': 'Manage site settings',
  'audit.read': 'View audit log',
} as const;

export type PermissionCode = keyof typeof PERMISSIONS;

export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as PermissionCode[];

export interface RoleDef {
  code: string;
  name: string;
  description: string;
  permissions: PermissionCode[] | '*';
}

export const ROLES: RoleDef[] = [
  {
    code: 'super_admin',
    name: 'Super Admin',
    description: 'Full access to every module and setting.',
    permissions: '*',
  },
  {
    code: 'editor',
    name: 'Content Editor',
    description: 'Manage content, products, offers, market data and media.',
    permissions: [
      'dashboard.view',
      'content.read',
      'content.write',
      'content.publish',
      'products.read',
      'products.write',
      'offers.read',
      'offers.write',
      'market.read',
      'market.write',
      'media.read',
      'media.write',
      'translations.read',
      'translations.write',
      'seo.read',
      'seo.write',
      'analytics.view',
    ],
  },
  {
    code: 'sales',
    name: 'Sales',
    description: 'Handle inbound inquiries and view the dashboard.',
    permissions: [
      'dashboard.view',
      'leads.read',
      'leads.write',
      'leads.export',
      'analytics.view',
    ],
  },
  {
    code: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to the dashboard, inquiries and analytics.',
    permissions: ['dashboard.view', 'leads.read', 'content.read', 'analytics.view'],
  },
];

export function permissionsForRole(role: RoleDef): PermissionCode[] {
  return role.permissions === '*' ? ALL_PERMISSIONS : role.permissions;
}
