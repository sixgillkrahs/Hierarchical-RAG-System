import type { ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';

describe('AppController', () => {
  it('returns backend metadata', () => {
    const values: Record<string, string> = {
      APP_NAME: 'Test API',
      NODE_ENV: 'test',
    };

    const configService = {
      get: (key: string) => values[key],
    } as unknown as ConfigService;

    const controller = new AppController(configService);

    expect(controller.getMetadata()).toEqual({
      appName: 'Test API',
      docsUrl: '/api/docs',
      environment: 'test',
      version: '0.1.0',
    });
  });
});
