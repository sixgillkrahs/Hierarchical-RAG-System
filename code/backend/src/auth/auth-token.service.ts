import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import type { AuthProfile } from './domain/auth-profile';

type AuthTokenPayload = {
  email: string;
  permissions: string[];
  roles: string[];
  sub: string;
  type: 'access' | 'refresh';
};

export type AuthTokenPair = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createTokenPair(profile: AuthProfile): Promise<AuthTokenPair> {
    const payload = this.createPayload(profile);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({
        ...payload,
        type: 'access',
      }),
      this.jwtService.signAsync(
        {
          ...payload,
          type: 'refresh',
        },
        {
          secret: this.getRefreshTokenSecret(),
          expiresIn:
            this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyRefreshToken(token: string): Promise<AuthTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<AuthTokenPayload>(token, {
        secret: this.getRefreshTokenSecret(),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  private createPayload(profile: AuthProfile): Omit<AuthTokenPayload, 'type'> {
    return {
      sub: profile.id,
      email: profile.email,
      roles: profile.roles,
      permissions: profile.permissions,
    };
  }

  private getRefreshTokenSecret(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      'change-this-refresh-secret-in-development'
    );
  }
}
