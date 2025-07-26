import { Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage';
import { RedisModule } from '../redis/redis.module';
import { TokenModule } from './token/token.module';
import { RolesGuard } from './authorization/guards/roles.guard';
import { PermissionsGuard } from './authorization/guards/permissions.guard';
import { PolicyHandlersStorage } from './authorization/policies/policy-handlers.storage';
import { FrameworkContributorPolicyHandler } from './authorization/policies/framework-contributor.policy';
import { PoliciesGuard } from './authorization/guards/policies.guard';
import { OtpAuthenticationService } from './authentication/otp-authentication.service';
import { ConfigModule } from '@nestjs/config';
import tfaConfig from './config/tfa.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RedisModule,
    TokenModule,
    ConfigModule.forFeature(tfaConfig),
  ],
  providers: [
    { provide: HashingService, useClass: BcryptService },
    AuthenticationService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PoliciesGuard,
    },
    AccessTokenGuard,
    RefreshTokenIdsStorage,
    PolicyHandlersStorage,
    FrameworkContributorPolicyHandler,
    OtpAuthenticationService,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
