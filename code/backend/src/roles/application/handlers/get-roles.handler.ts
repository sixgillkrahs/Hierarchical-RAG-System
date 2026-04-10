import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';

import {
  ROLE_REPOSITORY,
  type RoleRepository,
  type PaginatedResult,
} from '../../domain/role-read.repository';
import type { RoleSummary } from '../../domain/role-summary';
import { GetRolesQuery } from '../queries/get-roles.query';

@QueryHandler(GetRolesQuery)
export class GetRolesHandler
  implements IQueryHandler<GetRolesQuery, PaginatedResult<RoleSummary>>
{
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
  ) {}

  execute(query: GetRolesQuery): Promise<PaginatedResult<RoleSummary>> {
    return this.roleRepository.findPaginated(query.page, query.limit);
  }
}

