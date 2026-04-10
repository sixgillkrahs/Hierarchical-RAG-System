import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from '../../../roles/entities/role.entity';
import { User } from '../../../users/entities/user.entity';
import type {
  AuthProfile,
} from '../../domain/auth-profile';
import type {
  AuthUserRepository,
  AuthUserSnapshot,
} from '../../domain/auth-user.repository';

@Injectable()
export class TypeOrmAuthUserRepository implements AuthUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findProfileByEmail(email: string): Promise<AuthUserSnapshot | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: {
        roles: {
          permissions: true,
        },
      },
    });

    return user ? this.toSnapshot(user) : null;
  }

  async findProfileById(id: string): Promise<AuthProfile | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        roles: {
          permissions: true,
        },
      },
    });

    if (!user) {
      return null;
    }

    const snapshot = this.toSnapshot(user);
    return {
      id: snapshot.id,
      email: snapshot.email,
      roles: snapshot.roles,
      permissions: snapshot.permissions,
      routes: snapshot.routes,
    };
  }

  private toSnapshot(user: User): AuthUserSnapshot {
    const roles = user.roles.map((role) => role.name).sort();
    const permissions = Array.from(
      new Set(
        user.roles.flatMap((role: Role) =>
          role.permissions.map((permission) => permission.code),
        ),
      ),
    ).sort();
    const routes = Array.from(
      new Set(
        user.roles.flatMap((role: Role) =>
          role.permissions
            .map((permission) => permission.route.trim())
            .filter((route) => route.length > 0),
        ),
      ),
    ).sort();

    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      passwordHash: user.passwordHash,
      roles,
      permissions,
      routes,
    };
  }
}
