export type PermissionEntity = {
  id: string; // The UUID from the backend
  code: string;
  route: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};

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
