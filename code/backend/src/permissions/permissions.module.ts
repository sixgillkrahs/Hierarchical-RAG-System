import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeletePermissionHandler } from './application/handlers/delete-permission.handler';
import { CreatePermissionHandler } from './application/handlers/create-permission.handler';
import { GetPermissionByIdHandler } from './application/handlers/get-permission-by-id.handler';
import { GetPermissionsHandler } from './application/handlers/get-permissions.handler';
import { UpdatePermissionHandler } from './application/handlers/update-permission.handler';
import { PERMISSION_REPOSITORY } from './domain/permission.repository';
import { Permission } from './entities/permission.entity';
import { TypeOrmPermissionRepository } from './infrastructure/repositories/typeorm-permission.repository';
import { PermissionsController } from './presentation/http/permissions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Permission]), CqrsModule],
  controllers: [PermissionsController],
  providers: [
    CreatePermissionHandler,
    DeletePermissionHandler,
    GetPermissionByIdHandler,
    GetPermissionsHandler,
    UpdatePermissionHandler,
    TypeOrmPermissionRepository,
    {
      provide: PERMISSION_REPOSITORY,
      useExisting: TypeOrmPermissionRepository,
    },
  ],
})
export class PermissionsModule {}
