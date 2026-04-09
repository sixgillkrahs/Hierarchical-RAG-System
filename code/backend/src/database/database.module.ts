import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { createTypeOrmOptions } from './typeorm.options';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createTypeOrmOptions({
          DB_TYPE: configService.get('DB_TYPE'),
          DB_HOST: configService.get('DB_HOST'),
          DB_PORT: configService.get('DB_PORT'),
          DB_USERNAME: configService.get('DB_USERNAME'),
          DB_PASSWORD: configService.get('DB_PASSWORD'),
          DB_DATABASE: configService.get('DB_DATABASE'),
          DB_SYNCHRONIZE: configService.get('DB_SYNCHRONIZE'),
          DB_LOGGING: configService.get('DB_LOGGING'),
          DB_RUN_MIGRATIONS: configService.get('DB_RUN_MIGRATIONS'),
          DB_SSL: configService.get('DB_SSL'),
          NODE_ENV: configService.get('NODE_ENV'),
        }),
    }),
  ],
})
export class DatabaseModule {}

