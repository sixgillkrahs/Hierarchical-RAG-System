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

import { RequirePermissions } from '../common/auth/decorators/require-permissions.decorator';
import { CreateFolderDto } from './dto/create-folder.dto';
import { DeleteFolderDto } from './dto/delete-folder.dto';
import {
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
  ): Promise<FolderListResponseDto> {
    return this.foldersService.listFolders(currentPath ?? '');
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
  ): Promise<FolderCreateResponseDto> {
    return this.foldersService.createFolder(payload);
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
  ): Promise<FolderDeleteResponseDto> {
    return this.foldersService.deleteFolder(payload);
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
  ): Promise<FolderRenameResponseDto> {
    return this.foldersService.renameFolder(payload);
  }
}
