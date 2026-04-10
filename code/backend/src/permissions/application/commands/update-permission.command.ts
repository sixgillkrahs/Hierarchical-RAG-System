import type { ICommand } from '@nestjs/cqrs';

export class UpdatePermissionCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly code?: string,
    public readonly route?: string,
    public readonly description?: string,
  ) {}
}
