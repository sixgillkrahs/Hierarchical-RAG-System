import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
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
import {
  DocumentItemResponseDto,
  DocumentListResponseDto,
} from './document.responses';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './upload-document.dto';

type UploadedDocumentFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

@ApiTags('documents')
@ApiCookieAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @Version('1')
  @RequirePermissions('storage.read')
  @ApiOperation({ summary: 'List document metadata for a folder path' })
  @ApiQuery({
    name: 'current_path',
    required: false,
    description: 'Current folder path. Leave empty to list root-level documents.',
    example: 'reports/2026',
  })
  @ApiOkResponse({
    description: 'Document metadata returned from PostgreSQL.',
    type: DocumentListResponseDto,
  })
  findAll(
    @Query('current_path') currentPath?: string,
  ): Promise<DocumentListResponseDto> {
    return this.documentsService.listDocuments(currentPath ?? '');
  }

  @Post('upload')
  @Version('1')
  @RequirePermissions('storage.manage')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a document to MinIO and persist metadata in PostgreSQL' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadDocumentDto })
  @ApiCreatedResponse({
    description: 'Document uploaded successfully.',
    type: DocumentItemResponseDto,
  })
  upload(
    @UploadedFile() file: UploadedDocumentFile | undefined,
    @Body() payload: UploadDocumentDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ): Promise<DocumentItemResponseDto> {
    return this.documentsService.uploadDocument(file, payload.folder_path, user);
  }
}
