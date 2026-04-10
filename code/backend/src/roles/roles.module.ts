import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateRoleHandler } from './application/handlers/create-role.handler';
import { DeleteRoleHandler } from './application/handlers/delete-role.handler';
import { GetRoleByIdHandler } from './application/handlers/get-role-by-id.handler';
import { GetRolesHandler } from './application/handlers/get-roles.handler';
import { UpdateRoleHandler } from './application/handlers/update-role.handler';
import { ROLE_REPOSITORY } from './domain/role-read.repository';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { TypeOrmRoleReadRepository } from './infrastructure/repositories/typeorm-role-read.repository';
import { RolesController } from './presentation/http/roles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission]), CqrsModule],
  controllers: [RolesController],
  providers: [
    CreateRoleHandler,
    DeleteRoleHandler,
    GetRoleByIdHandler,
    GetRolesHandler,
    UpdateRoleHandler,
    TypeOrmRoleReadRepository,
    {
      provide: ROLE_REPOSITORY,
      useExisting: TypeOrmRoleReadRepository,
    },
  ],
})
export class RolesModule {}
