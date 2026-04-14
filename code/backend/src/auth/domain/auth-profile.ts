import type { StorageScopeSummary } from '../../common/auth/storage-scope.types';

export type AuthProfile = {
  email: string;
  id: string;
  permissions: string[];
  roles: string[];
  routes: string[];
  storageScopes: StorageScopeSummary[];
};
