import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/user.repository';
import type { UserSummary } from '../../domain/user-summary';
import { DeleteUserCommand } from '../commands/delete-user.command';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler
  implements ICommandHandler<DeleteUserCommand, UserSummary>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: DeleteUserCommand): Promise<UserSummary> {
    const deletedUser = await this.userRepository.delete(command.id);

    if (!deletedUser) {
      throw new NotFoundException('User not found.');
    }

    return deletedUser;
  }
}
