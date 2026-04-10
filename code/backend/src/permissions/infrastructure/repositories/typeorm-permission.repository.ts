import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { PermissionRepository } from '../../domain/permission.repository';
import type { PermissionSummary } from '../../domain/permission-summary';
import { Permission } from '../../entities/permission.entity';

@Injectable()
export class TypeOrmPermissionRepository implements PermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  private toSummary(permission: Permission): PermissionSummary {
    return {
      id: permission.id,
      code: permission.code,
      description: permission.description,
      route: permission.route,
    };
  }

  async create(input: {
    code: string;
    description: string;
    route: string;
  }): Promise<PermissionSummary> {
    const permission = this.permissionRepository.create({
      code: input.code,
      description: input.description,
      route: input.route,
    });

    const savedPermission = await this.permissionRepository.save(permission);

    return this.toSummary(savedPermission);
  }

  async findById(id: string): Promise<PermissionSummary | null> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    return permission ? this.toSummary(permission) : null;
  }

  async findAll(): Promise<PermissionSummary[]> {
    const permissions = await this.permissionRepository.find({
      order: {
        code: 'ASC',
      },
    });

    return permissions.map((permission) => this.toSummary(permission));
  }

  async update(
    id: string,
    input: {
      code?: string;
      description?: string;
      route?: string;
    },
  ): Promise<PermissionSummary | null> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      return null;
    }

    if (input.code !== undefined) {
      permission.code = input.code;
    }

    if (input.description !== undefined) {
      permission.description = input.description;
    }

    if (input.route !== undefined) {
      permission.route = input.route;
    }

    const savedPermission = await this.permissionRepository.save(permission);

    return this.toSummary(savedPermission);
  }

  async delete(id: string): Promise<PermissionSummary | null> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      return null;
    }

    const summary = this.toSummary(permission);
    await this.permissionRepository.remove(permission);

    return summary;
  }

  async countAssignedRoles(id: string): Promise<number> {
    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoin('permission.roles', 'role')
      .select('COUNT(role.id)', 'count')
      .where('permission.id = :id', { id })
      .getRawOne<{ count: string }>();

    return Number(result?.count ?? 0);
  }
}
