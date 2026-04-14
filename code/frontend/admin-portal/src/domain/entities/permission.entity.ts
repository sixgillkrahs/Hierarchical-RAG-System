import type { GetPaginatedParams } from "@/shared/types";

export type PermissionEntity = {
  id: string; // The UUID from the backend
  code: string;
  route: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedPermissions = {
  data: PermissionEntity[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

export type GetPermissionsParams = GetPaginatedParams;

export type CreatePermissionPayload = {
  code: string;
  route: string;
  description?: string;
};

export type CreatePermissionResponse = {
  message: string;
  permission: PermissionEntity;
};

export type UpdatePermissionPayload = {
  id: string;
  code?: string;
  route?: string;
  description?: string;
};

export type UpdatePermissionResponse = {
  message: string;
  permission: PermissionEntity;
};

export type DeletePermissionResponse = {
  message: string;
  permission: PermissionEntity;
};
