import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Version,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { RequirePermissions } from '../../../common/auth/decorators/require-permissions.decorator';
import { DeletePermissionCommand } from '../../application/commands/delete-permission.command';
import { CreatePermissionCommand } from '../../application/commands/create-permission.command';
import { UpdatePermissionCommand } from '../../application/commands/update-permission.command';
import { GetPermissionByIdQuery } from '../../application/queries/get-permission-by-id.query';
import { GetPermissionsQuery } from '../../application/queries/get-permissions.query';
import type { PermissionSummary } from '../../domain/permission-summary';
import { CreatePermissionDto } from '../../dto/create-permission.dto';
import { UpdatePermissionDto } from '../../dto/update-permission.dto';

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

  @Get(':id')
  @Version('1')
  @RequirePermissions('permissions.read')
  @ApiOperation({ summary: 'Get a permission by id' })
  @ApiParam({
    name: 'id',
    description: 'Permission UUID.',
  })
  @ApiOkResponse({
    description: 'Permission details.',
  })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.queryBus.execute(new GetPermissionByIdQuery(id));
  }

  @Post()
  @Version('1')
  @RequirePermissions('permissions.manage')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiBody({ type: CreatePermissionDto })
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
        createPermissionDto.description ?? createPermissionDto.name ?? '',
      ),
    );

    return {
      message: 'Permission created successfully!',
      permission,
    };
  }

  @Patch(':id')
  @Version('1')
  @RequirePermissions('permissions.manage')
  @ApiOperation({ summary: 'Update an existing permission' })
  @ApiParam({
    name: 'id',
    description: 'Permission UUID.',
  })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiOkResponse({
    description: 'Permission updated successfully.',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    const permission = await this.commandBus.execute<
      UpdatePermissionCommand,
      PermissionSummary
    >(
      new UpdatePermissionCommand(
        id,
        updatePermissionDto.code,
        updatePermissionDto.description ?? updatePermissionDto.name,
      ),
    );

    return {
      message: 'Permission updated successfully!',
      permission,
    };
  }

  @Delete(':id')
  @Version('1')
  @RequirePermissions('permissions.manage')
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiParam({
    name: 'id',
    description: 'Permission UUID.',
  })
  @ApiOkResponse({
    description: 'Permission deleted successfully.',
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const permission = await this.commandBus.execute<
      DeletePermissionCommand,
      PermissionSummary
    >(new DeletePermissionCommand(id));

    return {
      message: 'Permission deleted successfully!',
      permission,
    };
  }
}
