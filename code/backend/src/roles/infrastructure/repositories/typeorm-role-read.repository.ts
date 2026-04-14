import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import type { StorageScopeSummary } from '../../../common/auth/storage-scope.types';
import { Permission } from '../../../permissions/entities/permission.entity';
import type {
  PaginatedResult,
  RoleRepository,
} from '../../domain/role-read.repository';
import type { RoleSummary } from '../../domain/role-summary';
import { Role } from '../../entities/role.entity';
import { RoleStorageScope } from '../../entities/role-storage-scope.entity';

@Injectable()
export class TypeOrmRoleReadRepository implements RoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RoleStorageScope)
    private readonly roleStorageScopeRepository: Repository<RoleStorageScope>,
  ) {}

  private toSummary(role: Role): RoleSummary {
    const permissions = [...role.permissions].sort((a, b) =>
      a.code.localeCompare(b.code),
    );
    const storageScopes = [...(role.storageScopes ?? [])]
      .map((scope) => ({
        id: scope.id,
        pathPrefix: scope.pathPrefix,
        capability: scope.capability,
        inheritChildren: scope.inheritChildren,
      }))
      .sort((left, right) => {
        if (left.pathPrefix === right.pathPrefix) {
          return left.capability.localeCompare(right.capability);
        }

        return left.pathPrefix.localeCompare(right.pathPrefix);
      });

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissionIds: permissions.map((permission) => permission.id),
      permissions: permissions.map((permission) => permission.code),
      storageScopes,
    };
  }

  private findRoleEntityById(id: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id },
      relations: {
        permissions: true,
        storageScopes: true,
      },
    });
  }

  private async findPermissionsByIds(ids: string[]): Promise<Permission[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.permissionRepository.find({
      where: {
        id: In(ids),
      },
    });
  }

  async create(input: {
    description: string;
    name: string;
    permissionIds: string[];
    storageScopes: StorageScopeSummary[];
  }): Promise<RoleSummary> {
    const permissions = await this.findPermissionsByIds(input.permissionIds);
    const role = this.roleRepository.create({
      name: input.name,
      description: input.description,
      permissions,
    });

    const savedRole = await this.roleRepository.save(role);
    await this.replaceStorageScopes(savedRole, input.storageScopes);
    const hydratedRole = await this.findRoleEntityById(savedRole.id);

    if (!hydratedRole) {
      throw new Error('Role could not be loaded after creation.');
    }

    return this.toSummary(hydratedRole);
  }

  async findById(id: string): Promise<RoleSummary | null> {
    const role = await this.findRoleEntityById(id);

    return role ? this.toSummary(role) : null;
  }

  async findAll(): Promise<RoleSummary[]> {
    const roles = await this.roleRepository.find({
      relations: {
        permissions: true,
        storageScopes: true,
      },
      order: {
        name: 'ASC',
      },
    });

    return roles.map((role) => this.toSummary(role));
  }

  async findPaginated(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<RoleSummary>> {
    const [roles, total] = await this.roleRepository.findAndCount({
      relations: {
        permissions: true,
        storageScopes: true,
      },
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: roles.map((role) => this.toSummary(role)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    input: {
      description?: string;
      name?: string;
      permissionIds?: string[];
      storageScopes?: StorageScopeSummary[];
    },
  ): Promise<RoleSummary | null> {
    const role = await this.findRoleEntityById(id);

    if (!role) {
      return null;
    }

    if (input.name !== undefined) {
      role.name = input.name;
    }

    if (input.description !== undefined) {
      role.description = input.description;
    }

    if (input.permissionIds !== undefined) {
      role.permissions = await this.findPermissionsByIds(input.permissionIds);
    }

    const savedRole = await this.roleRepository.save(role);

    if (input.storageScopes !== undefined) {
      await this.replaceStorageScopes(savedRole, input.storageScopes);
    }

    const hydratedRole = await this.findRoleEntityById(savedRole.id);

    if (!hydratedRole) {
      throw new Error('Role could not be loaded after update.');
    }

    return this.toSummary(hydratedRole);
  }

  async delete(id: string): Promise<RoleSummary | null> {
    const role = await this.findRoleEntityById(id);

    if (!role) {
      return null;
    }

    const summary = this.toSummary(role);
    await this.roleRepository.remove(role);

    return summary;
  }

  async countAssignedUsers(id: string): Promise<number> {
    const result = await this.roleRepository
      .createQueryBuilder('role')
      .leftJoin('role.users', 'user')
      .select('COUNT(user.id)', 'count')
      .where('role.id = :id', { id })
      .getRawOne<{ count: string }>();

    return Number(result?.count ?? 0);
  }

  async countPermissionsByIds(ids: string[]): Promise<number> {
    if (ids.length === 0) {
      return 0;
    }

    return this.permissionRepository.count({
      where: {
        id: In(ids),
      },
    });
  }

  private async replaceStorageScopes(
    role: Role,
    storageScopes: StorageScopeSummary[],
  ): Promise<void> {
    await this.roleStorageScopeRepository.delete({ roleId: role.id });

    if (storageScopes.length === 0) {
      return;
    }

    const scopeEntities = storageScopes.map((scope) =>
      this.roleStorageScopeRepository.create({
        roleId: role.id,
        role,
        pathPrefix: scope.pathPrefix,
        capability: scope.capability,
        inheritChildren: scope.inheritChildren,
      }),
    );

    await this.roleStorageScopeRepository.save(scopeEntities);
  }
}
