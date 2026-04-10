import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import {
  ROLE_REPOSITORY,
  type RoleRepository,
} from '../../domain/role-read.repository';
import type { RoleSummary } from '../../domain/role-summary';
import { DeleteRoleCommand } from '../commands/delete-role.command';

@CommandHandler(DeleteRoleCommand)
export class DeleteRoleHandler
  implements ICommandHandler<DeleteRoleCommand, RoleSummary>
{
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(command: DeleteRoleCommand): Promise<RoleSummary> {
    const role = await this.roleRepository.findById(command.id);

    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    const assignedUsers = await this.roleRepository.countAssignedUsers(command.id);

    if (assignedUsers > 0) {
      throw new ConflictException(
        `Role is assigned to ${assignedUsers} user(s) and cannot be deleted.`,
      );
    }

    const deletedRole = await this.roleRepository.delete(command.id);

    if (!deletedRole) {
      throw new NotFoundException('Role not found.');
    }

    return deletedRole;
  }
}
