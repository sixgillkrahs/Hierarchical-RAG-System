import type { RoleSummary } from './role-summary';

export const ROLE_READ_REPOSITORY = Symbol('ROLE_READ_REPOSITORY');

export interface RoleReadRepository {
  findAll(): Promise<RoleSummary[]>;
}

