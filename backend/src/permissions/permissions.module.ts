import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreatePermissionHandler } from './application/handlers/create-permission.handler';
import { GetPermissionsHandler } from './application/handlers/get-permissions.handler';
import { PERMISSION_REPOSITORY } from './domain/permission.repository';
import { Permission } from './entities/permission.entity';
import { TypeOrmPermissionRepository } from './infrastructure/repositories/typeorm-permission.repository';
import { PermissionsController } from './presentation/http/permissions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Permission]), CqrsModule],
  controllers: [PermissionsController],
  providers: [
    CreatePermissionHandler,
    GetPermissionsHandler,
    TypeOrmPermissionRepository,
    {
      provide: PERMISSION_REPOSITORY,
      useExisting: TypeOrmPermissionRepository,
    },
  ],
})
export class PermissionsModule {}
