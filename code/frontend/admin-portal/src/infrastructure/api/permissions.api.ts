import { AxiosMethod } from "@/infrastructure/lib/axios/method";
import request from "@/infrastructure/lib/axios/request";
import type {
  CreatePermissionPayload,
  CreatePermissionResponse,
  UpdatePermissionPayload,
  UpdatePermissionResponse,
  DeletePermissionResponse,
  GetPermissionsParams,
  PaginatedPermissions,
} from "@/domain/entities/permission.entity";

export const PermissionsApi = {
  getAll: (params?: GetPermissionsParams): Promise<PaginatedPermissions> =>
    request({
      url: "/permissions",
      method: AxiosMethod.GET,
      params,
    }) as Promise<PaginatedPermissions>,

  create: (
    payload: CreatePermissionPayload,
  ): Promise<CreatePermissionResponse> =>
    request({
      url: "/permissions",
      method: AxiosMethod.POST,
      data: payload,
    }) as Promise<CreatePermissionResponse>,

  update: ({
    id,
    ...payload
  }: UpdatePermissionPayload): Promise<UpdatePermissionResponse> =>
    request({
      url: `/permissions/${id}`,
      method: AxiosMethod.PATCH,
      data: payload,
    }) as Promise<UpdatePermissionResponse>,

  delete: (id: string): Promise<DeletePermissionResponse> =>
    request({
      url: `/permissions/${id}`,
      method: AxiosMethod.DELETE,
    }) as Promise<DeletePermissionResponse>,
};
