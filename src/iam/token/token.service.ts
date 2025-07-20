import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import jwtConfig from '../config/jwt.config';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  private get accessTokenSecret(): string {
    return this.jwtConfiguration.secret!;
  }

  private get refreshTokenSecret(): string {
    return this.jwtConfiguration.refreshSecret!;
  }

  private get issuer(): string {
    return this.jwtConfiguration.issuer!;
  }

  private get audience(): string {
    return this.jwtConfiguration.audience!;
  }

  async generateAccessToken(
    userId: number,
    payload: Record<string, any>,
  ): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        secret: this.accessTokenSecret,
        expiresIn: this.jwtConfiguration.accessTokenTtl,
        issuer: this.issuer,
        audience: this.audience,
      },
    );
  }

  async generateRefreshToken(
    userId: number,
    refreshTokenId: string,
  ): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: userId,
        refreshTokenId,
      },
      {
        secret: this.refreshTokenSecret,
        expiresIn: this.jwtConfiguration.refreshTokenTtl,
        issuer: this.issuer,
        audience: this.audience,
      },
    );
  }

  async verifyAccessToken(token: string): Promise<ActiveUserData> {
    const payload = await this.jwtService.verifyAsync<ActiveUserData>(token, {
      secret: this.accessTokenSecret,
    });

    return payload;
  }

  async verifyRefreshToken(
    token: string,
  ): Promise<
    Pick<ActiveUserData, 'sub'> & { refreshTokenId: string; type: 'refresh' }
  > {
    const payload = await this.jwtService.verifyAsync<
      Pick<ActiveUserData, 'sub'> & { refreshTokenId: string; type: 'refresh' }
    >(token, {
      secret: this.refreshTokenSecret,
    });

    return payload;
  }
}
