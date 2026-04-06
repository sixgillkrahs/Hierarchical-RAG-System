import {
  BadGatewayException,
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { CreateFolderDto } from './dto/create-folder.dto';
import type { DeleteFolderDto } from './dto/delete-folder.dto';
import type {
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

  constructor(private readonly configService: ConfigService) {
    this.pythonApiBaseUrl =
      this.configService.get<string>('PYTHON_API_BASE_URL') ??
      'http://127.0.0.1:8000';
    this.pythonApiTimeoutMs =
      this.configService.get<number>('PYTHON_API_TIMEOUT_MS') ?? 10_000;
    this.storageCacheTtlMs =
      this.configService.get<number>('STORAGE_CACHE_TTL_MS') ?? 30_000;
  }

  async listFolders(currentPath = ''): Promise<FolderListResponseDto> {
    const cacheKey = currentPath.trim();
    const cached = this.folderCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const searchParams = new URLSearchParams();
    if (cacheKey.length > 0) {
      searchParams.set('current_path', cacheKey);
    }

    const response = await this.request<FolderListResponseDto>(
      `/folders${searchParams.size > 0 ? `?${searchParams.toString()}` : ''}`,
    );

    if (this.storageCacheTtlMs > 0) {
      this.folderCache.set(cacheKey, {
        value: response,
        expiresAt: Date.now() + this.storageCacheTtlMs,
      });
    }

    return response;
  }

  async createFolder(
    payload: CreateFolderDto,
  ): Promise<FolderCreateResponseDto> {
    const response = await this.request<FolderCreateResponseDto>('/folders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    this.clearCache();
    return response;
  }

  async deleteFolder(
    payload: DeleteFolderDto,
  ): Promise<FolderDeleteResponseDto> {
    const response = await this.request<FolderDeleteResponseDto>('/folders', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    this.clearCache();
    return response;
  }

  async renameFolder(
    payload: RenameFolderDto,
  ): Promise<FolderRenameResponseDto> {
    const response = await this.request<FolderRenameResponseDto>('/folders', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    this.clearCache();
    return response;
  }

  private clearCache(): void {
    this.folderCache.clear();
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
}
