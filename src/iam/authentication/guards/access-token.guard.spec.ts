import { TokenService } from 'src/iam/token/token.service';
import { AccessTokenGuard } from './access-token.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AccessTokenGuard', () => {
  it('should be defined', () => {
    const mockTokenService = {} as TokenService;
    expect(new AccessTokenGuard(mockTokenService)).toBeDefined();
  });

  it('canActivate should return true if the token is valid', async () => {
    const mockTokenService = {
      verifyAccessToken: jest.fn().mockResolvedValue({
        sub: 1,
        email: 'test@test.com',
      }),
    } as unknown as TokenService;
    const guard = new AccessTokenGuard(mockTokenService);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer valid-token',
          },
        }),
      }),
    } as ExecutionContext;
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('canActivate should throw an error if the token is invalid', async () => {
    const mockTokenService = {
      verifyAccessToken: jest
        .fn()
        .mockRejectedValue(new Error('Invalid token')),
    } as unknown as TokenService;
    const guard = new AccessTokenGuard(mockTokenService);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer invalid-token',
          },
        }),
      }),
    } as ExecutionContext;
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('canActivate should throw an error if the token is missing', async () => {
    const mockTokenService = {} as TokenService;
    const guard = new AccessTokenGuard(mockTokenService);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as ExecutionContext;
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
