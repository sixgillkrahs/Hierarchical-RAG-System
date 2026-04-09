import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import type { RagCapability } from '../../domain/rag-query-result';
import { GetRagCapabilitiesQuery } from '../queries/get-rag-capabilities.query';

@QueryHandler(GetRagCapabilitiesQuery)
export class GetRagCapabilitiesHandler
  implements IQueryHandler<GetRagCapabilitiesQuery, RagCapability>
{
  constructor(private readonly configService: ConfigService) {}

  execute(): Promise<RagCapability> {
    return Promise.resolve({
      status: 'scaffolded',
      provider:
        this.configService.get<string>('VECTOR_STORE_PROVIDER') ?? 'memory',
      embeddingModel:
        this.configService.get<string>('EMBEDDING_MODEL') ??
        'text-embedding-3-small',
      chatModel: this.configService.get<string>('CHAT_MODEL') ?? 'gpt-4o-mini',
      topK: this.configService.get<number>('RAG_DEFAULT_TOP_K') ?? 5,
    });
  }
}

