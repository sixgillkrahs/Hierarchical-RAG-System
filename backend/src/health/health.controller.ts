import { Controller, Get, Version } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../common/auth/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiOkResponse({
    description: 'Current application health status.',
  })
  getHealth(): { service: string; status: string; timestamp: string } {
    return {
      service: 'hierarchical-rag-backend',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
