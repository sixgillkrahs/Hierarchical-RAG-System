import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { RequirePermissions } from '../../../common/auth/decorators/require-permissions.decorator';
import { CreateUserCommand } from '../../application/commands/create-user.command';
import { DeleteUserCommand } from '../../application/commands/delete-user.command';
import { UpdateUserCommand } from '../../application/commands/update-user.command';
import { GetUserByIdQuery } from '../../application/queries/get-user-by-id.query';
import { GetUsersQuery } from '../../application/queries/get-users.query';
import type { UserSummary } from '../../domain/user-summary';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';

@ApiTags('users')
@ApiCookieAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Version('1')
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'List users with roles and permissions' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number, starting from 1.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Page size.',
    example: 10,
  })
  @ApiOkResponse({
    description: 'Current users and their RBAC assignments.',
  })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.queryBus.execute(new GetUsersQuery(page, limit));
  }

  @Get(':id')
  @Version('1')
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({
    name: 'id',
    description: 'User UUID.',
  })
  @ApiOkResponse({
    description: 'User details.',
  })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }

  @Post()
  @Version('1')
  @RequirePermissions('users.manage')
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({
    description: 'User created successfully.',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.commandBus.execute<CreateUserCommand, UserSummary>(
      new CreateUserCommand(
        createUserDto.email,
        createUserDto.displayName,
        createUserDto.password,
        createUserDto.roleIds ?? [],
        createUserDto.isActive ?? true,
      ),
    );

    return {
      message: 'User created successfully!',
      user,
    };
  }

  @Patch(':id')
  @Version('1')
  @RequirePermissions('users.manage')
  @ApiOperation({ summary: 'Update an existing user account' })
  @ApiParam({
    name: 'id',
    description: 'User UUID.',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'User updated successfully.',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.commandBus.execute<UpdateUserCommand, UserSummary>(
      new UpdateUserCommand(
        id,
        updateUserDto.email,
        updateUserDto.displayName,
        updateUserDto.password,
        updateUserDto.roleIds,
        updateUserDto.isActive,
      ),
    );

    return {
      message: 'User updated successfully!',
      user,
    };
  }

  @Delete(':id')
  @Version('1')
  @RequirePermissions('users.manage')
  @ApiOperation({ summary: 'Delete a user account' })
  @ApiParam({
    name: 'id',
    description: 'User UUID.',
  })
  @ApiOkResponse({
    description: 'User deleted successfully.',
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const user = await this.commandBus.execute<DeleteUserCommand, UserSummary>(
      new DeleteUserCommand(id),
    );

    return {
      message: 'User deleted successfully!',
      user,
    };
  }
}
