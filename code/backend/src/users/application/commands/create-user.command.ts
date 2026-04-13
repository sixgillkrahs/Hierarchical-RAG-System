import type { ICommand } from '@nestjs/cqrs';

export class CreateUserCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly displayName: string,
    public readonly password: string,
    public readonly roleIds: string[],
    public readonly isActive: boolean,
  ) {}
}
