import type { ICommand } from '@nestjs/cqrs';

export class UpdateUserCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly email?: string,
    public readonly displayName?: string,
    public readonly password?: string,
    public readonly roleIds?: string[],
    public readonly isActive?: boolean,
  ) {}
}
