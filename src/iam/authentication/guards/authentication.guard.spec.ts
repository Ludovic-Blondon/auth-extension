import { AuthenticationGuard } from './authentication.guard';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from './access-token.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AuthenticationGuard', () => {
  it('should be defined', () => {
    const mockReflector = {} as Reflector;
    const mockAccessTokenGuard = {} as AccessTokenGuard;
    expect(
      new AuthenticationGuard(mockReflector, mockAccessTokenGuard),
    ).toBeDefined();
  });

  it('canActivate should return true if the auth type is none', async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['None']),
    } as unknown as Reflector;
    const mockAccessTokenGuard = {} as AccessTokenGuard;
    const guard = new AuthenticationGuard(mockReflector, mockAccessTokenGuard);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer valid-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('canActivate should return true if the auth type is bearer', async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['Bearer']),
    } as unknown as Reflector;
    const mockAccessTokenGuard = {
      canActivate: jest.fn().mockResolvedValue(true),
    } as unknown as AccessTokenGuard;
    const guard = new AuthenticationGuard(mockReflector, mockAccessTokenGuard);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer valid-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('canActivate should throw UnauthorizedException if the auth type is bearer and the token is invalid', async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['Bearer']),
    } as unknown as Reflector;
    const mockAccessTokenGuard = {
      canActivate: jest.fn().mockResolvedValue(false),
    } as unknown as AccessTokenGuard;
    const guard = new AuthenticationGuard(mockReflector, mockAccessTokenGuard);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer invalid-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow('Unauthorized');
  });

  it('canActivate should throw UnauthorizedException if the auth type is bearer and the token is missing', async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['Bearer']),
    } as unknown as Reflector;
    const mockAccessTokenGuard = {
      canActivate: jest.fn().mockRejectedValue(new Error('Unauthorized')),
    } as unknown as AccessTokenGuard;
    const guard = new AuthenticationGuard(mockReflector, mockAccessTokenGuard);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;
    await expect(guard.canActivate(context)).rejects.toThrow('Unauthorized');
  });
});
