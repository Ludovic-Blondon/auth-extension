import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from './access-token.guard';
import { AuthType } from '../enums/auth-type.enum';
import { AUTH_TYPE_KEY } from '../decorators/auth.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.BEARER;
  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  >;

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.BEARER]: this.accessTokenGuard,
      [AuthType.NONE]: { canActivate: () => true },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];
    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();
    let error = new UnauthorizedException();

    for (const instance of guards) {
      const canActivate = await Promise.resolve(
        instance.canActivate(context),
      ).catch((err: unknown) => {
        error =
          err instanceof UnauthorizedException
            ? err
            : new UnauthorizedException();
      });

      if (canActivate) {
        return true;
      }
    }
    throw error;
  }
}
