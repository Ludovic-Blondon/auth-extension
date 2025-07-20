import { AccessTokenGuard } from './access-token.guard';
import { JwtService } from '@nestjs/jwt';

describe('AccessTokenGuard', () => {
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
    expect(new AccessTokenGuard(mockJwtService, mockJwtConfig)).toBeDefined();
  });
});
