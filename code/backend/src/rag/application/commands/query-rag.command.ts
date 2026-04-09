import type { ICommand } from '@nestjs/cqrs';

export class QueryRagCommand implements ICommand {
  constructor(
    public readonly question: string,
    public readonly topK?: number,
    public readonly contextWindow?: string[],
    public readonly filters?: Record<string, boolean | number | string>,
  ) {}
}

