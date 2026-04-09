import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';

import {
  USER_READ_REPOSITORY,
  type UserReadRepository,
} from '../../domain/user-read.repository';
import type { UserSummary } from '../../domain/user-summary';
import { GetUsersQuery } from '../queries/get-users.query';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery, UserSummary[]> {
  constructor(
    @Inject(USER_READ_REPOSITORY)
    private readonly userReadRepository: UserReadRepository,
  ) {}

  execute(): Promise<UserSummary[]> {
    return this.userReadRepository.findAll();
  }
}

