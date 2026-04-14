import {
  BadGatewayException,
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StorageScopeService } from '../common/auth/storage-scope.service';
import type { AuthenticatedUser } from '../common/auth/interfaces/authenticated-user.interface';
import { Document } from '../documents/entities/document.entity';
import type { CreateFolderDto } from './dto/create-folder.dto';
import type { DeleteFolderDto } from './dto/delete-folder.dto';
import type { DeleteFoldersDto } from './dto/delete-folders.dto';
import type {
  FolderBulkDeleteResponseDto,
  FolderCreateResponseDto,
  FolderDeleteResponseDto,
  FolderListResponseDto,
  FolderRenameResponseDto,
} from './dto/folder.responses';
import type { RenameFolderDto } from './dto/rename-folder.dto';

type CachedFolderList = {
  expiresAt: number;
  value: FolderListResponseDto;
};

@Injectable()
export class FoldersService {
  private readonly logger = new Logger(FoldersService.name);
  private readonly folderCache = new Map<string, CachedFolderList>();
  private readonly pythonApiBaseUrl: string;
  private readonly pythonApiTimeoutMs: number;
  private readonly storageCacheTtlMs: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly storageScopeService: StorageScopeService,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {
    this.pythonApiBaseUrl =
      this.configService.get<string>('PYTHON_API_BASE_URL') ??
      'http://127.0.0.1:8000';
    this.pythonApiTimeoutMs =
      this.configService.get<number>('PYTHON_API_TIMEOUT_MS') ?? 10_000;
    this.storageCacheTtlMs =
      this.configService.get<number>('STORAGE_CACHE_TTL_MS') ?? 30_000;
  }

  async listFolders(
    currentPath = '',
    user?: AuthenticatedUser,
  ): Promise<FolderListResponseDto> {
    const normalizedPath = this.storageScopeService.normalizePath(currentPath);
    const scopes = await this.getScopes(user);

    if (normalizedPath.length > 0) {
      this.storageScopeService.assertCanTraversePath(normalizedPath, scopes);
    }

    const cacheKey = `${user?.userId ?? 'anonymous'}:${normalizedPath}`;
    const cached = this.folderCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const searchParams = new URLSearchParams();
    if (normalizedPath.length > 0) {
      searchParams.set('current_path', normalizedPath);
    }

    const response = await this.request<FolderListResponseDto>(
      `/folders${searchParams.size > 0 ? `?${searchParams.toString()}` : ''}`,
    );
    const filteredResponse = {
      ...response,
      current_path: normalizedPath,
      folders: response.folders.filter((folder) =>
        this.storageScopeService.isPathVisible(folder.path, scopes),
      ),
    };

    if (this.storageCacheTtlMs > 0) {
      this.folderCache.set(cacheKey, {
        value: filteredResponse,
        expiresAt: Date.now() + this.storageCacheTtlMs,
      });
    }

    return filteredResponse;
  }

  async listFoldersForScopePicker(
    currentPath = '',
  ): Promise<FolderListResponseDto> {
    const normalizedPath = this.storageScopeService.normalizePath(currentPath);
    const cacheKey = `role-scope-picker:${normalizedPath}`;
    const cached = this.folderCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const searchParams = new URLSearchParams();
    if (normalizedPath.length > 0) {
      searchParams.set('current_path', normalizedPath);
    }

    const response = await this.request<FolderListResponseDto>(
      `/folders${searchParams.size > 0 ? `?${searchParams.toString()}` : ''}`,
    );
    const pickerResponse = {
      ...response,
      current_path: normalizedPath,
    };

    if (this.storageCacheTtlMs > 0) {
      this.folderCache.set(cacheKey, {
        value: pickerResponse,
        expiresAt: Date.now() + this.storageCacheTtlMs,
      });
    }

    return pickerResponse;
  }

