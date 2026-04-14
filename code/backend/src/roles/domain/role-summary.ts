import type { StorageScopeSummary } from '../../common/auth/storage-scope.types';

export type RoleSummary = {
  description: string;
  id: string;
  name: string;
  permissionIds: string[];
  permissions: string[];
  storageScopes: StorageScopeSummary[];
};

