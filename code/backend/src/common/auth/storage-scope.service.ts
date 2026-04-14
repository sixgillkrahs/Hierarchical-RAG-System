import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type {
  StorageScopeCapability,
  StorageScopeSummary,
} from './storage-scope.types';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class StorageScopeService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getEffectiveScopes(userId: string): Promise<StorageScopeSummary[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        roles: {
          storageScopes: true,
        },
      },
    });

    if (!user) {
      return [];
    }

    return Array.from(
      new Map(
        user.roles
          .flatMap((role) => role.storageScopes ?? [])
          .map((scope) => {
            const normalizedPath = this.normalizePath(scope.pathPrefix);
            const key = `${normalizedPath}:${scope.capability}:${scope.inheritChildren}`;

            return [
              key,
              {
                id: scope.id,
                pathPrefix: normalizedPath,
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
  }

  normalizePath(path: string | undefined | null): string {
    if (!path) {
      return '';
    }

    const normalized = path
      .replace(/\\/g, '/')
      .trim()
      .replace(/^\/+|\/+$/g, '');
    const segments = normalized
      .split('/')
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (segments.some((segment) => segment === '.' || segment === '..')) {
      throw new ForbiddenException(
        "Storage scope path cannot contain '.' or '..' segments.",
      );
    }

    return segments.join('/');
  }

  canReadPath(path: string, scopes: StorageScopeSummary[]): boolean {
    return this.hasCapability(path, scopes, 'read');
  }

  canManagePath(path: string, scopes: StorageScopeSummary[]): boolean {
    return this.hasCapability(path, scopes, 'manage');
  }

  canTraversePath(path: string, scopes: StorageScopeSummary[]): boolean {
    const normalizedPath = this.normalizePath(path);

    if (normalizedPath.length === 0) {
      return scopes.length > 0;
    }

    return scopes.some((scope) => {
      if (this.scopeCoversPath(normalizedPath, scope)) {
        return true;
      }

      return this.isAncestorPath(normalizedPath, scope.pathPrefix);
    });
  }

  isPathVisible(path: string, scopes: StorageScopeSummary[]): boolean {
    const normalizedPath = this.normalizePath(path);

    return scopes.some((scope) => {
      if (this.scopeCoversPath(normalizedPath, scope)) {
        return true;
      }

      return this.isAncestorPath(normalizedPath, scope.pathPrefix);
    });
  }

  assertCanReadPath(path: string, scopes: StorageScopeSummary[]): void {
    if (!this.canReadPath(path, scopes)) {
      throw new ForbiddenException('Storage path is outside your readable scope.');
    }
  }

  assertCanManagePath(path: string, scopes: StorageScopeSummary[]): void {
    if (!this.canManagePath(path, scopes)) {
      throw new ForbiddenException('Storage path is outside your manageable scope.');
    }
  }

  assertCanTraversePath(path: string, scopes: StorageScopeSummary[]): void {
    if (!this.canTraversePath(path, scopes)) {
      throw new ForbiddenException('Storage path is outside your accessible subtree.');
    }
  }

  private hasCapability(
    path: string,
    scopes: StorageScopeSummary[],
    capability: StorageScopeCapability,
  ): boolean {
    const normalizedPath = this.normalizePath(path);

    return scopes.some((scope) => {
      if (scope.capability !== capability && scope.capability !== 'manage') {
        return false;
      }

      return this.scopeCoversPath(normalizedPath, scope);
    });
  }

  private scopeCoversPath(
    normalizedPath: string,
    scope: StorageScopeSummary,
  ): boolean {
    if (scope.pathPrefix.length === 0) {
      return true;
    }

    if (normalizedPath === scope.pathPrefix) {
      return true;
    }

    if (!scope.inheritChildren) {
      return false;
    }

    return normalizedPath.startsWith(`${scope.pathPrefix}/`);
  }

  private isAncestorPath(
    ancestorPath: string,
    descendantPath: string,
  ): boolean {
    if (ancestorPath.length === 0) {
      return descendantPath.length > 0;
    }

    return descendantPath.startsWith(`${ancestorPath}/`);
  }
}
