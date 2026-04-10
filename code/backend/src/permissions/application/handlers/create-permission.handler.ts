import { BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import {
  PERMISSION_REPOSITORY,
  type PermissionRepository,
} from '../../domain/permission.repository';
import { normalizePermissionRoute } from '../../domain/permission-route';
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
    const code = command.code.trim();
    const route = normalizePermissionRoute(command.route);
    const description = command.description.trim();

    if (!code) {
      throw new BadRequestException('Permission code must not be empty.');
    }

    if (!route) {
      throw new BadRequestException('Permission route must not be empty.');
    }

    if (!description) {
      throw new BadRequestException(
        'Permission description must not be empty.',
      );
    }

    try {
      return await this.permissionRepository.create({
        code,
        description,
        route,
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
