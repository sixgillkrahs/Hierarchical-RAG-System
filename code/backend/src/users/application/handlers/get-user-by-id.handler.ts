import { Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';

import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/user.repository';
import type { UserSummary } from '../../domain/user-summary';
import { GetUserByIdQuery } from '../queries/get-user-by-id.query';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler
  implements IQueryHandler<GetUserByIdQuery, UserSummary>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<UserSummary> {
    const user = await this.userRepository.findById(query.id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }
}
