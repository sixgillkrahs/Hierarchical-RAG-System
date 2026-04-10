import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  ParseIntPipe,
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
import { CreateRoleCommand } from '../../application/commands/create-role.command';
import { DeleteRoleCommand } from '../../application/commands/delete-role.command';
import { UpdateRoleCommand } from '../../application/commands/update-role.command';
import { GetRoleByIdQuery } from '../../application/queries/get-role-by-id.query';
import { GetRolesQuery } from '../../application/queries/get-roles.query';
import type { RoleSummary } from '../../domain/role-summary';
import { CreateRoleDto } from '../../dto/create-role.dto';
import { UpdateRoleDto } from '../../dto/update-role.dto';

@ApiTags('roles')
@ApiCookieAuth()
@Controller('roles')
export class RolesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Version('1')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'List roles with their permissions' })
  @ApiOkResponse({
    description: 'Current role catalog.',
  })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.queryBus.execute(new GetRolesQuery(page, limit));
  }

  @Get(':id')
  @Version('1')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Get a role by id' })
  @ApiParam({
    name: 'id',
    description: 'Role UUID.',
  })
  @ApiOkResponse({
    description: 'Role details.',
  })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.queryBus.execute(new GetRoleByIdQuery(id));
  }

  @Post()
  @Version('1')
  @RequirePermissions('roles.manage')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiOkResponse({
    description: 'Role created successfully.',
  })
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.commandBus.execute<CreateRoleCommand, RoleSummary>(
      new CreateRoleCommand(
        createRoleDto.name,
        createRoleDto.description,
        createRoleDto.permissionIds ?? [],
      ),
    );

    return {
      message: 'Role created successfully!',
      role,
    };
  }

  @Patch(':id')
  @Version('1')
  @RequirePermissions('roles.manage')
  @ApiOperation({ summary: 'Update an existing role' })
  @ApiParam({
    name: 'id',
    description: 'Role UUID.',
  })
  @ApiBody({ type: UpdateRoleDto })
  @ApiOkResponse({
    description: 'Role updated successfully.',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const role = await this.commandBus.execute<UpdateRoleCommand, RoleSummary>(
      new UpdateRoleCommand(
        id,
        updateRoleDto.name,
        updateRoleDto.description,
        updateRoleDto.permissionIds,
      ),
    );

    return {
      message: 'Role updated successfully!',
      role,
    };
  }

  @Delete(':id')
  @Version('1')
  @RequirePermissions('roles.manage')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({
    name: 'id',
    description: 'Role UUID.',
  })
  @ApiOkResponse({
    description: 'Role deleted successfully.',
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const role = await this.commandBus.execute<DeleteRoleCommand, RoleSummary>(
      new DeleteRoleCommand(id),
    );

    return {
      message: 'Role deleted successfully!',
      role,
    };
  }
}

