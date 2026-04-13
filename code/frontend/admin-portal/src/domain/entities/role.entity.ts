export type RoleEntity = {
  id: string;
  name: string;
  description: string;
  permissionIds: string[];
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateRolePayload = {
  name: string;
  description: string;
  permissionIds?: string[];
};

export type CreateRoleResponse = {
  message: string;
  role: RoleEntity;
};

export type UpdateRolePayload = {
  id: string;
  name?: string;
  description?: string;
  permissionIds?: string[];
};

export type UpdateRoleResponse = {
  message: string;
  role: RoleEntity;
};
