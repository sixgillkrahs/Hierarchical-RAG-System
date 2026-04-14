import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';

import type { AuthenticatedUser } from '../../common/auth/interfaces/authenticated-user.interface';
import { getAuthCookieName } from '../auth-cookie.util';

type JwtPayload = {
  email: string;
  permissions: string[];
  roles: string[];
  sub: string;
  type?: 'access' | 'refresh';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const authCookieName = getAuthCookieName(configService);

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) =>
          ((request?.cookies?.[authCookieName] as string | undefined) ?? null),
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ?? 'change-this-in-development',
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    if (payload.type && payload.type !== 'access') {
      throw new UnauthorizedException('Invalid access token.');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
    };
  }
}
