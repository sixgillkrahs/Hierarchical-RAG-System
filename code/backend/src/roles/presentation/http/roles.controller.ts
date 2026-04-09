import { Controller, Get, Version } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequirePermissions } from '../../../common/auth/decorators/require-permissions.decorator';
import { GetRolesQuery } from '../../application/queries/get-roles.query';

@ApiTags('roles')
@ApiCookieAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @Version('1')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'List roles with their permissions' })
  @ApiOkResponse({
    description: 'Current role catalog.',
  })
  findAll() {
    return this.queryBus.execute(new GetRolesQuery());
  }
}

