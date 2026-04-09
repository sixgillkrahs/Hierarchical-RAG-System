import type { PermissionSummary } from './permission-summary';

export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');

export interface PermissionRepository {
  create(input: {
    code: string;
    description: string;
  }): Promise<PermissionSummary>;
  findAll(): Promise<PermissionSummary[]>;
}

