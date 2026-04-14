import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { StorageScopeSummary } from '../../../common/auth/storage-scope.types';
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
          storageScopes: true,
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
          storageScopes: true,
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
      storageScopes: snapshot.storageScopes,
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
    const storageScopes = Array.from(
      new Map(
        user.roles
          .flatMap((role: Role) => role.storageScopes ?? [])
          .map((scope) => {
            const normalizedPathPrefix = scope.pathPrefix.trim();
            const key = `${normalizedPathPrefix}:${scope.capability}:${scope.inheritChildren}`;

            return [
              key,
              {
                id: scope.id,
                pathPrefix: normalizedPathPrefix,
                capability: scope.capability,
                inheritChildren: scope.inheritChildren,
              } satisfies StorageScopeSummary,
            ];
          }),
      ).values(),
    ).sort((left, right) => {
      if (left.pathPrefix === right.pathPrefix) {
        return left.capability.localeCompare(right.capability);
      }

      return left.pathPrefix.localeCompare(right.pathPrefix);
    });

    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      passwordHash: user.passwordHash,
      roles,
      permissions,
      routes,
      storageScopes,
    };
  }
}
