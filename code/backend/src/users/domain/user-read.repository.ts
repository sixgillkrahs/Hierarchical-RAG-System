import type { UserSummary } from './user-summary';

export const USER_READ_REPOSITORY = Symbol('USER_READ_REPOSITORY');

export interface UserReadRepository {
  findAll(): Promise<UserSummary[]>;
}

