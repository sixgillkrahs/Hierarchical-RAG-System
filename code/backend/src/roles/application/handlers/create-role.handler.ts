import { BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import type { StorageScopeSummary } from '../../../common/auth/storage-scope.types';
import {
  ROLE_REPOSITORY,
  type RoleRepository,
} from '../../domain/role-read.repository';
import type { RoleSummary } from '../../domain/role-summary';
import { CreateRoleCommand } from '../commands/create-role.command';

@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler
  implements ICommandHandler<CreateRoleCommand, RoleSummary>
{
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(command: CreateRoleCommand): Promise<RoleSummary> {
    const name = command.name.trim();
    const description = command.description.trim();
    const permissionIds = this.normalizePermissionIds(command.permissionIds);
    const storageScopes = this.normalizeStorageScopes(command.storageScopes);

    if (!name) {
      throw new BadRequestException('Role name must not be empty.');
    }

    if (!description) {
      throw new BadRequestException('Role description must not be empty.');
    }

    const matchedPermissions =
      await this.roleRepository.countPermissionsByIds(permissionIds);

    if (matchedPermissions !== permissionIds.length) {
      throw new BadRequestException('One or more permission IDs are invalid.');
    }

    try {
      return await this.roleRepository.create({
        name,
        description,
        permissionIds,
        storageScopes,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message.toLowerCase() : 'unknown error';

      if (message.includes('duplicate') || message.includes('unique')) {
        throw new ConflictException('Role name already exists.');
      }

      throw error;
    }
  }

  private normalizePermissionIds(permissionIds: string[]): string[] {
    return Array.from(
      new Set(
        permissionIds
          .map((permissionId) => permissionId.trim())
          .filter((permissionId) => permissionId.length > 0),
      ),
    );
  }

  private normalizeStorageScopes(
    storageScopes: StorageScopeSummary[],
  ): StorageScopeSummary[] {
    return Array.from(
      new Map(
        storageScopes.map((storageScope) => {
          const pathPrefix = this.normalizePathPrefix(storageScope.pathPrefix);
          const capability = storageScope.capability;

          if (capability !== 'read' && capability !== 'manage') {
            throw new BadRequestException(
              `Unsupported storage scope capability: ${capability}.`,
            );
          }

          const normalizedScope = {
            pathPrefix,
            capability,
            inheritChildren: storageScope.inheritChildren !== false,
          } satisfies StorageScopeSummary;

          return [
            `${normalizedScope.pathPrefix}:${normalizedScope.capability}`,
            normalizedScope,
          ];
        }),
      ).values(),
    );
  }

  private normalizePathPrefix(pathPrefix: string): string {
    const normalized = pathPrefix
      .replace(/\\/g, '/')
      .trim()
      .replace(/^\/+|\/+$/g, '');
    const segments = normalized
      .split('/')
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (segments.some((segment) => segment === '.' || segment === '..')) {
      throw new BadRequestException(
        "Storage scope path cannot contain '.' or '..' segments.",
      );
    }

    return segments.join('/');
  }
}
