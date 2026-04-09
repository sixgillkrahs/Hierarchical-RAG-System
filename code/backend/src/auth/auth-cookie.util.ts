import type { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';

type SameSiteValue = CookieOptions['sameSite'];

function resolveSameSite(value: string): SameSiteValue {
  if (value === 'strict' || value === 'none' || value === 'lax') {
    return value;
  }

  return 'lax';
}

export function getAuthCookieName(configService: ConfigService): string {
  return configService.get<string>('AUTH_COOKIE_NAME') ?? 'access_token';
}

export function getAuthCookieOptions(
  configService: ConfigService,
): CookieOptions {
  const domain = configService.get<string>('AUTH_COOKIE_DOMAIN');

  return {
    httpOnly: true,
    secure: configService.get<boolean>('AUTH_COOKIE_SECURE') ?? false,
    sameSite: resolveSameSite(
      configService.get<string>('AUTH_COOKIE_SAME_SITE') ?? 'lax',
    ),
    maxAge: configService.get<number>('AUTH_COOKIE_MAX_AGE_MS') ?? 86_400_000,
    path: '/',
    ...(domain ? { domain } : {}),
  };
}
