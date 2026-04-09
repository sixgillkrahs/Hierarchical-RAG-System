import { Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';

import {
  PERMISSION_REPOSITORY,
  type PermissionRepository,
} from '../../domain/permission.repository';
import type { PermissionSummary } from '../../domain/permission-summary';
import { GetPermissionByIdQuery } from '../queries/get-permission-by-id.query';

@QueryHandler(GetPermissionByIdQuery)
export class GetPermissionByIdHandler
  implements IQueryHandler<GetPermissionByIdQuery, PermissionSummary>
{
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(query: GetPermissionByIdQuery): Promise<PermissionSummary> {
    const permission = await this.permissionRepository.findById(query.id);

    if (!permission) {
      throw new NotFoundException('Permission not found.');
    }

    return permission;
  }
}
