import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionType } from '../permission.type';
import { Request } from 'express';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextPermissions = this.reflector.getAllAndOverride<
      PermissionType[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // If no permissions are required (undefined), allow access
    if (!contextPermissions) {
      return true;
    }

    // If permissions array is empty, deny access (requires permissions but none specified)
    if (contextPermissions.length === 0) {
      return false;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request[REQUEST_USER_KEY];

    // If user is not defined, deny access
    if (!user) {
      return false;
    }

    // Check if user has at least one of the required permissions
    return contextPermissions.some((permission) =>
      user.permissions?.includes(permission),
    );
  }
}
