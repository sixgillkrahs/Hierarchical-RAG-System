import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from '../roles/entities/role.entity';
import { CreateUserHandler } from './application/handlers/create-user.handler';
import { DeleteUserHandler } from './application/handlers/delete-user.handler';
import { GetUserByIdHandler } from './application/handlers/get-user-by-id.handler';
import { GetUsersHandler } from './application/handlers/get-users.handler';
import { UpdateUserHandler } from './application/handlers/update-user.handler';
import { USER_REPOSITORY } from './domain/user.repository';
import { User } from './entities/user.entity';
import { TypeOrmUserReadRepository } from './infrastructure/repositories/typeorm-user-read.repository';
import { UsersController } from './presentation/http/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), CqrsModule],
  controllers: [UsersController],
  providers: [
    CreateUserHandler,
    DeleteUserHandler,
    GetUserByIdHandler,
    GetUsersHandler,
    UpdateUserHandler,
    TypeOrmUserReadRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: TypeOrmUserReadRepository,
    },
  ],
})
export class UsersModule {}
