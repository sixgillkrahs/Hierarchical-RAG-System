import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { In, Repository } from 'typeorm';

import {
  DEFAULT_PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_DEFINITIONS,
} from '../common/auth/constants/rbac.constants';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RbacSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RbacSeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedPermissions();
    await this.seedRoles();
    await this.seedAdminUser();
  }

  private async seedPermissions(): Promise<void> {
    const existingPermissions = await this.permissionRepository.find();
    const existingCodes = new Set(existingPermissions.map(({ code }) => code));

    const missingPermissions = DEFAULT_PERMISSION_DEFINITIONS.filter(
      ({ code }) => !existingCodes.has(code),
    ).map(({ code, description }) =>
      this.permissionRepository.create({ code, description }),
    );

    if (missingPermissions.length > 0) {
      await this.permissionRepository.save(missingPermissions);
      this.logger.log(`Seeded ${missingPermissions.length} permissions.`);
    }
  }

  private async seedRoles(): Promise<void> {
    const permissionCodes = DEFAULT_PERMISSION_DEFINITIONS.map(({ code }) => code);
    const permissions = await this.permissionRepository.find({
      where: {
        code: In([...permissionCodes]),
      },
    });
    const permissionMap = new Map(
      permissions.map((permission) => [permission.code, permission]),
    );

    for (const definition of DEFAULT_ROLE_DEFINITIONS) {
      const assignedPermissions = definition.permissions
        .map((permissionCode) => permissionMap.get(permissionCode))
        .filter((permission): permission is Permission => permission !== undefined);

      const existingRole = await this.roleRepository.findOne({
        where: { name: definition.name },
        relations: {
          permissions: true,
        },
      });

      if (!existingRole) {
        const role = this.roleRepository.create({
          name: definition.name,
          description: definition.description,
          permissions: assignedPermissions,
        });
        await this.roleRepository.save(role);
        continue;
      }

      existingRole.description = definition.description;
      existingRole.permissions = assignedPermissions;
      await this.roleRepository.save(existingRole);
    }
  }

  private async seedAdminUser(): Promise<void> {
    const adminEmail =
      this.configService.get<string>('ADMIN_EMAIL') ?? 'admin@company.com';
    const adminPassword =
      this.configService.get<string>('ADMIN_PASSWORD') ?? 'ChangeMe123!';
    const adminDisplayName =
      this.configService.get<string>('ADMIN_DISPLAY_NAME') ??
      'System Administrator';

    const adminRole = await this.roleRepository.findOne({
      where: { name: 'super_admin' },
      relations: {
        permissions: true,
      },
    });

    if (!adminRole) {
      this.logger.warn('super_admin role was not found during RBAC seed.');
      return;
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: adminEmail.toLowerCase() },
      relations: {
        roles: true,
      },
    });

    if (!existingUser) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const user = this.userRepository.create({
        email: adminEmail.toLowerCase(),
        displayName: adminDisplayName,
        passwordHash,
        roles: [adminRole],
      });

      await this.userRepository.save(user);
      this.logger.log(`Seeded default admin user ${adminEmail.toLowerCase()}.`);
      return;
    }

    const roleIds = new Set(existingUser.roles.map((role) => role.id));
    if (!roleIds.has(adminRole.id)) {
      existingUser.roles = [...existingUser.roles, adminRole];
      await this.userRepository.save(existingUser);
    }
  }
}

