import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GetRolesHandler } from './application/handlers/get-roles.handler';
import { ROLE_READ_REPOSITORY } from './domain/role-read.repository';
import { Role } from './entities/role.entity';
import { TypeOrmRoleReadRepository } from './infrastructure/repositories/typeorm-role-read.repository';
import { RolesController } from './presentation/http/roles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), CqrsModule],
  controllers: [RolesController],
  providers: [
    GetRolesHandler,
    TypeOrmRoleReadRepository,
    {
      provide: ROLE_READ_REPOSITORY,
      useExisting: TypeOrmRoleReadRepository,
    },
  ],
})
export class RolesModule {}
