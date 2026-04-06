import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';

import {
  ROLE_READ_REPOSITORY,
  type RoleReadRepository,
} from '../../domain/role-read.repository';
import type { RoleSummary } from '../../domain/role-summary';
import { GetRolesQuery } from '../queries/get-roles.query';

@QueryHandler(GetRolesQuery)
export class GetRolesHandler implements IQueryHandler<GetRolesQuery, RoleSummary[]> {
  constructor(
    @Inject(ROLE_READ_REPOSITORY)
    private readonly roleReadRepository: RoleReadRepository,
  ) {}

  execute(): Promise<RoleSummary[]> {
    return this.roleReadRepository.findAll();
  }
}

