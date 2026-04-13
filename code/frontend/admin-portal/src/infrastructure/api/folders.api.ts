import { AxiosMethod } from "@/infrastructure/lib/axios/method";
import request from "@/infrastructure/lib/axios/request";
import type {
  FolderBulkDeletePayload,
  FolderBulkDeleteResponse,
  FolderCreatePayload,
  FolderCreateResponse,
  FolderDeletePayload,
  FolderDeleteResponse,
  FolderListResponse,
  FolderRenamePayload,
  FolderRenameResponse,
} from "@/domain/entities/folder.entity";

export const FoldersApi = {
  list: (currentPath?: string): Promise<FolderListResponse> =>
    request({
      url: "/folders",
      method: AxiosMethod.GET,
      params: currentPath ? { current_path: currentPath } : undefined,
    }) as Promise<FolderListResponse>,

  create: (payload: FolderCreatePayload): Promise<FolderCreateResponse> =>
    request({
      url: "/folders",
      method: AxiosMethod.POST,
      data: payload,
    }) as Promise<FolderCreateResponse>,

  delete: (payload: FolderDeletePayload): Promise<FolderDeleteResponse> =>
    request({
      url: "/folders",
      method: AxiosMethod.DELETE,
      data: payload,
    }) as Promise<FolderDeleteResponse>,

  bulkDelete: (
    payload: FolderBulkDeletePayload,
  ): Promise<FolderBulkDeleteResponse> =>
    request({
      url: "/folders/bulk-delete",
      method: AxiosMethod.POST,
      data: payload,
    }) as Promise<FolderBulkDeleteResponse>,

  rename: (payload: FolderRenamePayload): Promise<FolderRenameResponse> =>
    request({
      url: "/folders",
      method: AxiosMethod.PATCH,
      data: payload,
    }) as Promise<FolderRenameResponse>,
};
