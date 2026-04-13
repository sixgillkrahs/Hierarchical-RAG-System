import {
  BadRequestException,
  ConflictException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcryptjs';

import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/user.repository';
import type { UserSummary } from '../../domain/user-summary';
import { UpdateUserCommand } from '../commands/update-user.command';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler
  implements ICommandHandler<UpdateUserCommand, UserSummary>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateUserCommand): Promise<UserSummary> {
    const email =
      typeof command.email === 'string'
        ? command.email.trim().toLowerCase()
        : undefined;
    const displayName =
      typeof command.displayName === 'string'
        ? command.displayName.trim()
        : undefined;
    const roleIds =
      command.roleIds !== undefined
        ? this.normalizeRoleIds(command.roleIds)
        : undefined;

    if (command.email !== undefined && !email) {
      throw new BadRequestException('User email must not be empty.');
    }

    if (command.displayName !== undefined && !displayName) {
      throw new BadRequestException('User display name must not be empty.');
    }

    if (command.password !== undefined && !command.password.trim()) {
      throw new BadRequestException('User password must not be empty.');
    }

    if (
      email === undefined &&
      displayName === undefined &&
      command.password === undefined &&
      roleIds === undefined &&
      command.isActive === undefined
    ) {
      throw new BadRequestException('At least one user field must be provided.');
    }

    if (roleIds !== undefined) {
      const matchedRoles = await this.userRepository.countRolesByIds(roleIds);

      if (matchedRoles !== roleIds.length) {
        throw new BadRequestException('One or more role IDs are invalid.');
      }
    }

    const passwordHash =
      command.password !== undefined
        ? await bcrypt.hash(command.password, 10)
        : undefined;

    try {
      const updatedUser = await this.userRepository.update(command.id, {
        email,
        displayName,
        passwordHash,
        roleIds,
        isActive: command.isActive,
      });

      if (!updatedUser) {
        throw new NotFoundException('User not found.');
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

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
