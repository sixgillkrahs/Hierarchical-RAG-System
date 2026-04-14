import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { REQUIRED_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class PermissionsGuard {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const grantedPermissions = new Set(request.user?.permissions ?? []);
    const hasAccess = requiredPermissions.every((permission) =>
      this.hasPermission(grantedPermissions, permission),
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        `Missing required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }

  private hasPermission(
    grantedPermissions: Set<string>,
    requiredPermission: string,
  ): boolean {
    if (grantedPermissions.has(requiredPermission)) {
      return true;
    }

    if (requiredPermission.endsWith('.read')) {
      const managePermission = `${requiredPermission.slice(0, -'.read'.length)}.manage`;
      return grantedPermissions.has(managePermission);
    }

    return false;
  }
}
