import { UnauthorizedException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcryptjs';

import { AuthTokenService } from '../../auth-token.service';
import {
  AUTH_USER_REPOSITORY,
  type AuthUserRepository,
} from '../../domain/auth-user.repository';
import type { AuthProfile } from '../../domain/auth-profile';
import { LoginCommand } from '../commands/login.command';

type LoginResult = {
  message: string;
  refreshToken: string;
  success: boolean;
  token: string;
  user: AuthProfile;
};

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, LoginResult> {
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly authUserRepository: AuthUserRepository,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const email = command.email.trim().toLowerCase();
    const user = await this.authUserRepository.findProfileByEmail(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(
      command.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const profile: AuthProfile = {
      id: user.id,
      email: user.email,
      roles: [...user.roles].sort(),
      permissions: [...user.permissions].sort(),
      routes: [...user.routes].sort(),
    };

    const tokens = await this.authTokenService.createTokenPair(profile);

    return {
      success: true,
      message: 'Login successful.',
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: profile,
    };
  }
}
