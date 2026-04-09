import { Controller, Get, Version } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequirePermissions } from '../../../common/auth/decorators/require-permissions.decorator';
import { GetUsersQuery } from '../../application/queries/get-users.query';

@ApiTags('users')
@ApiCookieAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @Version('1')
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'List users with roles and permissions' })
  @ApiOkResponse({
    description: 'Current users and their RBAC assignments.',
  })
  findAll() {
    return this.queryBus.execute(new GetUsersQuery());
  }
}

