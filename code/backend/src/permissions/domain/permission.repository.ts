import type { PermissionSummary } from './permission-summary';

export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export interface PermissionRepository {
  create(input: {
    code: string;
    description: string;
    route: string;
  }): Promise<PermissionSummary>;
  findById(id: string): Promise<PermissionSummary | null>;
  findAll(): Promise<PermissionSummary[]>;
  findPaginated(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<PermissionSummary>>;
  update(
    id: string,
    input: {
      code?: string;
      description?: string;
      route?: string;
    },
  ): Promise<PermissionSummary | null>;
  delete(id: string): Promise<PermissionSummary | null>;
  countAssignedRoles(id: string): Promise<number>;
}
