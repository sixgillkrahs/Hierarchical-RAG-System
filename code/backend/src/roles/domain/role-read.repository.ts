import type { RoleSummary } from './role-summary';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export interface RoleRepository {
  create(input: {
    description: string;
    name: string;
    permissionIds: string[];
  }): Promise<RoleSummary>;
  findById(id: string): Promise<RoleSummary | null>;
  findAll(): Promise<RoleSummary[]>;
  findPaginated(page: number, limit: number): Promise<PaginatedResult<RoleSummary>>;
  update(
    id: string,
    input: {
      description?: string;
      name?: string;
      permissionIds?: string[];
    },
  ): Promise<RoleSummary | null>;
  delete(id: string): Promise<RoleSummary | null>;
  countAssignedUsers(id: string): Promise<number>;
  countPermissionsByIds(ids: string[]): Promise<number>;
}

