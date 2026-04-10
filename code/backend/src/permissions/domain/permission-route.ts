import { BadRequestException } from '@nestjs/common';

export function normalizePermissionRoute(route: string): string {
  const trimmedRoute = route.trim();

  if (!trimmedRoute) {
    throw new BadRequestException('Permission route must not be empty.');
  }

  if (!trimmedRoute.startsWith('/')) {
    throw new BadRequestException(
      'Permission route must start with "/".',
    );
  }

  if (trimmedRoute.length > 1 && trimmedRoute.endsWith('/')) {
    return trimmedRoute.slice(0, -1);
  }

  return trimmedRoute;
}
