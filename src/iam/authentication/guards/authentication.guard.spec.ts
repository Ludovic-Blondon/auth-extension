import { AuthenticationGuard } from './authentication.guard';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from './access-token.guard';

describe('AuthenticationGuard', () => {
  it('should be defined', () => {
    const mockReflector = {} as Reflector;
    const mockAccessTokenGuard = {} as AccessTokenGuard;
    expect(
      new AuthenticationGuard(mockReflector, mockAccessTokenGuard),
    ).toBeDefined();
  });
});
