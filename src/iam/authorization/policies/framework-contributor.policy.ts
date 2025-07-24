import { PolicyHandler } from './interfaces/policy-hadler.interface';
import { Policy } from './interfaces/policy.interface';
import { Injectable } from '@nestjs/common';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { ForbiddenException } from '@nestjs/common';
import { PolicyHandlersStorage } from './policy-handlers.storage';

export class FrameworkContributorPolicy implements Policy {
  name = 'frameworkContributor';
}

@Injectable()
export class FrameworkContributorPolicyHandler
  implements PolicyHandler<FrameworkContributorPolicy>
{
  constructor(private readonly policyHandlersStorage: PolicyHandlersStorage) {
    this.policyHandlersStorage.add(FrameworkContributorPolicy, this);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async handle(
    policy: FrameworkContributorPolicy,
    user: ActiveUserData,
  ): Promise<void> {
    const isContributor = user.email.endsWith('@gmail.com');
    if (!isContributor) {
      throw new ForbiddenException();
    }
  }
}
