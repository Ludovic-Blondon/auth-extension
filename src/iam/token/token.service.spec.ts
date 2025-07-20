import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';

describe('TokenService', () => {
  let tokenService: TokenService;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-token'),
      verifyAsync: jest
        .fn()
        .mockResolvedValue({ sub: 1, email: 'test@test.com' }),
    } as unknown as jest.Mocked<JwtService>;

    const mockJwtConfig = {
      secret: 'test-secret',
      refreshSecret: 'test-refresh-secret',
      audience: 'test-audience',
      issuer: 'test-issuer',
      accessTokenTtl: 3600,
      refreshTokenTtl: 86400,
    };

    tokenService = new TokenService(mockJwtService, mockJwtConfig);
  });

  it('should be defined', () => {
    expect(tokenService).toBeDefined();
  });

  it('should generate an access token', async () => {
    const token = await tokenService.generateAccessToken(1, {
      sub: 1,
      email: 'test@test.com',
    });
    expect(token).toBe('mock-token');
  });

  it('should generate a refresh token', async () => {
    const token = await tokenService.generateRefreshToken(
      1,
      'test-refresh-token',
    );
    expect(token).toBe('mock-token');
  });

  it('should verify an access token', async () => {
    const token = await tokenService.verifyAccessToken('mock-token');
    expect(token).toEqual({ sub: 1, email: 'test@test.com' });
  });

  it('should verify a refresh token', async () => {
    const token = await tokenService.verifyRefreshToken('mock-token');
    expect(token).toEqual({ sub: 1, email: 'test@test.com' });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });
});
