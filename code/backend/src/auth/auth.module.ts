import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from '../common/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/auth/guards/permissions.guard';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { GetCurrentUserHandler } from './application/handlers/get-current-user.handler';
import { LoginHandler } from './application/handlers/login.handler';
import { AUTH_USER_REPOSITORY } from './domain/auth-user.repository';
import { TypeOrmAuthUserRepository } from './infrastructure/repositories/typeorm-auth-user.repository';
import { AuthController } from './presentation/http/auth.controller';
import { RbacSeedService } from './rbac-seed.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ??
          'change-this-in-development',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') ?? '1d',
        },
      }),
    }),
    TypeOrmModule.forFeature([User, Role, Permission]),
  ],
  controllers: [AuthController],
  providers: [
    LoginHandler,
    GetCurrentUserHandler,
    JwtStrategy,
    RbacSeedService,
    TypeOrmAuthUserRepository,
    {
      provide: AUTH_USER_REPOSITORY,
      useExisting: TypeOrmAuthUserRepository,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
