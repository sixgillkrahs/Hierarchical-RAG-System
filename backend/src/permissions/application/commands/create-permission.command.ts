import type { ICommand } from '@nestjs/cqrs';

export class CreatePermissionCommand implements ICommand {
  constructor(
    public readonly code: string,
    public readonly description: string,
  ) {}
}

