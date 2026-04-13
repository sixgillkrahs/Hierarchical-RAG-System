import type { GetPaginatedParams } from "@/shared/types";
import type { PaginatedResult } from "./role.entity";

export type UserEntity = {
  createdAt: string;
  displayName: string;
  email: string;
  id: string;
  isActive: boolean;
  permissions: string[];
  roleIds: string[];
  roles: string[];
  updatedAt: string;
};

export interface UserRepositoryProps {
  getUsers(params: GetPaginatedParams): Promise<PaginatedResult<UserEntity>>;
}

export type CreateUserPayload = {
  displayName: string;
  email: string;
  password?: string;
  roleIds?: string[];
  isActive?: boolean;
};

export type UpdateUserPayload = Partial<CreateUserPayload> & { id: string };

export type CreateUserResponse = { message: string; user: UserEntity };
export type UpdateUserResponse = { message: string; user: UserEntity };
export type DeleteUserResponse = { message: string; user: UserEntity };
