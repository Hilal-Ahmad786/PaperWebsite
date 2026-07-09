/**
 * Seed roles, permissions and the initial super-admin user.
 * Run with: DATABASE_URL=... npm run db:seed
 * Admin credentials come from ADMIN_EMAIL / ADMIN_PASSWORD (env), with defaults.
 */
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { requireDb, isDbConfigured } from './index';
import { roles, permissions, rolePermissions, users, userRoles } from './schema';
import { PERMISSIONS, ROLES, permissionsForRole } from '../lib/auth/rbac';
import { hashPassword } from '../lib/auth/password';

async function main() {
  if (!isDbConfigured) {
    console.error('DATABASE_URL is not set. Aborting seed.');
    process.exit(1);
  }
  const db = requireDb();

  console.log('Seeding permissions...');
  for (const [code, description] of Object.entries(PERMISSIONS)) {
    await db
      .insert(permissions)
      .values({ code, description })
      .onConflictDoUpdate({ target: permissions.code, set: { description } });
  }

  console.log('Seeding roles + role permissions...');
  const permRows = await db.select().from(permissions);
  const permIdByCode = new Map(permRows.map((p) => [p.code, p.id]));

  for (const roleDef of ROLES) {
    const [role] = await db
      .insert(roles)
      .values({ code: roleDef.code, name: roleDef.name, description: roleDef.description })
      .onConflictDoUpdate({
        target: roles.code,
        set: { name: roleDef.name, description: roleDef.description },
      })
      .returning();

    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, role.id));
    const codes = permissionsForRole(roleDef);
    for (const code of codes) {
      const permissionId = permIdByCode.get(code);
      if (permissionId) {
        await db
          .insert(rolePermissions)
          .values({ roleId: role.id, permissionId })
          .onConflictDoNothing();
      }
    }
  }

  const email = process.env.ADMIN_EMAIL ?? 'admin@papermarketworld.com';
  const password = process.env.ADMIN_PASSWORD ?? 'ChangeMe!123';
  const name = process.env.ADMIN_NAME ?? 'Site Administrator';

  console.log(`Ensuring super-admin user (${email})...`);
  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({ email, name, passwordHash, isActive: true, locale: 'en' })
    .onConflictDoUpdate({ target: users.email, set: { name } })
    .returning();

  const [superRole] = await db.select().from(roles).where(eq(roles.code, 'super_admin')).limit(1);
  if (superRole) {
    await db
      .insert(userRoles)
      .values({ userId: user.id, roleId: superRole.id })
      .onConflictDoNothing();
  }

  console.log('\nSeed complete.');
  console.log('----------------------------------------');
  console.log(`  Login:    ${email}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`  Password: ${password}  (default — change it after first login)`);
  }
  console.log('----------------------------------------');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
