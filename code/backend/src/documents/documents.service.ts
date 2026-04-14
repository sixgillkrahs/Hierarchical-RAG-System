import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { AuthenticatedUser } from '../common/auth/interfaces/authenticated-user.interface';
import { Document } from './entities/document.entity';
import type {
  DocumentItemResponseDto,
  DocumentListResponseDto,
} from './document.responses';

type PythonUploadResponse = {
  bucket: string;
  content_type: string;
  filename: string;
  folder_path?: string;
  object_name: string;
  size: number;
  url: string;
};

type UploadedDocumentFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly pythonApiBaseUrl: string;
  private readonly pythonApiTimeoutMs: number;
  private readonly pythonFilesUploadPath: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {
    this.pythonApiBaseUrl =
      this.configService.get<string>('PYTHON_API_BASE_URL') ??
      'http://127.0.0.1:8000';
    this.pythonApiTimeoutMs =
      this.configService.get<number>('PYTHON_API_TIMEOUT_MS') ?? 10_000;
    this.pythonFilesUploadPath =
      this.configService.get<string>('PYTHON_FILES_UPLOAD_PATH') ??
      '/files/upload';
  }

  async listDocuments(currentPath = ''): Promise<DocumentListResponseDto> {
    const normalizedPath = this.normalizeFolderPath(currentPath, true);
    const queryBuilder = this.documentRepository
      .createQueryBuilder('document')
      .orderBy('document.createdAt', 'DESC');

    if (normalizedPath.length > 0) {
      queryBuilder.where('document.folderPath = :folderPath', {
        folderPath: normalizedPath,
      });
    } else {
      queryBuilder.where(
        '(document.folderPath IS NULL OR document.folderPath = :emptyFolderPath)',
        {
          emptyFolderPath: '',
        },
      );
    }

    const documents = await queryBuilder.getMany();

    return {
      current_path: normalizedPath,
      total: documents.length,
      documents: documents.map((document) => this.toDocumentItem(document)),
    };
  }

  async uploadDocument(
    file: UploadedDocumentFile | undefined,
    folderPath: string | undefined,
    user: AuthenticatedUser | undefined,
  ): Promise<DocumentItemResponseDto> {
    if (!file) {
      throw new BadRequestException('A document file is required.');
    }

    if (file.size <= 0) {
      throw new BadRequestException('Uploaded document must not be empty.');
    }

    const normalizedFolderPath = this.normalizeFolderPath(folderPath ?? '', true);
    const uploadResult = await this.uploadToPythonApi(file, normalizedFolderPath);

    const persistedFolderPath =
      uploadResult.folder_path?.trim() || normalizedFolderPath;

    const document = this.documentRepository.create({
      folderPath: persistedFolderPath || null,
      originalFilename: uploadResult.filename || file.originalname,
      objectName: uploadResult.object_name,
      bucket: uploadResult.bucket,
      contentType:
        uploadResult.content_type ||
        file.mimetype ||
        'application/octet-stream',
      size: uploadResult.size || file.size,
      url: uploadResult.url,
      uploadedByUserId: user?.userId ?? null,
    });

    const savedDocument = await this.documentRepository.save(document);
    return this.toDocumentItem(savedDocument);
  }

  private async uploadToPythonApi(
    file: UploadedDocumentFile,
    folderPath: string,
  ): Promise<PythonUploadResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.pythonApiTimeoutMs,
    );

    try {
      const formData = new FormData();
      formData.append(
        'file',
        new Blob([new Uint8Array(file.buffer)], {
          type: file.mimetype || 'application/octet-stream',
        }),
        file.originalname,
      );

      if (folderPath.length > 0) {
        formData.append('folder_path', folderPath);
      }

      const response = await fetch(this.buildUrl(this.pythonFilesUploadPath), {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw await this.mapError(response);
      }

      return (await response.json()) as PythonUploadResponse;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        this.logger.warn('AI backend document upload request timed out.');
        throw new ServiceUnavailableException('AI backend request timed out.');
      }

      this.logger.error(
        'AI backend document upload request failed.',
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadGatewayException(
        'Could not reach the AI backend upload API.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildUrl(path: string): string {
    const baseUrl = this.pythonApiBaseUrl.endsWith('/')
      ? this.pythonApiBaseUrl
      : `${this.pythonApiBaseUrl}/`;
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

    return new URL(normalizedPath, baseUrl).toString();
  }

  private normalizeFolderPath(folderPath: string, allowEmpty: boolean): string {
    const normalized = folderPath
      .replace(/\\/g, '/')
      .trim()
      .replace(/^\/+|\/+$/g, '');

    if (!normalized) {
      if (allowEmpty) {
        return '';
      }

      throw new BadRequestException('Folder path must not be empty.');
    }

    const segments = normalized
      .split('/')
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (!segments.length) {
      if (allowEmpty) {
        return '';
      }

      throw new BadRequestException('Folder path must not be empty.');
    }

    if (segments.some((segment) => segment === '.' || segment === '..')) {
      throw new BadRequestException(
        "Folder path cannot contain '.' or '..' segments.",
      );
    }

    return segments.join('/');
  }

  private toDocumentItem(document: Document): DocumentItemResponseDto {
    const folderPath = document.folderPath ?? '';

    return {
      id: document.id,
      name: document.originalFilename,
      path: document.objectName,
      folder_path: folderPath,
      original_filename: document.originalFilename,
      object_name: document.objectName,
      bucket: document.bucket,
      content_type: document.contentType,
      size: document.size,
      status: 'uploaded',
      url: document.url,
      uploaded_by_user_id: document.uploadedByUserId ?? undefined,
      created_at: document.createdAt.toISOString(),
      updated_at: document.updatedAt.toISOString(),
    };
  }

  private async mapError(response: Response): Promise<HttpException> {
    let detail = 'AI backend upload API returned an error.';

    try {
      const payload = (await response.json()) as { detail?: unknown };
      if (typeof payload.detail === 'string' && payload.detail.trim().length > 0) {
        detail = payload.detail;
      }
    } catch {
      this.logger.warn(
        `Could not parse AI backend upload error payload (${response.status}).`,
      );
    }

    return new HttpException(detail, response.status);
  }
}
