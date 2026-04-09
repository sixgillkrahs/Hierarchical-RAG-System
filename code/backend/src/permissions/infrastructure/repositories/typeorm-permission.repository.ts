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

  async create(input: {
    code: string;
    description: string;
  }): Promise<PermissionSummary> {
    const permission = this.permissionRepository.create({
      code: input.code,
      description: input.description,
    });

    const savedPermission = await this.permissionRepository.save(permission);

    return {
      id: savedPermission.id,
      code: savedPermission.code,
      description: savedPermission.description,
    };
  }

  async findAll(): Promise<PermissionSummary[]> {
    const permissions = await this.permissionRepository.find({
      order: {
        code: 'ASC',
      },
    });

    return permissions.map((permission) => ({
      id: permission.id,
      code: permission.code,
      description: permission.description,
    }));
  }
}

