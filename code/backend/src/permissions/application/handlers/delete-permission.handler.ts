import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import {
  PERMISSION_REPOSITORY,
  type PermissionRepository,
} from '../../domain/permission.repository';
import type { PermissionSummary } from '../../domain/permission-summary';
import { DeletePermissionCommand } from '../commands/delete-permission.command';

@CommandHandler(DeletePermissionCommand)
export class DeletePermissionHandler
  implements ICommandHandler<DeletePermissionCommand, PermissionSummary>
{
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(command: DeletePermissionCommand): Promise<PermissionSummary> {
    const permission = await this.permissionRepository.findById(command.id);

    if (!permission) {
      throw new NotFoundException('Permission not found.');
    }

    const assignedRoles = await this.permissionRepository.countAssignedRoles(
      command.id,
    );

    if (assignedRoles > 0) {
      throw new ConflictException(
        `Permission is assigned to ${assignedRoles} role(s) and cannot be deleted.`,
      );
    }

    const deletedPermission = await this.permissionRepository.delete(command.id);

    if (!deletedPermission) {
      throw new NotFoundException('Permission not found.');
    }

    return deletedPermission;
  }
}
