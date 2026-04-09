import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';
import type { UserReadRepository } from '../../domain/user-read.repository';
import type { UserSummary } from '../../domain/user-summary';

@Injectable()
export class TypeOrmUserReadRepository implements UserReadRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<UserSummary[]> {
    const users = await this.userRepository.find({
      relations: {
        roles: {
          permissions: true,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      roles: user.roles.map((role) => role.name).sort(),
      permissions: Array.from(
        new Set(
          user.roles.flatMap((role) =>
            role.permissions.map((permission) => permission.code),
          ),
        ),
      ).sort(),
    }));
  }
}

