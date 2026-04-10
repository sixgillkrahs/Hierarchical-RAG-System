import * as bcrypt from 'bcryptjs';

import dataSource from './typeorm.config';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { Permission } from '../permissions/entities/permission.entity';

async function seedAdmin() {
  try {
    await dataSource.initialize();
    console.log('Database connected successfully.');

    const roleRepo = dataSource.getRepository(Role);
    const userRepo = dataSource.getRepository(User);
    const permRepo = dataSource.getRepository(Permission);

    const email = process.argv[2] || 'admin@admin.com';
    const password = process.argv[3] || 'admin123';
    const displayName = 'System Administrator';

    // 1. Seed Permissions — covers ALL @RequirePermissions codes in the codebase
    const sysRoutes = [
      // ── Dashboard / root ──────────────────────────────────────────────────
      { code: 'dashboard.view',        route: '/',            desc: 'Xem Dashboard' },

      // ── Users ─────────────────────────────────────────────────────────────
      { code: 'users.read',            route: '/users',       desc: 'Xem danh sách người dùng' },
      { code: 'users.manage',          route: '/users',       desc: 'Quản lý người dùng' },

      // ── Roles ─────────────────────────────────────────────────────────────
      { code: 'roles.read',            route: '/roles',       desc: 'Xem danh sách vai trò' },
      { code: 'roles.manage',          route: '/roles',       desc: 'Quản lý vai trò' },

      // ── Permissions ───────────────────────────────────────────────────────
      { code: 'permissions.read',      route: '/permissions', desc: 'Xem danh sách quyền' },
      { code: 'permissions.manage',    route: '/permissions', desc: 'Quản lý quyền' },

      // ── RAG ───────────────────────────────────────────────────────────────
      { code: 'rag.read',              route: '/rag',         desc: 'Xem dữ liệu RAG' },
      { code: 'rag.query',             route: '/rag',         desc: 'Truy vấn RAG' },

      // ── Storage / Folders ─────────────────────────────────────────────────
      { code: 'storage.read',          route: '/storage',     desc: 'Xem tệp / thư mục' },
      { code: 'storage.manage',        route: '/storage',     desc: 'Quản lý tệp / thư mục' },

      // ── Legacy codes (kept for backwards-compat with existing seed data) ──
      { code: 'DASHBOARD_VIEW',        route: '/',            desc: 'Dashboard (legacy)' },
      { code: 'USERS_MANAGE',          route: '/users',       desc: 'Users (legacy)' },
      { code: 'ROLES_MANAGE',          route: '/roles',       desc: 'Roles (legacy)' },
      { code: 'PERMISSIONS_MANAGE',    route: '/permissions', desc: 'Permissions (legacy)' },
      { code: 'SETTINGS_VIEW',         route: '/about',       desc: 'Settings (legacy)' },
    ];

    const savedPerms = [];
    for (const r of sysRoutes) {
      let perm = await permRepo.findOne({ where: { code: r.code } });
      if (!perm) {
        perm = permRepo.create({
          code: r.code,
          route: r.route,
          description: r.desc,
        });
        await permRepo.save(perm);
      }
      savedPerms.push(perm);
    }
    console.log(`Seeded ${savedPerms.length} permissions.`);

    // 2. Seed Role and link permissions
    let role = await roleRepo.findOne({
      where: { name: 'Admin' },
      relations: ['permissions']
    });
    
    if (!role) {
      role = roleRepo.create({
        name: 'Admin',
        description: 'Administrator with full access',
      });
    }
    role.permissions = savedPerms;
    await roleRepo.save(role);
    console.log('Updated Admin role with full permissions.');

    // 3. Seed User
    let user = await userRepo.findOne({ where: { email } });
    if (!user) {
      user = userRepo.create({ email, displayName });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.roles = [role];
    user.isActive = true;

    await userRepo.save(user);

    console.log(`\n✅ Admin account updated with FULL PERMISSIONS!`);
  } catch (error) {
    console.error('Error seeding admin account:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

seedAdmin();
