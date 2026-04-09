import { Inject, UnauthorizedException } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';

import {
  AUTH_USER_REPOSITORY,
  type AuthUserRepository,
} from '../../domain/auth-user.repository';
import type { AuthProfile } from '../../domain/auth-profile';
import { GetCurrentUserQuery } from '../queries/get-current-user.query';

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler
  implements IQueryHandler<GetCurrentUserQuery, AuthProfile>
{
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly authUserRepository: AuthUserRepository,
  ) {}

  async execute(query: GetCurrentUserQuery): Promise<AuthProfile> {
    const profile = await this.authUserRepository.findProfileById(query.userId);

    if (!profile) {
      throw new UnauthorizedException('Authentication required.');
    }

    return profile;
  }
}

