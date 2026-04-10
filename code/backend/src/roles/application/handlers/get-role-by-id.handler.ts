import { Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';

import {
  ROLE_REPOSITORY,
  type RoleRepository,
} from '../../domain/role-read.repository';
import type { RoleSummary } from '../../domain/role-summary';
import { GetRoleByIdQuery } from '../queries/get-role-by-id.query';

@QueryHandler(GetRoleByIdQuery)
export class GetRoleByIdHandler
  implements IQueryHandler<GetRoleByIdQuery, RoleSummary>
{
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(query: GetRoleByIdQuery): Promise<RoleSummary> {
    const role = await this.roleRepository.findById(query.id);

    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    return role;
  }
}
