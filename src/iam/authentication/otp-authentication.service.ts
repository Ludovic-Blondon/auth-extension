import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { authenticator } from 'otplib';
import tfaConfig from '../config/tfa.config';

@Injectable()
export class OtpAuthenticationService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(tfaConfig.KEY)
    private readonly tfaConfiguration: ConfigType<typeof tfaConfig>,
  ) {}

  generateSecret(email: string) {
    const secret = authenticator.generateSecret();
    const appName = this.tfaConfiguration.appName;
    const uri = authenticator.keyuri(email, appName, secret);
    return {
      uri,
      secret,
    };
  }

  verifyCode(code: string, secret: string) {
    return authenticator.verify({
      token: code,
      secret,
    });
  }

  async enableTfaForUser(email: string, secret: string) {
    const { id } = await this.userRepository.findOneOrFail({
      where: { email },
      select: { id: true },
    });
    await this.userRepository.update(
      { id },
      // TIP: Ideally, we would want to encrypt the "secret" instead of
      // storing it in a plaintext. Note - we couldn't use hashing here as
      // the original secret is required to verify the user's provided code.
      { tfaSecret: secret, isTfaEnabled: true },
    );
  }
}
