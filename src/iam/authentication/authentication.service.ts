import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/sign-up.dto';
import { HashingService } from '../hashing/hashing.service';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  InvalidatedRefreshTokenError,
  RefreshTokenIdsStorage,
} from './refresh-token-ids.storage';
import { randomUUID } from 'crypto';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const alreadyExists = await this.userRepository.findOne({
      where: { email: signUpDto.email },
    });

    if (alreadyExists) {
      throw new ConflictException();
    }

    const user = new User();
    user.email = signUpDto.email;
    user.password = await this.hashingService.hash(signUpDto.password);

    await this.userRepository.save(user);
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.userRepository.findOne({
      where: { email: signInDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return await this.generateTokens(user);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      const { sub, refreshTokenId } =
        await this.tokenService.verifyRefreshToken(refreshToken);

      const user = await this.userRepository.findOneOrFail({
        where: { id: sub },
      });

      const isRefreshTokenIdValid = await this.refreshTokenIdsStorage.validate(
        user.id,
        refreshTokenId,
      );

      if (isRefreshTokenIdValid) {
        await this.refreshTokenIdsStorage.invalidate(user.id);
      } else {
        throw new Error('Refresh token is invalid');
      }

      return await this.generateTokens(user);
    } catch (error) {
      if (error instanceof InvalidatedRefreshTokenError) {
        throw new UnauthorizedException('Access denied');
      }
      throw new UnauthorizedException();
    }
  }

  async generateTokens(user: User) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(user.id, {
        email: user.email,
        role: user.role,
      }),
      this.tokenService.generateRefreshToken(user.id, refreshTokenId),
    ]);

    await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);

    return {
      accessToken,
      refreshToken,
    };
  }
}
