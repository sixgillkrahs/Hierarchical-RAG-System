import { Body, Controller, Get, Post, Version } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequirePermissions } from '../../../common/auth/decorators/require-permissions.decorator';
import { CreatePermissionCommand } from '../../application/commands/create-permission.command';
import { GetPermissionsQuery } from '../../application/queries/get-permissions.query';
import type { PermissionSummary } from '../../domain/permission-summary';
import { CreatePermissionDto } from '../../dto/create-permission.dto';

@ApiTags('permissions')
@ApiCookieAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Version('1')
  @RequirePermissions('permissions.read')
  @ApiOperation({ summary: 'List permission catalog' })
  @ApiOkResponse({
    description: 'Permissions available in the RBAC system.',
  })
  findAll() {
    return this.queryBus.execute(new GetPermissionsQuery());
  }

  @Post()
  @Version('1')
  @RequirePermissions('permissions.manage')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiOkResponse({
    description: 'Permission created successfully.',
  })
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const permission = await this.commandBus.execute<
      CreatePermissionCommand,
      PermissionSummary
    >(
      new CreatePermissionCommand(
        createPermissionDto.code,
        createPermissionDto.name,
      ),
    );

    return {
      message: 'Permission created successfully!',
      permission,
    };
  }
}
