import { BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcryptjs';

import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/user.repository';
import type { UserSummary } from '../../domain/user-summary';
import { CreateUserCommand } from '../commands/create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler
  implements ICommandHandler<CreateUserCommand, UserSummary>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserSummary> {
    const email = command.email.trim().toLowerCase();
    const displayName = command.displayName.trim();
    const roleIds = this.normalizeRoleIds(command.roleIds);

    if (!email) {
      throw new BadRequestException('User email must not be empty.');
    }

    if (!displayName) {
      throw new BadRequestException('User display name must not be empty.');
    }

    if (!command.password.trim()) {
      throw new BadRequestException('User password must not be empty.');
    }

    const matchedRoles = await this.userRepository.countRolesByIds(roleIds);

    if (matchedRoles !== roleIds.length) {
      throw new BadRequestException('One or more role IDs are invalid.');
    }

    const passwordHash = await bcrypt.hash(command.password, 10);

    try {
      return await this.userRepository.create({
        email,
        displayName,
        passwordHash,
        roleIds,
        isActive: command.isActive,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message.toLowerCase() : 'unknown error';

      if (message.includes('duplicate') || message.includes('unique')) {
        throw new ConflictException('User email already exists.');
      }

      throw error;
    }
  }

  private normalizeRoleIds(roleIds: string[]): string[] {
    return Array.from(
      new Set(
        roleIds
          .map((roleId) => roleId.trim())
          .filter((roleId) => roleId.length > 0),
      ),
    );
  }
}
