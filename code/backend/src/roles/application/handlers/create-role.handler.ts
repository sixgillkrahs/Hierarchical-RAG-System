import { BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

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
}
