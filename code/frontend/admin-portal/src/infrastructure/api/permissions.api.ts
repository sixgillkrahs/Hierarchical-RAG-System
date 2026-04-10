import { AxiosMethod } from "@/infrastructure/lib/axios/method";
import request from "@/infrastructure/lib/axios/request";
import type {
  PermissionEntity,
  CreatePermissionPayload,
  CreatePermissionResponse,
  UpdatePermissionPayload,
  UpdatePermissionResponse,
} from "@/domain/entities/permission.entity";

export const PermissionsApi = {
  getAll: (): Promise<PermissionEntity[]> =>
    request({
      url: "/permissions",
      method: AxiosMethod.GET,
    }) as Promise<PermissionEntity[]>,

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
};
