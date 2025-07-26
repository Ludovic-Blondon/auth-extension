import {
  ConflictException,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { AuthenticationService } from '../authentication.service';
import googleConfig from 'src/iam/config/google.config';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    @Inject(googleConfig.KEY)
    private readonly googleConfiguration: ConfigType<typeof googleConfig>,
    private readonly authService: AuthenticationService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  onModuleInit() {
    const clientId = this.googleConfiguration.googleClientId;
    const clientSecret = this.googleConfiguration.googleClientSecret;
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  async authenticate(token: string) {
    try {
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: token,
      });
      const payload = loginTicket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
      }
      const { email, sub: googleId } = payload;
      const user = await this.userRepository.findOneBy({ googleId });
      if (user) {
        return this.authService.generateTokens(user);
      } else {
        const newUser = await this.userRepository.save({ email, googleId });
        return this.authService.generateTokens(newUser);
      }
    } catch (err: unknown) {
      const pgUniqueViolationErrorCode = '23505';
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        err.code === pgUniqueViolationErrorCode
      ) {
        throw new ConflictException();
      }
      throw new UnauthorizedException();
    }
  }
}
