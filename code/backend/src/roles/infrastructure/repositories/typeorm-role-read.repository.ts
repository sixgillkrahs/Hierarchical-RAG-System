import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { RoleReadRepository } from '../../domain/role-read.repository';
import type { RoleSummary } from '../../domain/role-summary';
import { Role } from '../../entities/role.entity';

@Injectable()
export class TypeOrmRoleReadRepository implements RoleReadRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<RoleSummary[]> {
    const roles = await this.roleRepository.find({
      relations: {
        permissions: true,
      },
      order: {
        name: 'ASC',
      },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((permission) => permission.code).sort(),
    }));
  }
}

