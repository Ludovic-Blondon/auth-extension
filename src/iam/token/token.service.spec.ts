import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';

describe('TokenService', () => {
  it('should be defined', () => {
    const mockJwtService = {} as JwtService;
    const mockJwtConfig = {
      secret: 'test-secret',
      refreshSecret: 'test-refresh-secret',
      audience: 'test-audience',
      issuer: 'test-issuer',
      accessTokenTtl: 3600,
      refreshTokenTtl: 86400,
    };
    expect(new TokenService(mockJwtService, mockJwtConfig)).toBeDefined();
  });
});
