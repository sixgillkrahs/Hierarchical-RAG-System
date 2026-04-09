import { Body, Controller, Get, Post, Version } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { RequirePermissions } from '../../../common/auth/decorators/require-permissions.decorator';
import { QueryRagCommand } from '../../application/commands/query-rag.command';
import { GetRagCapabilitiesQuery } from '../../application/queries/get-rag-capabilities.query';
import { QueryRagDto } from '../../dto/query-rag.dto';

@ApiTags('rag')
@ApiCookieAuth()
@Controller('rag')
export class RagController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('capabilities')
  @Version('1')
  @RequirePermissions('rag.read')
  @ApiOperation({ summary: 'Describe the current RAG scaffold capabilities' })
  @ApiOkResponse({
    description: 'Current feature flags and provider placeholders.',
  })
  getCapabilities() {
    return this.queryBus.execute(new GetRagCapabilitiesQuery());
  }

  @Post('query')
  @Version('1')
  @RequirePermissions('rag.query')
  @ApiOperation({ summary: 'Run a placeholder hierarchical RAG query' })
  @ApiBody({ type: QueryRagDto })
  @ApiCreatedResponse({
    description: 'Placeholder query response until the full RAG pipeline is connected.',
  })
  query(@Body() payload: QueryRagDto) {
    return this.commandBus.execute(
      new QueryRagCommand(
        payload.question,
        payload.topK,
        payload.contextWindow,
        payload.filters,
      ),
    );
  }
}
