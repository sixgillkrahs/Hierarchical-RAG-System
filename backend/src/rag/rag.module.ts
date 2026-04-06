import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { GetRagCapabilitiesHandler } from './application/handlers/get-rag-capabilities.handler';
import { QueryRagHandler } from './application/handlers/query-rag.handler';
import { RagController } from './presentation/http/rag.controller';

@Module({
  imports: [CqrsModule],
  controllers: [RagController],
  providers: [GetRagCapabilitiesHandler, QueryRagHandler],
})
export class RagModule {}
