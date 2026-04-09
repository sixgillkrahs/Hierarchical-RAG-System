import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GetUsersHandler } from './application/handlers/get-users.handler';
import { USER_READ_REPOSITORY } from './domain/user-read.repository';
import { User } from './entities/user.entity';
import { TypeOrmUserReadRepository } from './infrastructure/repositories/typeorm-user-read.repository';
import { UsersController } from './presentation/http/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CqrsModule],
  controllers: [UsersController],
  providers: [
    GetUsersHandler,
    TypeOrmUserReadRepository,
    {
      provide: USER_READ_REPOSITORY,
      useExisting: TypeOrmUserReadRepository,
    },
  ],
})
export class UsersModule {}
