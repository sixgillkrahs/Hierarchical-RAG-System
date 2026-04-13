import type { UserSummary } from './user-summary';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export interface UserRepository {
  create(input: {
    displayName: string;
    email: string;
    isActive: boolean;
    passwordHash: string;
    roleIds: string[];
  }): Promise<UserSummary>;
  findById(id: string): Promise<UserSummary | null>;
  findAll(): Promise<UserSummary[]>;
  findPaginated(page: number, limit: number): Promise<PaginatedResult<UserSummary>>;
  update(
    id: string,
    input: {
      displayName?: string;
      email?: string;
      isActive?: boolean;
      passwordHash?: string;
      roleIds?: string[];
    },
  ): Promise<UserSummary | null>;
  delete(id: string): Promise<UserSummary | null>;
  countRolesByIds(ids: string[]): Promise<number>;
}
