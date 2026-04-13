import type { IQuery } from '@nestjs/cqrs';

export class GetUsersQuery implements IQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
