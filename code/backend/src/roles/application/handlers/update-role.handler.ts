import {
  BadRequestException,
  ConflictException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import {
  ROLE_REPOSITORY,
  type RoleRepository,
} from '../../domain/role-read.repository';
import type { RoleSummary } from '../../domain/role-summary';
import { UpdateRoleCommand } from '../commands/update-role.command';

@CommandHandler(UpdateRoleCommand)
export class UpdateRoleHandler
  implements ICommandHandler<UpdateRoleCommand, RoleSummary>
{
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(command: UpdateRoleCommand): Promise<RoleSummary> {
    const name =
      typeof command.name === 'string' ? command.name.trim() : undefined;
    const description =
      typeof command.description === 'string'
        ? command.description.trim()
        : undefined;
    const permissionIds =
      command.permissionIds !== undefined
        ? this.normalizePermissionIds(command.permissionIds)
        : undefined;

    if (command.name !== undefined && !name) {
      throw new BadRequestException('Role name must not be empty.');
    }

    if (command.description !== undefined && !description) {
      throw new BadRequestException('Role description must not be empty.');
    }

    if (
      name === undefined &&
      description === undefined &&
      permissionIds === undefined
    ) {
      throw new BadRequestException('At least one role field must be provided.');
    }

    if (permissionIds !== undefined) {
      const matchedPermissions =
        await this.roleRepository.countPermissionsByIds(permissionIds);

      if (matchedPermissions !== permissionIds.length) {
        throw new BadRequestException('One or more permission IDs are invalid.');
      }
    }

    try {
      const updatedRole = await this.roleRepository.update(command.id, {
        name,
        description,
        permissionIds,
      });

      if (!updatedRole) {
        throw new NotFoundException('Role not found.');
      }

      return updatedRole;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

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