  async createFolder(
    payload: CreateFolderDto,
    user?: AuthenticatedUser,
  ): Promise<FolderCreateResponseDto> {
    const scopes = await this.getScopes(user);
    const folderPath = this.storageScopeService.normalizePath(payload.folder_path);
    this.storageScopeService.assertCanManagePath(folderPath, scopes);

    const response = await this.request<FolderCreateResponseDto>('/folders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        folder_path: folderPath,
      }),
    });

    this.clearCache();
    return response;
  }

  async deleteFolder(
    payload: DeleteFolderDto,
    user?: AuthenticatedUser,
  ): Promise<FolderDeleteResponseDto> {
    const scopes = await this.getScopes(user);
    const normalizedFolderPath = this.storageScopeService.normalizePath(
      payload.folder_path,
    );
    this.storageScopeService.assertCanManagePath(normalizedFolderPath, scopes);

    const response = await this.deleteFolderRequest({
      folder_path: normalizedFolderPath,
    });

    await this.deleteDocumentMetadataForFolder(normalizedFolderPath);
    this.clearCache();
    return response;
  }

  async deleteFolders(
    payload: DeleteFoldersDto,
    user?: AuthenticatedUser,
  ): Promise<FolderBulkDeleteResponseDto> {
    const scopes = await this.getScopes(user);
    const folderPaths = payload.folder_paths.map((folderPath) =>
      this.storageScopeService.normalizePath(folderPath),
    );

    folderPaths.forEach((folderPath) =>
      this.storageScopeService.assertCanManagePath(folderPath, scopes),
    );

    const response = await this.request<FolderBulkDeleteResponseDto>(
      '/folders/bulk-delete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folder_paths: folderPaths,
        }),
      },
    );

    if (response.succeeded > 0) {
      const deletedFolderPaths = response.results
        .filter((result) => result.success)
        .map((result) =>
          this.storageScopeService.normalizePath(result.folder_path),
        );

      await this.deleteDocumentMetadataForFolders(deletedFolderPaths);
      this.clearCache();
    }

    return response;
  }

  async renameFolder(
    payload: RenameFolderDto,
    user?: AuthenticatedUser,
  ): Promise<FolderRenameResponseDto> {
    const scopes = await this.getScopes(user);
    const oldPath = this.storageScopeService.normalizePath(payload.current_path);
    const newPath = this.storageScopeService.normalizePath(payload.new_path);

    this.storageScopeService.assertCanManagePath(oldPath, scopes);
    this.storageScopeService.assertCanManagePath(newPath, scopes);

    const response = await this.request<FolderRenameResponseDto>('/folders', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_path: oldPath,
        new_path: newPath,
      }),
    });

    await this.renameDocumentMetadata(oldPath, newPath);
    this.clearCache();
    return response;
  }

  private clearCache(): void {
    this.folderCache.clear();
  }

  private deleteFolderRequest(
    payload: DeleteFolderDto,
  ): Promise<FolderDeleteResponseDto> {
    return this.request<FolderDeleteResponseDto>('/folders', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.pythonApiTimeoutMs,
    );

    try {
      const response = await fetch(this.buildUrl(path), {
        ...init,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw await this.mapError(response);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        this.logger.warn(`AI backend folder request timed out: ${path}`);
        throw new ServiceUnavailableException('AI backend request timed out.');
      }

      this.logger.error(
        `AI backend folder request failed: ${path}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadGatewayException(
        'Could not reach the AI backend folder API.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildUrl(path: string): string {
    const baseUrl = this.pythonApiBaseUrl.endsWith('/')
      ? this.pythonApiBaseUrl
      : `${this.pythonApiBaseUrl}/`;

    return new URL(path, baseUrl).toString();
  }

  private async mapError(response: Response): Promise<HttpException> {
    let detail = 'AI backend folder API returned an error.';

    try {
      const payload = (await response.json()) as { detail?: unknown };
      if (typeof payload.detail === 'string' && payload.detail.trim().length > 0) {
        detail = payload.detail;
      }
    } catch {
      this.logger.warn(
        `Could not parse AI backend error payload (${response.status}).`,
      );
    }

    return new HttpException(detail, response.status);
  }

  private async getScopes(
    user?: AuthenticatedUser,
  ) {
    if (!user) {
      return [];
    }

    return this.storageScopeService.getEffectiveScopes(user.userId);
  }

  private async deleteDocumentMetadataForFolder(folderPath: string): Promise<void> {
    if (!folderPath) {
      return;
    }

    await this.documentRepository
      .createQueryBuilder()
      .delete()
      .from(Document)
      .where('folder_path = :folderPath', {
        folderPath,
      })
      .orWhere('folder_path LIKE :descendantPath', {
        descendantPath: `${folderPath}/%`,
      })
      .execute();
  }

  private async deleteDocumentMetadataForFolders(
    folderPaths: string[],
  ): Promise<void> {
    const uniqueFolderPaths = Array.from(
      new Set(folderPaths.filter((folderPath) => folderPath.length > 0)),
    );

    for (const folderPath of uniqueFolderPaths) {
      await this.deleteDocumentMetadataForFolder(folderPath);
    }
  }

  private async renameDocumentMetadata(
    oldPath: string,
    newPath: string,
  ): Promise<void> {
    if (!oldPath || !newPath || oldPath === newPath) {
      return;
    }

    const documents = await this.documentRepository
      .createQueryBuilder('document')
      .where('document.folderPath = :folderPath', {
        folderPath: oldPath,
      })
      .orWhere('document.folderPath LIKE :descendantPath', {
        descendantPath: `${oldPath}/%`,
      })
      .getMany();

    if (documents.length === 0) {
      return;
    }

    const oldPrefix = `${oldPath}/`;
    const newPrefix = `${newPath}/`;

    for (const document of documents) {
      if (document.folderPath === oldPath) {
        document.folderPath = newPath;
      } else if (document.folderPath?.startsWith(oldPrefix)) {
        document.folderPath = `${newPath}${document.folderPath.slice(oldPath.length)}`;
      }

      if (document.objectName.startsWith(oldPrefix)) {
        document.objectName = `${newPrefix}${document.objectName.slice(oldPrefix.length)}`;
      }

      const oldBucketPath = `/${document.bucket}/${oldPrefix}`;
      const newBucketPath = `/${document.bucket}/${newPrefix}`;
      if (document.url.includes(oldBucketPath)) {
        document.url = document.url.replace(oldBucketPath, newBucketPath);
      }
    }

    await this.documentRepository.save(documents);
  }
}
