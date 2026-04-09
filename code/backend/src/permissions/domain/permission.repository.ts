import type { PermissionSummary } from './permission-summary';

export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');

export interface PermissionRepository {
  create(input: {
    code: string;
    description: string;
  }): Promise<PermissionSummary>;
  findById(id: string): Promise<PermissionSummary | null>;
  findAll(): Promise<PermissionSummary[]>;
  update(
    id: string,
    input: {
      code?: string;
      description?: string;
    },
  ): Promise<PermissionSummary | null>;
  delete(id: string): Promise<PermissionSummary | null>;
  countAssignedRoles(id: string): Promise<number>;
}
