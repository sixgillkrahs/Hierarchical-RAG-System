import type {
  PaginatedResult,
  RoleEntity,
} from "@/domain/entities/role.entity";
import type {
  CreateUserPayload,
  CreateUserResponse,
  DeleteUserResponse,
  UpdateUserPayload,
  UpdateUserResponse,
  UserEntity,
} from "@/domain/entities/user.entity";
import { AxiosMethod } from "@/infrastructure/lib/axios/method";
import request from "@/infrastructure/lib/axios/request";
import type { GetPaginatedParams } from "@/shared/types";

export type DeleteRoleResponse = { message: string; role: RoleEntity };

export const UsersApi = {
  getAll: (params?: GetPaginatedParams): Promise<PaginatedResult<UserEntity>> =>
    request({
      url: "/users",
      method: AxiosMethod.GET,
      params,
    }) as Promise<PaginatedResult<UserEntity>>,

  create: (payload: CreateUserPayload): Promise<CreateUserResponse> =>
    request({
      url: "/users",
      method: AxiosMethod.POST,
      data: payload,
    }) as Promise<CreateUserResponse>,

  update: ({
    id,
    ...payload
  }: UpdateUserPayload): Promise<UpdateUserResponse> =>
    request({
      url: `/users/${id}`,
      method: AxiosMethod.PATCH,
      data: payload,
    }) as Promise<UpdateUserResponse>,

  delete: (id: string): Promise<DeleteUserResponse> =>
    request({
      url: `/users/${id}`,
      method: AxiosMethod.DELETE,
    }) as Promise<DeleteUserResponse>,
};
