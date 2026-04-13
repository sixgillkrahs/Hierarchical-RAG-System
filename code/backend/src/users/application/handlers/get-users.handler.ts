import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';

import {
  type PaginatedResult,
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/user.repository';
import type { UserSummary } from '../../domain/user-summary';
import { GetUsersQuery } from '../queries/get-users.query';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler
  implements IQueryHandler<GetUsersQuery, PaginatedResult<UserSummary>>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  execute(query: GetUsersQuery): Promise<PaginatedResult<UserSummary>> {
    return this.userRepository.findPaginated(query.page, query.limit);
  }
}
