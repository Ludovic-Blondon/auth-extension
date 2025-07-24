import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Type,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { POLICIES_KEY } from '../decorators/policies.decorator';
import { Policy } from '../policies/interfaces/policy.interface';
import { PolicyHandlersStorage } from '../policies/policy-handlers.storage';
import { Request } from 'express';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly policyHandlerStorage: PolicyHandlersStorage,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policies = this.reflector.getAllAndOverride<Policy[]>(POLICIES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (policies) {
      const request = context.switchToHttp().getRequest<Request>();
      const user = request[REQUEST_USER_KEY];

      await Promise.all(
        policies.map((policy) => {
          const policyHandler = this.policyHandlerStorage.get(
            policy.constructor as Type,
          );
          return policyHandler?.handle(policy, user);
        }),
      ).catch((err) => {
        throw new ForbiddenException(
          err instanceof Error ? err.message : 'An unknown error occurred',
        );
      });
    }
    return true;
  }
}
