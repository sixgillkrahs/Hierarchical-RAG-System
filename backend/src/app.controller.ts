import { Controller, Get, Version } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from './common/auth/decorators/public.decorator';

@ApiTags('system')
@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Public()
  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Return backend metadata' })
  @ApiOkResponse({
    description: 'High-level backend metadata.',
  })
  getMetadata(): {
    appName: string;
    docsUrl: string;
    environment: string;
    version: string;
  } {
    return {
      appName: this.configService.get<string>('APP_NAME') ?? 'Hierarchical RAG API',
      docsUrl: '/api/docs',
      environment: this.configService.get<string>('NODE_ENV') ?? 'development',
      version: '0.1.0',
    };
  }
}
