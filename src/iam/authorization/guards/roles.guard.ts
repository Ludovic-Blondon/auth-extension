import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/role.decorator';
import { Role } from '../../../users/enums/role.enum';
import { REQUEST_USER_KEY } from '../../../iam/iam.constants';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!contextRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const user = request[REQUEST_USER_KEY];

    return contextRoles.some((role) => user?.role === role);
  }
}
