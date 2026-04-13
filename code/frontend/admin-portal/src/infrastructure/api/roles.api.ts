import type {
  CreateRolePayload,
  CreateRoleResponse,
  PaginatedResult,
  RoleEntity,
  UpdateRolePayload,
  UpdateRoleResponse,
} from "@/domain/entities/role.entity";
import { AxiosMethod } from "@/infrastructure/lib/axios/method";
import request from "@/infrastructure/lib/axios/request";
import type { GetPaginatedParams } from "@/shared/types";

export type DeleteRoleResponse = { message: string; role: RoleEntity };

export const RolesApi = {
  getAll: (params?: GetPaginatedParams): Promise<PaginatedResult<RoleEntity>> =>
    request({
      url: "/roles",
      method: AxiosMethod.GET,
      params,
    }) as Promise<PaginatedResult<RoleEntity>>,

  create: (payload: CreateRolePayload): Promise<CreateRoleResponse> =>
    request({
      url: "/roles",
      method: AxiosMethod.POST,
      data: payload,
    }) as Promise<CreateRoleResponse>,

  update: ({
    id,
    ...payload
  }: UpdateRolePayload): Promise<UpdateRoleResponse> =>
    request({
      url: `/roles/${id}`,
      method: AxiosMethod.PATCH,
      data: payload,
    }) as Promise<UpdateRoleResponse>,

  delete: (id: string): Promise<DeleteRoleResponse> =>
    request({
      url: `/roles/${id}`,
      method: AxiosMethod.DELETE,
    }) as Promise<DeleteRoleResponse>,
};
