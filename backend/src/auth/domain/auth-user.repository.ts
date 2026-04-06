import type { AuthProfile } from './auth-profile';

export type AuthUserSnapshot = {
  email: string;
  id: string;
  isActive: boolean;
  passwordHash: string;
  permissions: string[];
  roles: string[];
};

export const AUTH_USER_REPOSITORY = Symbol('AUTH_USER_REPOSITORY');

export interface AuthUserRepository {
  findProfileByEmail(email: string): Promise<AuthUserSnapshot | null>;
  findProfileById(id: string): Promise<AuthProfile | null>;
}

