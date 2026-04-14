import type { GetPaginatedParams } from "@/shared/types";

export type StorageScopeCapability = "read" | "manage";

export type StorageScope = {
  capability: StorageScopeCapability;
  id?: string;
  inheritChildren: boolean;
  pathPrefix: string;
};

export type RoleEntity = {
  createdAt?: string;
  description: string;
  id: string;
  name: string;
  permissionIds: string[];
  permissions: string[];
  storageScopes: StorageScope[];
  updatedAt?: string;
};

export type PaginatedResult<T> = {
  data: T[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

export type GetRolesParams = GetPaginatedParams;

export type CreateRolePayload = {
  description: string;
  name: string;
  permissionIds?: string[];
  storageScopes?: StorageScope[];
};

export type CreateRoleResponse = {
  message: string;
  role: RoleEntity;
};

export type UpdateRolePayload = {
  description?: string;
  id: string;
  name?: string;
  permissionIds?: string[];
  storageScopes?: StorageScope[];
};

export type UpdateRoleResponse = {
  message: string;
  role: RoleEntity;
};
