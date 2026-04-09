import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';

import {
  PERMISSION_REPOSITORY,
  type PermissionRepository,
} from '../../domain/permission.repository';
import type { PermissionSummary } from '../../domain/permission-summary';
import { GetPermissionsQuery } from '../queries/get-permissions.query';

@QueryHandler(GetPermissionsQuery)
export class GetPermissionsHandler
  implements IQueryHandler<GetPermissionsQuery, PermissionSummary[]>
{
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  execute(): Promise<PermissionSummary[]> {
    return this.permissionRepository.findAll();
  }
}

