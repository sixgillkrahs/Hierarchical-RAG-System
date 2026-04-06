import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import type { RagQueryResult } from '../../domain/rag-query-result';
import { QueryRagCommand } from '../commands/query-rag.command';

@CommandHandler(QueryRagCommand)
export class QueryRagHandler
  implements ICommandHandler<QueryRagCommand, RagQueryResult>
{
  constructor(private readonly configService: ConfigService) {}

  execute(command: QueryRagCommand): Promise<RagQueryResult> {
    const topK =
      command.topK ??
      this.configService.get<number>('RAG_DEFAULT_TOP_K') ??
      5;
    const contextChunks = (command.contextWindow ?? [])
      .slice(0, topK)
      .map((content, index) => ({
        content,
        rank: index + 1,
      }));

    return Promise.resolve({
      question: command.question,
      answer:
        'RAG pipeline scaffold is ready. Connect ingestion, embeddings, vector retrieval, and generation in the application layer next.',
      topK,
      provider:
        this.configService.get<string>('VECTOR_STORE_PROVIDER') ?? 'memory',
      embeddingModel:
        this.configService.get<string>('EMBEDDING_MODEL') ??
        'text-embedding-3-small',
      chatModel: this.configService.get<string>('CHAT_MODEL') ?? 'gpt-4o-mini',
      retrievalPlan: [
        'ingest documents into collections',
        'create parent-child chunks',
        'retrieve parent candidates',
        'rerank child chunks',
        'generate the final answer',
      ],
      contextChunks,
    });
  }
}
