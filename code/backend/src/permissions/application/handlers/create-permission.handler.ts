import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import {
  PERMISSION_REPOSITORY,
  type PermissionRepository,
} from '../../domain/permission.repository';
import type { PermissionSummary } from '../../domain/permission-summary';
import { CreatePermissionCommand } from '../commands/create-permission.command';

@CommandHandler(CreatePermissionCommand)
export class CreatePermissionHandler
  implements ICommandHandler<CreatePermissionCommand, PermissionSummary>
{
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(command: CreatePermissionCommand): Promise<PermissionSummary> {
    try {
      return await this.permissionRepository.create({
        code: command.code.trim(),
        description: command.description.trim(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message.toLowerCase() : 'unknown error';

      if (message.includes('duplicate') || message.includes('unique')) {
        throw new ConflictException('Permission code already exists.');
      }

      throw error;
    }
  }
}

