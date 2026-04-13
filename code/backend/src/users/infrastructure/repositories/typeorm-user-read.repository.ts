import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Role } from '../../../roles/entities/role.entity';
import { User } from '../../entities/user.entity';
import type {
  PaginatedResult,
  UserRepository,
} from '../../domain/user.repository';
import type { UserSummary } from '../../domain/user-summary';

@Injectable()
export class TypeOrmUserReadRepository implements UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  private toSummary(user: User): UserSummary {
    const roles = [...user.roles].sort((a, b) => a.name.localeCompare(b.name));
    const permissions = Array.from(
      new Set(
        roles.flatMap((role) =>
          role.permissions.map((permission) => permission.code),
        ),
      ),
    ).sort();

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roleIds: roles.map((role) => role.id),
      roles: roles.map((role) => role.name),
      permissions,
    };
  }

  private findUserEntityById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: {
        roles: {
          permissions: true,
        },
      },
    });
  }

  private async findRolesByIds(ids: string[]): Promise<Role[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.roleRepository.find({
      where: {
        id: In(ids),
      },
    });
  }

  async create(input: {
    displayName: string;
    email: string;
    isActive: boolean;
    passwordHash: string;
    roleIds: string[];
  }): Promise<UserSummary> {
    const roles = await this.findRolesByIds(input.roleIds);
    const user = this.userRepository.create({
      email: input.email,
      displayName: input.displayName,
      passwordHash: input.passwordHash,
      isActive: input.isActive,
      roles,
    });

    const savedUser = await this.userRepository.save(user);
    const hydratedUser = await this.findUserEntityById(savedUser.id);

    if (!hydratedUser) {
      throw new Error('User could not be loaded after creation.');
    }

    return this.toSummary(hydratedUser);
  }

  async findById(id: string): Promise<UserSummary | null> {
    const user = await this.findUserEntityById(id);

    return user ? this.toSummary(user) : null;
  }

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

    return users.map((user) => this.toSummary(user));
  }

  async findPaginated(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<UserSummary>> {
    const [users, total] = await this.userRepository.findAndCount({
      relations: {
        roles: {
          permissions: true,
        },
      },
      order: {
        createdAt: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: users.map((user) => this.toSummary(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    input: {
      displayName?: string;
      email?: string;
      isActive?: boolean;
      passwordHash?: string;
      roleIds?: string[];
    },
  ): Promise<UserSummary | null> {
    const user = await this.findUserEntityById(id);

    if (!user) {
      return null;
    }

    if (input.email !== undefined) {
      user.email = input.email;
    }

    if (input.displayName !== undefined) {
      user.displayName = input.displayName;
    }

    if (input.passwordHash !== undefined) {
      user.passwordHash = input.passwordHash;
    }

    if (input.isActive !== undefined) {
      user.isActive = input.isActive;
    }

    if (input.roleIds !== undefined) {
      user.roles = await this.findRolesByIds(input.roleIds);
    }

    const savedUser = await this.userRepository.save(user);
    const hydratedUser = await this.findUserEntityById(savedUser.id);

    if (!hydratedUser) {
      throw new Error('User could not be loaded after update.');
    }

    return this.toSummary(hydratedUser);
  }

  async delete(id: string): Promise<UserSummary | null> {
    const user = await this.findUserEntityById(id);

    if (!user) {
      return null;
    }

    const summary = this.toSummary(user);
    await this.userRepository.remove(user);

    return summary;
  }

  async countRolesByIds(ids: string[]): Promise<number> {
    if (ids.length === 0) {
      return 0;
    }

    return this.roleRepository.count({
      where: {
        id: In(ids),
      },
    });
  }
}
