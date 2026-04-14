import type { ICommand } from '@nestjs/cqrs';

import type { StorageScopeSummary } from '../../../common/auth/storage-scope.types';

export class CreateRoleCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly permissionIds: string[],
    public readonly storageScopes: StorageScopeSummary[] = [],
  ) {}
}
