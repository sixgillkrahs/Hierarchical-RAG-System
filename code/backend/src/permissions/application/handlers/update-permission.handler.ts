import {
  BadRequestException,
  ConflictException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import {
  PERMISSION_REPOSITORY,
  type PermissionRepository,
} from '../../domain/permission.repository';
import type { PermissionSummary } from '../../domain/permission-summary';
import { UpdatePermissionCommand } from '../commands/update-permission.command';

@CommandHandler(UpdatePermissionCommand)
export class UpdatePermissionHandler
  implements ICommandHandler<UpdatePermissionCommand, PermissionSummary>
{
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(command: UpdatePermissionCommand): Promise<PermissionSummary> {
    const code =
      typeof command.code === 'string' ? command.code.trim() : undefined;
    const description =
      typeof command.description === 'string'
        ? command.description.trim()
        : undefined;

    if (command.code !== undefined && !code) {
      throw new BadRequestException('Permission code must not be empty.');
    }

    if (command.description !== undefined && !description) {
      throw new BadRequestException(
        'Permission description must not be empty.',
      );
    }

    if (code === undefined && description === undefined) {
      throw new BadRequestException(
        'At least one permission field must be provided.',
      );
    }

    try {
      const updatedPermission = await this.permissionRepository.update(
        command.id,
        {
          code,
          description,
        },
      );

      if (!updatedPermission) {
        throw new NotFoundException('Permission not found.');
      }

      return updatedPermission;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message.toLowerCase() : 'unknown error';

      if (message.includes('duplicate') || message.includes('unique')) {
        throw new ConflictException('Permission code already exists.');
      }

      throw error;
    }
  }
}
