import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../common/auth/decorators/current-user.decorator';
import { RequirePermissions } from '../common/auth/decorators/require-permissions.decorator';
import type { AuthenticatedUser } from '../common/auth/interfaces/authenticated-user.interface';
import { CreateFolderDto } from './dto/create-folder.dto';
import { DeleteFolderDto } from './dto/delete-folder.dto';
import { DeleteFoldersDto } from './dto/delete-folders.dto';
import {
  FolderBulkDeleteResponseDto,
  FolderCreateResponseDto,
  FolderDeleteResponseDto,
  FolderListResponseDto,
  FolderRenameResponseDto,
} from './dto/folder.responses';
import { RenameFolderDto } from './dto/rename-folder.dto';
import { FoldersService } from './folders.service';

@ApiTags('folders')
@ApiCookieAuth()
@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get()
  @Version('1')
  @RequirePermissions('storage.read')
  @ApiOperation({ summary: 'List folders via the AI backend and cache the response in Nest' })
  @ApiQuery({
    name: 'current_path',
    required: false,
    description: 'Current folder path. Leave empty to list root folders.',
    example: 'documents/contracts',
  })
  @ApiOkResponse({
    description: 'Direct child folders returned from the AI backend.',
    type: FolderListResponseDto,
  })
  findAll(
    @Query('current_path') currentPath?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<FolderListResponseDto> {
    return this.foldersService.listFolders(currentPath ?? '', user);
  }

  @Post()
  @Version('1')
  @RequirePermissions('storage.manage')
  @ApiOperation({ summary: 'Create a folder prefix through the AI backend' })
  @ApiBody({ type: CreateFolderDto })
  @ApiCreatedResponse({
    description: 'Folder prefix created successfully.',
    type: FolderCreateResponseDto,
  })
  create(
    @Body() payload: CreateFolderDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<FolderCreateResponseDto> {
    return this.foldersService.createFolder(payload, user);
  }

  @Post('bulk-delete')
  @Version('1')
  @RequirePermissions('storage.manage')
  @ApiOperation({ summary: 'Delete multiple folder prefixes through the AI backend' })
  @ApiBody({ type: DeleteFoldersDto })
  @ApiOkResponse({
    description: 'Folder prefixes deleted with per-item status.',
    type: FolderBulkDeleteResponseDto,
  })
  bulkDelete(
    @Body() payload: DeleteFoldersDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<FolderBulkDeleteResponseDto> {
    return this.foldersService.deleteFolders(payload, user);
  }

  @Delete()
  @Version('1')
  @RequirePermissions('storage.manage')
  @ApiOperation({ summary: 'Delete a folder prefix through the AI backend' })
  @ApiBody({ type: DeleteFolderDto })
  @ApiOkResponse({
    description: 'Folder prefix deleted successfully.',
    type: FolderDeleteResponseDto,
  })
  remove(
    @Body() payload: DeleteFolderDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<FolderDeleteResponseDto> {
    return this.foldersService.deleteFolder(payload, user);
  }

  @Patch()
  @Version('1')
  @RequirePermissions('storage.manage')
  @ApiOperation({ summary: 'Rename a folder prefix through the AI backend' })
  @ApiBody({ type: RenameFolderDto })
  @ApiOkResponse({
    description: 'Folder prefix renamed successfully.',
    type: FolderRenameResponseDto,
  })
  rename(
    @Body() payload: RenameFolderDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<FolderRenameResponseDto> {
    return this.foldersService.renameFolder(payload, user);
  }
}
